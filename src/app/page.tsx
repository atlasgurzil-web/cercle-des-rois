import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  ChevronRight, 
  Flame, 
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { getUpcomingTournaments, getArchivedTournaments, getAllPlayers } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const upcomingTournaments = getUpcomingTournaments();
  const archivedTournaments = getArchivedTournaments();
  const allPlayers = getAllPlayers();
  const activeTournament = upcomingTournaments[0];

  const confirmedPlayers = activeTournament?.registeredPlayers?.filter(p => p.status === 'confirmed') || [];
  const spotsLeft = activeTournament ? Math.max(0, activeTournament.maxParticipants - confirmedPlayers.length) : 0;
  const fillPercentage = activeTournament ? Math.min(100, Math.round((confirmedPlayers.length / activeTournament.maxParticipants) * 100)) : 0;

  return (
    <div className="min-h-screen space-y-24 pb-20">

      {/* ─── Hero Section Épurée & Prestigieuse ─── */}
      <section className="relative pt-32 sm:pt-40 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Colonne Gauche : Présentation & Titre */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            {/* Badge officiel noble */}
            <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-noir-850/80 border border-white/10 backdrop-blur-md">
              <div className="relative w-6 h-6 rounded-full overflow-hidden border border-gold-500/50 flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Logo officiel Le Cercle des Rois"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <span className="text-xs font-medium text-slate-300">
                Échiquier d'Annaba <span className="text-gold-500 mx-1">·</span> Cercle Indépendant
              </span>
            </div>

            {/* Titre Principal */}
            <div className="space-y-4">
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-white tracking-tight leading-[1.08]">
                Le Cercle des <span className="text-gold-400 italic">Rois</span>.
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-light">
                La plateforme indépendante des passionnés du noble jeu à Annaba.
                Préservée par les anciens du Hamra et de l'AUCA : des tournois amicaux
                chaque premier jeudi du mois, après la prière d'Isha.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {activeTournament ? (
                <Link 
                  href={`/tournoi/${activeTournament.slug}#inscription`}
                  className="btn-gold"
                >
                  <span>S'inscrire à l'Édition #{activeTournament.edition}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link href="/tournois" className="btn-gold">
                  <span>Voir les Tournois</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              <Link 
                href="/archives" 
                className="btn-secondary"
              >
                <span>Consulter les Archives</span>
              </Link>
            </div>

            {/* Caractéristiques rapides */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs text-slate-400">
              <div className="space-y-1">
                <span className="text-slate-500 block uppercase font-mono tracking-wider text-[10px]">Périodicité</span>
                <span className="text-slate-200 font-medium">1ᵉʳ jeudi du mois</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 block uppercase font-mono tracking-wider text-[10px]">Horaire</span>
                <span className="text-slate-200 font-medium">20:30 (Après Isha)</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 block uppercase font-mono tracking-wider text-[10px]">Cadence</span>
                <span className="text-slate-200 font-medium">Blitz 5 min + 3 sec</span>
              </div>
            </div>

          </div>

          {/* Colonne Droite : Carte Épurée de la Prochaine Édition */}
          <div className="lg:col-span-5">
            {activeTournament ? (
              <div className="card-royal p-6 sm:p-8 space-y-6 relative overflow-hidden bg-gradient-to-b from-noir-850 to-noir-900 border-gold-500/20">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Inscriptions Ouvertes
                  </span>
                  <span className="text-xs font-mono text-gold-400 font-semibold px-2.5 py-1 rounded bg-gold-500/10 border border-gold-500/20">
                    Édition #{activeTournament.edition}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                    {activeTournament.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {activeTournament.description}
                  </p>
                </div>

                <div className="space-y-3 py-2 text-xs text-slate-300">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gold-400 flex-shrink-0" />
                    <span>{activeTournament.dateFormatted}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gold-400 flex-shrink-0" />
                    <span>{activeTournament.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0" />
                    <span>{activeTournament.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Flame className="w-4 h-4 text-gold-400 flex-shrink-0" />
                    <span>{activeTournament.cadence} · 7 Rondes Système Suisse</span>
                  </div>
                </div>

                {/* Jauge de remplissage */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-slate-300">Table des inscriptions</span>
                    <span className="text-gold-400 font-mono">
                      {confirmedPlayers.length} / {activeTournament.maxParticipants} inscrits ({spotsLeft} places)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-noir-950 overflow-hidden border border-white/10">
                    <div 
                      className="h-full bg-gold-500 transition-all duration-500"
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={`/tournoi/${activeTournament.slug}#inscription`}
                  className="w-full btn-gold !py-3 !rounded-xl text-center block text-sm"
                >
                  Réserver ma place autour des échiquiers →
                </Link>
              </div>
            ) : (
              <div className="card-royal p-8 text-center space-y-4">
                <Calendar className="w-10 h-10 text-gold-400 mx-auto" />
                <h3 className="font-serif text-xl font-bold text-white">Prochaine Édition en Préparation</h3>
                <p className="text-xs text-slate-400">
                  Rendez-vous le premier jeudi du mois prochain après Isha. Consultez l'annuaire ou le palmarès en attendant.
                </p>
                <Link href="/archives" className="btn-secondary !py-2 !text-xs inline-block">
                  Voir les éditions passées
                </Link>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ─── Statistiques Clés du Club ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-royal p-6 space-y-2 text-center md:text-left">
            <span className="text-xs uppercase tracking-wider font-mono text-slate-400">Membres Répertoriés</span>
            <div className="flex items-baseline gap-2 justify-center md:justify-start">
              <span className="font-serif text-4xl sm:text-5xl font-bold text-white">{allPlayers.length}</span>
              <span className="text-xs text-gold-400 font-medium">joueurs d'Annaba</span>
            </div>
            <p className="text-xs text-slate-400">
              Anciens sociétaires du Hamra, de l'AUCA et nouvelle génération réunis.
            </p>
          </div>

          <div className="card-royal p-6 space-y-2 text-center md:text-left">
            <span className="text-xs uppercase tracking-wider font-mono text-slate-400">Éditions Homologuées</span>
            <div className="flex items-baseline gap-2 justify-center md:justify-start">
              <span className="font-serif text-4xl sm:text-5xl font-bold text-white">{archivedTournaments.length}</span>
              <span className="text-xs text-gold-400 font-medium">tournois disputés</span>
            </div>
            <p className="text-xs text-slate-400">
              Archives vérifiées avec grilles Chess-Results et calculs de départage FIDE.
            </p>
          </div>

          <div className="card-royal p-6 space-y-2 text-center md:text-left">
            <span className="text-xs uppercase tracking-wider font-mono text-slate-400">Format Compétitif</span>
            <div className="flex items-baseline gap-2 justify-center md:justify-start">
              <span className="font-serif text-4xl sm:text-5xl font-bold text-white">7</span>
              <span className="text-xs text-gold-400 font-medium">rondes par édition</span>
            </div>
            <p className="text-xs text-slate-400">
              Système suisse homologué, cadence Blitz 5'+3" avec pendules électroniques.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Piliers & Esprit du Club ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="badge-gold">L'Esprit du Cercle</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            Garder vivante une tradition échiquéenne
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed font-light">
            Même sans club formel, même sans ligue locale. Le Cercle des Rois s'appuie 
            sur la fidélité et la fraternité de ses membres pour faire vivre le jeu à Annaba.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-royal p-6 sm:p-8 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white">Héritage du Hamra & AUCA</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              La plupart des joueurs d'Annaba sont les héritiers des grands clubs historiques de la ville. 
              Le Cercle perpétue cette mémoire vivante en maintenant le niveau et l'éthique du noble jeu.
            </p>
          </div>

          <div className="card-royal p-6 sm:p-8 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white">Le Rendez-vous d'Isha</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Pas de barrières ni d'enjeux financiers. Le premier jeudi du mois, 
              on pose les pendules au Café Dardara pour le plaisir pur de la compétition fraternelle autour d'un thé.
            </p>
          </div>

          <div className="card-royal p-6 sm:p-8 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white">De 7 à 77 ans</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Les maîtres chevronnés affrontent la jeune relève. Les pendules électroniques 
              et les jeux complets sont fournis bénévolement par les organisateurs du Cercle.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Palmarès des Champions ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="badge-gold">Historique</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">
              Les Champions du Cercle
            </h2>
          </div>
          <Link href="/archives" className="text-xs font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-1 transition-colors">
            <span>Voir les grilles américaines complètes</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-royal p-6 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">Mai 2024</span>
              <span className="text-gold-400 font-semibold">CDR III</span>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400">Vainqueur</div>
              <h3 className="font-serif text-xl font-bold text-white mt-1">BENLAID Lakhdar</h3>
              <p className="text-xs text-gold-400 mt-0.5">6.0 pts / 7 rondes</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-white/10">
              2ᵉ : TOUIL Achref (5.5 pts) · 3ᵉ : KOUDRI Samir (5.0 pts). 22 participants au Café Dardara.
            </p>
          </div>

          <div className="card-royal p-6 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">Avril 2024</span>
              <span className="text-gold-400 font-semibold">CDR II</span>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400">Vainqueur</div>
              <h3 className="font-serif text-xl font-bold text-white mt-1">TOUIL Achref</h3>
              <p className="text-xs text-gold-400 mt-0.5">5.5 pts / 7 rondes</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-white/10">
              2ᵉ : BENLAID Lakhdar (5.5 pts) · 3ᵉ : AMARA Oussama (5.0 pts). Départage Buchholz Cut 1.
            </p>
          </div>

          <div className="card-royal p-6 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">Mars 2024</span>
              <span className="text-gold-400 font-semibold">CDR I</span>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400">Vainqueur</div>
              <h3 className="font-serif text-xl font-bold text-white mt-1">KOUDRI Samir</h3>
              <p className="text-xs text-gold-400 mt-0.5">6.5 pts / 7 rondes</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-white/10">
              Édition inaugurale réunissant 24 anciens sociétaires et passionnés de la wilaya d'Annaba.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Bannière d'Invitation Sobre ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl p-8 sm:p-12 card-royal bg-gradient-to-r from-noir-900 via-noir-850 to-noir-900 border-gold-500/20 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white">
              Une place vous attend autour des 64 cases
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-light">
              Que vous soyez ancien compétiteur classé FIDE ou joueur d'échecs passionné de café,
              le Cercle des Rois est ouvert à tous les talents d'Annaba.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/inscription" className="btn-gold">
              S'inscrire au prochain tournoi
            </Link>
            <Link href="/annuaire" className="btn-secondary">
              Consulter l'annuaire des membres
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
