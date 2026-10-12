import { Metadata } from 'next';
import { getTournamentBySlugAsync } from '@/lib/storage';
import TournamentDetailClient from './TournamentDetailClient';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tournament = await getTournamentBySlugAsync(params.slug);
  if (!tournament) {
    return {
      title: "Tournoi d'échecs introuvable | Le Cercle des Rois — Annaba",
      description: "Plateforme officielle des tournois d'échecs du Cercle des Rois à Annaba."
    };
  }

  const title = `${tournament.title} | Le Cercle des Rois — Annaba`;
  const description = `${tournament.description || "Fiche officielle du tournoi."} Cadence : ${tournament.cadence}. Lieu : ${tournament.location}. Inscriptions ouvertes.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://cercledesrois.dz/tournoi/${params.slug}`,
      siteName: 'Le Cercle des Rois',
      images: [
        {
          url: '/og-image.jpg',
          width: 800,
          height: 800,
          alt: `Logo Cercle des Rois - ${tournament.title}`,
        },
      ],
      locale: 'fr_FR',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.jpg'],
    }
  };
}

export default async function TournamentDetailPage({ params }: Props) {
  const initialTournament = (await getTournamentBySlugAsync(params.slug)) || null;
  return <TournamentDetailClient slug={params.slug} initialTournament={initialTournament} />;
}
