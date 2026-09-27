import { NextResponse } from 'next/server';
import { getTournamentBySlug, saveTournament, deleteTournament } from '@/lib/storage';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tournament = getTournamentBySlug(params.id);
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
  try {
    const body = await request.json();
    const existing = getTournamentBySlug(params.id);
    if (!existing) {
      return NextResponse.json({ error: 'Tournoi introuvable' }, { status: 404 });
    }

    const updated = { ...existing, ...body };
    saveTournament(updated);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const existing = getTournamentBySlug(params.id);
    if (!existing) {
      return NextResponse.json({ error: 'Tournoi introuvable' }, { status: 404 });
    }
    deleteTournament(existing.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
