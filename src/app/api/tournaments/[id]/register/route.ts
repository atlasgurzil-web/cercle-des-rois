import { NextResponse } from 'next/server';
import { registerPlayerToTournament } from '@/lib/storage';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { nom, prenom, fideId, dateNaissance, telephone, email, club, notes } = body;

    const safeNom = (nom || prenom || 'Joueur').trim();
    const safePrenom = (prenom || '').trim();

    const result = registerPlayerToTournament(params.id, {
      nom: safeNom,
      prenom: safePrenom,
      fideId: fideId || '',
      dateNaissance: dateNaissance || '',
      telephone: telephone || '',
      email: email || '',
      club: club || 'Indépendant',
      notes: notes || ''
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ error: error?.message || 'Erreur lors de l\'inscription.' }, { status: 500 });
  }
}
