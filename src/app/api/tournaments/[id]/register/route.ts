import { NextResponse } from 'next/server';
import { registerPlayerToTournament } from '@/lib/storage';
import { validateRegistrationInput } from '@/lib/validation';
import { syncRegistrationToSupabase } from '@/lib/supabase-service';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Strict validation
    const validation = validateRegistrationInput(body);
    if (!validation.isValid || !validation.data) {
      const firstErrorMessage = Object.values(validation.errors)[0] || 'Données du formulaire invalides';
      return NextResponse.json({ 
        error: firstErrorMessage, 
        details: validation.errors 
      }, { status: 400 });
    }

    const { nom, prenom, fideId, dateNaissance, telephone, email, club, notes } = validation.data;

    const result = registerPlayerToTournament(params.id, {
      nom,
      prenom,
      fideId: fideId || '',
      dateNaissance: dateNaissance || '',
      telephone,
      email: email || '',
      club: club || 'Indépendant',
      notes: notes || ''
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    if (result.registration) {
      // Background sync to Supabase if configured
      syncRegistrationToSupabase(params.id, result.registration).catch(() => {});
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    const message = error instanceof Error ? error.message : 'Erreur lors de l\'inscription.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
