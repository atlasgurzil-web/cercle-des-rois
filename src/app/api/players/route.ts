import { NextResponse } from 'next/server';
import { getAllPlayers, savePlayer, deletePlayer } from '@/lib/storage';
import { DirectoryPlayer } from '@/types';

export async function GET() {
  try {
    const players = getAllPlayers();
    return NextResponse.json(players);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors du chargement de l\'annuaire' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newPlayer: DirectoryPlayer = {
      id: `cdr-player-${Date.now()}`,
      nom: (body.nom || 'Joueur').trim().toUpperCase(),
      prenom: (body.prenom || '').trim(),
      nomComplet: `${(body.nom || 'Joueur').trim().toUpperCase()} ${(body.prenom || '').trim()}`.trim(),
      sexe: body.sexe || 'M',
      dateNaissance: body.dateNaissance || '',
      telephone: body.telephone || '',
      email: body.email || '',
      club: body.club || 'Indépendant',
      fideId: body.fideId || '',
      elo: Number(body.elo) || 0,
      nbTournois: Number(body.nbTournois) || 0,
      bestRank: body.bestRank || null,
      tournoisParticipes: body.tournoisParticipes || []
    };

    savePlayer(newPlayer);
    return NextResponse.json(newPlayer, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création du joueur' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'ID du joueur requis' }, { status: 400 });
    }

    const updatedPlayer: DirectoryPlayer = {
      id: body.id,
      nom: (body.nom || '').trim().toUpperCase(),
      prenom: (body.prenom || '').trim(),
      nomComplet: `${(body.nom || '').trim().toUpperCase()} ${(body.prenom || '').trim()}`.trim(),
      sexe: body.sexe || 'M',
      dateNaissance: body.dateNaissance || '',
      telephone: body.telephone || '',
      email: body.email || '',
      club: body.club || 'Indépendant',
      fideId: body.fideId || '',
      elo: Number(body.elo) || 0,
      nbTournois: Number(body.nbTournois) || 0,
      bestRank: body.bestRank || null,
      tournoisParticipes: body.tournoisParticipes || []
    };

    savePlayer(updatedPlayer);
    return NextResponse.json(updatedPlayer);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du joueur' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      const body = await request.json().catch(() => ({}));
      if (!body.id) {
        return NextResponse.json({ error: 'ID du joueur requis' }, { status: 400 });
      }
      deletePlayer(body.id);
      return NextResponse.json({ success: true });
    }

    deletePlayer(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression du joueur' }, { status: 500 });
  }
}
