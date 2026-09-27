import { NextResponse } from 'next/server';
import { registerPlayerToTournament } from '@/lib/storage';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { nom, prenom, fideId, dateNaissance, telephone, email, club, notes } = body;

    if (!nom || !prenom || !telephone) {
      return NextResponse.json(
        { error: 'Le nom, le prénom et le numéro de téléphone sont obligatoires.' },
        { status: 400 }
      );
    }

    const result = registerPlayerToTournament(params.id, {
      nom,
      prenom,
      fideId,
      dateNaissance: dateNaissance || '',
      telephone,
      email: email || '',
      club: club || 'Indépendant',
      notes
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de l\'inscription.' }, { status: 500 });
  }
}
