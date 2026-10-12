import { NextResponse } from 'next/server';
import { registerPlayerToTournament } from '@/lib/storage';
import { validateRegistrationInput } from '@/lib/validation';
import { syncRegistrationToSupabase, syncPlayerToSupabase } from '@/lib/supabase-service';

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
      // Synchronous, guaranteed write to Supabase
      const syncResult = await syncRegistrationToSupabase(params.id, result.registration);
      if (!syncResult.success) {
        console.error('[CRITICAL] Inscription enregistrée localement mais échec de synchronisation Supabase:', syncResult.error);
      }

      // Synchronize player to directory in Supabase
      await syncPlayerToSupabase({
        id: `cdr-player-${Date.now()}`,
        nom: result.registration.nom,
        prenom: result.registration.prenom || '',
        nomComplet: `${result.registration.nom} ${result.registration.prenom || ''}`.trim(),
        club: result.registration.club || 'Indépendant',
        elo: result.registration.eloFide || 0,
        fideId: result.registration.fideId || '',
        telephone: result.registration.telephone || '',
        email: result.registration.email || '',
        dateNaissance: result.registration.dateNaissance || '',
        nbTournois: 1,
        bestRank: null,
        sexe: 'M',
        tournoisParticipes: []
      });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    const message = error instanceof Error ? error.message : 'Erreur lors de l\'inscription.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
