import { NextResponse } from 'next/server';
import { getAllTournaments, saveTournament } from '@/lib/storage';
import { Tournament } from '@/types';

export async function GET() {
  try {
    const tournaments = getAllTournaments();
    return NextResponse.json(tournaments);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors du chargement des tournois' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, date, time, location, cadence, maxParticipants, rounds, fee, feeDescription, prizes, description, rules, isOnline, onlineUrl } = body;

    if (!title || !date || !location) {
      return NextResponse.json({ error: 'Champs obligatoires manquants (titre, date, lieu)' }, { status: 400 });
    }

    const tournaments = getAllTournaments();
    const nextEdition = (tournaments.reduce((max, t) => Math.max(max, t.edition || 0), 0)) + 1;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `cdr-${nextEdition}`;

    const newTournament: Tournament = {
      id: `cdr-${Date.now()}`,
      edition: nextEdition,
      title,
      slug,
      date,
      dateFormatted: new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: time || '20:30 (Après Isha)',
      location,
      isOnline: !!isOnline,
      onlineUrl: onlineUrl || '',
      rounds: parseInt(rounds) || 7,
      cadence: cadence || 'Blitz 5m + 3s',
      type: 'Système suisse amical',
      maxParticipants: parseInt(maxParticipants) || 32,
      fee: parseFloat(fee) || 0,
      feeDescription: feeDescription || (parseFloat(fee) > 0 ? `${fee} DZD sur place` : 'Gratuit'),
      prizes: prizes || 'Trophées & Médailles Le Cercle des Rois',
      description: description || 'Rendez-vous mensuel des passionnés d\'échecs d\'Annaba.',
      rules: rules || 'Système suisse, fair-play et convivialité.',
      isArchived: false,
      organizer: 'Le Cercle des Rois (Hamra & AUCA)',
      registeredPlayers: []
    };

    const saved = saveTournament(newTournament);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création du tournoi' }, { status: 500 });
  }
}
