import { redirect } from 'next/navigation';
import { getUpcomingTournaments } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export default function InscriptionRedirectPage() {
  const upcoming = getUpcomingTournaments();
  const latest = upcoming[0];
  if (latest) {
    redirect(`/tournoi/${latest.slug}#inscription`);
  }
  redirect('/tournois');
}
