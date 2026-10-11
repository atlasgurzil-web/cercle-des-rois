import { NextResponse } from 'next/server';
import { 
  togglePlayerCheckIn, 
  togglePlayerPaid, 
  removeRegistration, 
  promoteWaitlistPlayer,
  getTournamentBySlug, 
  saveTournament 
} from '@/lib/storage';
import { verifyAdminRequest } from '@/lib/auth';
import { 
  updateRegistrationInSupabase, 
  deleteRegistrationFromSupabase, 
  syncTournamentToSupabase 
} from '@/lib/supabase-service';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Enforce server-side admin authentication
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: 'Accès non autorisé : session organisateur requise.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, registrationId, podium, standings } = body;

    const tournament = getTournamentBySlug(params.id);
    if (!tournament) {
      return NextResponse.json({ error: 'Tournoi introuvable' }, { status: 404 });
    }

    if (action === 'checkin') {
      const ok = togglePlayerCheckIn(tournament.id, registrationId);
      const updated = getTournamentBySlug(tournament.id)?.registeredPlayers?.find(p => p.id === registrationId);
      if (updated) {
        updateRegistrationInSupabase(registrationId, { isCheckedIn: updated.isCheckedIn }).catch(() => {});
      }
      return NextResponse.json({ success: ok });
    }

    if (action === 'paid') {
      const ok = togglePlayerPaid(tournament.id, registrationId);
      const updated = getTournamentBySlug(tournament.id)?.registeredPlayers?.find(p => p.id === registrationId);
      if (updated) {
        updateRegistrationInSupabase(registrationId, { isPaid: updated.isPaid }).catch(() => {});
      }
      return NextResponse.json({ success: ok });
    }

    if (action === 'promote') {
      const ok = promoteWaitlistPlayer(tournament.id, registrationId);
      const updated = getTournamentBySlug(tournament.id)?.registeredPlayers?.find(p => p.id === registrationId);
      if (updated) {
        updateRegistrationInSupabase(registrationId, { 
          status: 'confirmed', 
          dossardNumber: updated.dossardNumber, 
          waitlistRank: null 
        }).catch(() => {});
      }
      return NextResponse.json({ success: ok });
    }

    if (action === 'remove') {
      const ok = removeRegistration(tournament.id, registrationId);
      deleteRegistrationFromSupabase(registrationId).catch(() => {});
      return NextResponse.json({ success: ok });
    }

    if (action === 'archive') {
      tournament.isArchived = true;
      if (podium) tournament.podium = podium;
      if (standings) tournament.standings = standings;
      saveTournament(tournament);
      syncTournamentToSupabase(tournament).catch(() => {});
      return NextResponse.json({ success: true, tournament });
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
