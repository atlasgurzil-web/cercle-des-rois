import { getSupabaseServerClient, isSupabaseConfigured } from './supabase';
import { Tournament, PlayerRegistration, DirectoryPlayer } from '@/types';

/**
 * Service to synchronize and retrieve data with Supabase PostgreSQL
 */

// ---------------- READ OPERATIONS ----------------

export async function fetchTournamentsFromSupabase(): Promise<Tournament[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const client = getSupabaseServerClient();
    if (!client) return null;

    const { data: tourneys, error: tErr } = await client
      .from('tournaments')
      .select('*')
      .order('edition', { ascending: false });

    if (tErr || !tourneys) {
      console.warn('[Supabase] Error fetching tournaments:', tErr);
      return null;
    }

    const { data: regs, error: rErr } = await client
      .from('registrations')
      .select('*')
      .order('dossard_number', { ascending: true, nullsFirst: false });

    if (rErr) {
      console.warn('[Supabase] Warning fetching registrations:', rErr);
    }

    const allRegs = (regs || []).map((r: any): PlayerRegistration => ({
      id: r.id,
      nom: r.nom,
      prenom: r.prenom || '',
      telephone: r.telephone || '',
      club: r.club || 'Indépendant',
      email: r.email || '',
      fideId: r.fide_id || '',
      dateNaissance: r.date_naissance || '',
      eloFide: r.elo_fide || 0,
      status: r.status,
      dossardNumber: r.dossard_number ?? undefined,
      waitlistRank: r.waitlist_rank ?? undefined,
      isCheckedIn: Boolean(r.is_checked_in),
      isPaid: Boolean(r.is_paid),
      notes: r.notes || '',
      registeredAt: r.registered_at
    }));

    return tourneys.map((t: any): Tournament => {
      const tourneyRegs = allRegs.filter((r: any) => r.tournament_id === t.id);
      return {
        id: t.id,
        edition: t.edition,
        title: t.title,
        slug: t.slug,
        date: t.date,
        dateFormatted: t.date_formatted,
        time: t.time,
        location: t.location,
        isOnline: false,
        rounds: t.rounds,
        cadence: t.cadence,
        type: t.type || 'Système suisse amical',
        maxParticipants: t.max_participants,
        fee: parseFloat(t.fee) || 0,
        feeDescription: t.fee_description || 'Gratuit',
        prizes: t.prizes || '',
        description: t.description || '',
        rules: t.rules || '',
        chessResultsUrl: t.chess_results_url || '',
        isArchived: Boolean(t.is_archived),
        organizer: 'Le Cercle des Rois (Hamra & AUCA)',
        registeredPlayers: tourneyRegs
      };
    });
  } catch (err) {
    console.warn('[Supabase Fetch Tournaments Error]:', err);
    return null;
  }
}

export async function fetchTournamentBySlugFromSupabase(slugOrId: string): Promise<Tournament | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const client = getSupabaseServerClient();
    if (!client) return null;

    const { data: t, error: tErr } = await client
      .from('tournaments')
      .select('*')
      .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
      .single();

    if (tErr || !t) return null;

    const { data: regs } = await client
      .from('registrations')
      .select('*')
      .eq('tournament_id', t.id)
      .order('dossard_number', { ascending: true, nullsFirst: false });

    const tourneyRegs: PlayerRegistration[] = (regs || []).map((r: any) => ({
      id: r.id,
      nom: r.nom,
      prenom: r.prenom || '',
      telephone: r.telephone || '',
      club: r.club || 'Indépendant',
      email: r.email || '',
      fideId: r.fide_id || '',
      dateNaissance: r.date_naissance || '',
      eloFide: r.elo_fide || 0,
      status: r.status,
      dossardNumber: r.dossard_number ?? undefined,
      waitlistRank: r.waitlist_rank ?? undefined,
      isCheckedIn: Boolean(r.is_checked_in),
      isPaid: Boolean(r.is_paid),
      notes: r.notes || '',
      registeredAt: r.registered_at
    }));

    return {
      id: t.id,
      edition: t.edition,
      title: t.title,
      slug: t.slug,
      date: t.date,
      dateFormatted: t.date_formatted,
      time: t.time,
      location: t.location,
      isOnline: false,
      rounds: t.rounds,
      cadence: t.cadence,
      type: t.type || 'Système suisse amical',
      maxParticipants: t.max_participants,
      fee: parseFloat(t.fee) || 0,
      feeDescription: t.fee_description || 'Gratuit',
      prizes: t.prizes || '',
      description: t.description || '',
      rules: t.rules || '',
      chessResultsUrl: t.chess_results_url || '',
      isArchived: Boolean(t.is_archived),
      organizer: 'Le Cercle des Rois (Hamra & AUCA)',
      registeredPlayers: tourneyRegs
    };
  } catch (err) {
    console.warn('[Supabase Fetch Tournament Error]:', err);
    return null;
  }
}

export async function fetchPlayersFromSupabase(): Promise<DirectoryPlayer[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const client = getSupabaseServerClient();
    if (!client) return null;

    const { data, error } = await client
      .from('players')
      .select('*')
      .order('elo', { ascending: false });

    if (error || !data) return null;

    return data.map((p: any): DirectoryPlayer => ({
      id: p.id,
      nomComplet: p.nom_complet,
      nom: p.nom,
      prenom: p.prenom || '',
      club: p.club || 'Indépendant',
      elo: p.elo || 0,
      fideId: p.fide_id || '',
      telephone: p.telephone || '',
      email: p.email || '',
      dateNaissance: p.date_naissance || '',
      nbTournois: p.tournois_joues || 0,
      bestRank: p.meilleur_classement || null,
      sexe: 'M',
      tournoisParticipes: []
    }));
  } catch (err) {
    console.warn('[Supabase Fetch Players Error]:', err);
    return null;
  }
}

// ---------------- WRITE / MUTATION OPERATIONS ----------------

export async function syncRegistrationToSupabase(tournamentIdOrSlug: string, reg: PlayerRegistration) {
  if (!isSupabaseConfigured()) return;
  try {
    const client = getSupabaseServerClient();
    if (!client) return;

    let targetTournamentId = tournamentIdOrSlug;
    if (!targetTournamentId.startsWith('cdr-')) {
      const { data: tourney } = await client
        .from('tournaments')
        .select('id')
        .eq('slug', tournamentIdOrSlug)
        .maybeSingle();
      if (tourney?.id) {
        targetTournamentId = tourney.id;
      }
    }

    await client.from('registrations').upsert({
      id: reg.id,
      tournament_id: targetTournamentId,
      nom: reg.nom,
      prenom: reg.prenom || '',
      telephone: reg.telephone || '',
      club: reg.club || 'Indépendant',
      email: reg.email || '',
      fide_id: reg.fideId || '',
      date_naissance: reg.dateNaissance || '',
      elo_fide: reg.eloFide || 0,
      status: reg.status,
      dossard_number: reg.dossardNumber || null,
      waitlist_rank: reg.waitlistRank || null,
      is_checked_in: Boolean(reg.isCheckedIn),
      is_paid: Boolean(reg.isPaid),
      notes: reg.notes || '',
      registered_at: reg.registeredAt || new Date().toISOString()
    });
  } catch (err) {
    console.warn('[Supabase Sync Warning] Could not sync registration:', err);
  }
}

export async function updateRegistrationInSupabase(
  registrationId: string, 
  updates: {
    isCheckedIn?: boolean;
    isPaid?: boolean;
    status?: string;
    dossardNumber?: number;
    waitlistRank?: number | null;
  }
) {
  if (!isSupabaseConfigured()) return;
  try {
    const client = getSupabaseServerClient();
    if (!client) return;

    const payload: Record<string, unknown> = {};
    if (typeof updates.isCheckedIn === 'boolean') payload.is_checked_in = updates.isCheckedIn;
    if (typeof updates.isPaid === 'boolean') payload.is_paid = updates.isPaid;
    if (updates.status) payload.status = updates.status;
    if (typeof updates.dossardNumber === 'number') payload.dossard_number = updates.dossardNumber;
    if (updates.waitlistRank !== undefined) payload.waitlist_rank = updates.waitlistRank;

    await client.from('registrations').update(payload).eq('id', registrationId);
  } catch (err) {
    console.warn('[Supabase Update Registration Warning]:', err);
  }
}

export async function deleteRegistrationFromSupabase(registrationId: string) {
  if (!isSupabaseConfigured()) return;
  try {
    const client = getSupabaseServerClient();
    if (!client) return;

    await client.from('registrations').delete().eq('id', registrationId);
  } catch (err) {
    console.warn('[Supabase Delete Registration Warning]:', err);
  }
}

export async function syncTournamentToSupabase(tournament: Tournament) {
  if (!isSupabaseConfigured()) return;
  try {
    const client = getSupabaseServerClient();
    if (!client) return;

    await client.from('tournaments').upsert({
      id: tournament.id,
      edition: tournament.edition,
      title: tournament.title,
      slug: tournament.slug,
      date: tournament.date,
      date_formatted: tournament.dateFormatted,
      time: tournament.time,
      location: tournament.location,
      cadence: tournament.cadence,
      rounds: tournament.rounds,
      max_participants: tournament.maxParticipants,
      is_archived: Boolean(tournament.isArchived),
      description: tournament.description || '',
      rules: tournament.rules || '',
      fee: String(tournament.fee ?? 0),
      fee_description: tournament.feeDescription || '',
      prizes: tournament.prizes || '',
      chess_results_url: tournament.chessResultsUrl || ''
    });
  } catch (err) {
    console.warn('[Supabase Sync Warning] Could not sync tournament:', err);
  }
}

export async function deleteTournamentFromSupabase(tournamentId: string) {
  if (!isSupabaseConfigured()) return;
  try {
    const client = getSupabaseServerClient();
    if (!client) return;

    await client.from('tournaments').delete().eq('id', tournamentId);
  } catch (err) {
    console.warn('[Supabase Delete Tournament Warning]:', err);
  }
}

export async function syncPlayerToSupabase(player: DirectoryPlayer) {
  if (!isSupabaseConfigured()) return;
  try {
    const client = getSupabaseServerClient();
    if (!client) return;

    await client.from('players').upsert({
      id: player.id,
      nom_complet: player.nomComplet,
      nom: player.nom,
      prenom: player.prenom || '',
      club: player.club || 'Indépendant',
      elo: player.elo || 0,
      fide_id: player.fideId || '',
      telephone: player.telephone || '',
      email: player.email || '',
      date_naissance: player.dateNaissance || '',
      tournois_joues: player.nbTournois || 0,
      meilleur_classement: player.bestRank ? String(player.bestRank) : ''
    });
  } catch (err) {
    console.warn('[Supabase Sync Warning] Could not sync player:', err);
  }
}

export async function deletePlayerFromSupabase(playerId: string) {
  if (!isSupabaseConfigured()) return;
  try {
    const client = getSupabaseServerClient();
    if (!client) return;

    await client.from('players').delete().eq('id', playerId);
  } catch (err) {
    console.warn('[Supabase Delete Player Warning]:', err);
  }
}
