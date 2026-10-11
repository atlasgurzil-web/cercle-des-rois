import { getSupabaseServerClient, isSupabaseConfigured } from './supabase';
import { Tournament, PlayerRegistration, DirectoryPlayer } from '@/types';

/**
 * Service to synchronize data with Supabase PostgreSQL
 */
export async function syncRegistrationToSupabase(tournamentId: string, reg: PlayerRegistration) {
  if (!isSupabaseConfigured()) return;
  try {
    const client = getSupabaseServerClient();
    if (!client) return;

    await client.from('registrations').upsert({
      id: reg.id,
      tournament_id: tournamentId,
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
      fee: tournament.fee || '0',
      fee_description: tournament.feeDescription || '',
      prizes: tournament.prizes || '',
      chess_results_url: tournament.chessResultsUrl || ''
    });
  } catch (err) {
    console.warn('[Supabase Sync Warning] Could not sync tournament:', err);
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
      tournois_joues: player.tournoisJoues || 0,
      meilleur_classement: player.meilleurClassement || ''
    });
  } catch (err) {
    console.warn('[Supabase Sync Warning] Could not sync player:', err);
  }
}
