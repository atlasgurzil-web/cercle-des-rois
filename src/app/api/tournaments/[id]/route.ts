import { NextResponse } from 'next/server';
import { 
  getTournamentBySlug, 
  getTournamentBySlugAsync, 
  saveTournament, 
  deleteTournament 
} from '@/lib/storage';
import { verifyAdminRequest } from '@/lib/auth';
import { syncTournamentToSupabase, deleteTournamentFromSupabase } from '@/lib/supabase-service';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tournament = await getTournamentBySlugAsync(params.id);
    if (!tournament) {
      return NextResponse.json({ error: 'Tournoi introuvable' }, { status: 404 });
    }
    return NextResponse.json(tournament);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Enforce server-side admin authentication
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: 'Accès non autorisé : code PIN ou session organisateur requis.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const existing = getTournamentBySlug(params.id);
    if (!existing) {
      return NextResponse.json({ error: 'Tournoi introuvable' }, { status: 404 });
    }

    const updated = { ...existing, ...body };
    saveTournament(updated);
    syncTournamentToSupabase(updated).catch(() => {});
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Enforce server-side admin authentication
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: 'Accès non autorisé : code PIN ou session organisateur requis.' }, { status: 401 });
  }

  try {
    const existing = getTournamentBySlug(params.id);
    if (!existing) {
      return NextResponse.json({ error: 'Tournoi introuvable' }, { status: 404 });
    }
    deleteTournament(existing.id);
    deleteTournamentFromSupabase(existing.id).catch(() => {});
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
