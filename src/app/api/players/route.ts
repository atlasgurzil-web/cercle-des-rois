import { NextResponse } from 'next/server';
import { getAllPlayers } from '@/lib/storage';

export async function GET() {
  try {
    const players = getAllPlayers();
    return NextResponse.json(players);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors du chargement de l\'annuaire' }, { status: 500 });
  }
}
