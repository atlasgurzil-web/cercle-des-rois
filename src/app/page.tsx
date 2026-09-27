import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Crown, 
  ChevronRight, 
  Sparkles, 
  ArrowUpRight,
  Flame,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { getAllTournaments, getUpcomingTournaments, getArchivedTournaments, getAllPlayers } from '@/lib/storage';
import { CDR_HISTORY } from '@/data/history';

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
    <div className="relative overflow-hidden">
      {/* Subtle Ambient Light Gradients */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gold-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-noir-850/90 border border-gold-500/30 text-gold-300 text-xs font-semibold uppercase tracking-widest shadow-gold-glow animate-pulse">
            <Crown className="w-3.5 h-3.5 text-gold-400" />
            <span>Tournois d'échecs indépendants • Annaba</span>
          </div>

          {/* Logo with Royal Glow */}
          <div className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40 my-4">
            <div className="absolute inset-0 rounded-full bg-gold-500/20 blur-xl animate-pulse" />
            <div className="relative w-full h-full rounded-full border-2 border-gold-400/60 shadow-gold-glow-lg overflow-hidden">
              <Image
                src="/logo.png"
                alt="Sceau Le Cercle des Rois"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>

          {/* Main Title */}
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            L'Arène des Passionnés <br />
            <span className="text-gold-gradient">d'Échecs d'Annaba</span>
          </h1>

          {/* Tagline */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            De 7 à 77 ans, le premier jeudi de chaque mois après la prière d'Isha. <br className="hidden sm:inline" />
            Pas de chichi, que du noble jeu, du thé chaud et de la fraternité.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {activeTournament && (
              <Link
                href={`/tournoi/${activeTournament.slug}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-gold-500 to-gold-400 text-noir-950 hover:from-gold-400 hover:to-gold-300 shadow-gold-glow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <Sparkles className="w-5 h-5 text-noir-950" />
                <span>S'inscrire au Prochain Tournoi</span>
              </Link>
            )}
            
            <Link
              href="/archives"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-semibold bg-noir-850/80 text-slate-200 border border-gold-500/25 hover:border-gold-400/60 hover:bg-noir-800 transition-all duration-200"
            >
              <Trophy className="w-5 h-5 text-gold-400" />
              <span>Consulter le Palmarès</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-10 max-w-2xl mx-auto border-t border-slate-800/80">
            <div className="p-3 text-center">
              <div className="font-serif text-2xl sm:text-3xl font-bold text-gold-400">3</div>
              <div className="text-[11px] sm:text-xs text-slate-400 uppercase tracking-wider mt-0.5">Éditions Passées</div>
            </div>
            <div className="p-3 text-center border-x border-slate-800/80">
              <div className="font-serif text-2xl sm:text-3xl font-bold text-gold-400">{allPlayers.length}+</div>
              <div className="text-[11px] sm:text-xs text-slate-400 uppercase tracking-wider mt-0.5">Joueurs Référencés</div>
            </div>
            <div className="p-3 text-center">
              <div className="font-serif text-2xl sm:text-3xl font-bold text-gold-400">100%</div>
              <div className="text-[11px] sm:text-xs text-slate-400 uppercase tracking-wider mt-0.5">Passion & Fraternité</div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= ACTIVE UPCOMING TOURNAMENT BANNER ================= */}
      {activeTournament && (
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
          <div className="relative rounded-2xl p-6 sm:p-10 card-royal overflow-hidden border-2 border-gold-500/40">
            {/* Background chess watermarks */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Inscriptions Ouvertes
                  </span>
                  <span className="text-xs font-medium text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded border border-gold-500/20">
                    Édition #{activeTournament.edition}
                  </span>
                </div>

                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-wide">
                  {activeTournament.title}
                </h2>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {activeTournament.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-gold-400" />
                    <span>{activeTournament.dateFormatted}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-gold-400" />
                    <span>{activeTournament.time}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-gold-400" />
                    <span className="font-medium text-white">{activeTournament.location}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Flame className="w-4 h-4 text-gold-400" />
                    <span>Cadence : <strong>{activeTournament.cadence}</strong></span>
                  </div>
                </div>

                {/* Progress bar of seats */}
                <div className="pt-3 space-y-1.5 max-w-md">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Jauge de la salle</span>
                    <span className="text-gold-400">{confirmedPlayers.length} / {activeTournament.maxParticipants} inscrits ({spotsLeft} places restantes)</span>
                  </div>
                  <div className="w-full h-2.5 bg-noir-900 rounded-full overflow-hidden border border-slate-700">
                    <div 
                      className="h-full bg-gradient-to-r from-gold-600 via-gold-400 to-amber-300 transition-all duration-500 rounded-full"
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick action card */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px]">
                <Link
                  href={`/tournoi/${activeTournament.slug}`}
                  className="inline-flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl font-bold bg-gold-500 text-noir-950 hover:bg-gold-400 shadow-gold-glow transition-all"
                >
                  <span>Rejoindre la Liste des Joueurs</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`♟️ *Le Cercle des Rois - Tournoi d'échecs à Annaba* %0A📅 Date : ${activeTournament.dateFormatted} à ${activeTournament.time} %0A📍 Lieu : ${activeTournament.location} %0AInscriptions en ligne ouvertes ici : %0Ahttps://cercledesrois.dz/tournoi/${activeTournament.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl text-sm font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors"
                >
                  <span>Partager sur WhatsApp</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ================= NOTRE HISTOIRE & RACINES ================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-t border-slate-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-400">
              <BookOpen className="w-4 h-4" />
              <span>Mémoire & Héritage</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
              Une tradition que rien <br />
              <span className="text-gold-gradient">ne peut éteindre</span>
            </h2>

            <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p className="italic border-l-2 border-gold-500/60 pl-4 py-1 text-slate-200">
                « Nous sommes en grande majorité des joueurs d'échecs d'Annaba, anciens de Hamra Annaba ou de l'AUCA. Même sans club et sans ligue, ce n'est pas parce que les portes ferment qu'on doit ranger les échiquiers. »
              </p>
              <p>
                Le premier jeudi de chaque mois, après la prière d'Isha, les fidèles se retrouvent autour des échiquiers du Café Dardara. De 7 à 77 ans, le jeune plein d'énergie côtoie le maître chevronné.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/histoire"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gold-400 hover:text-gold-300 transition-colors group"
              >
                <span>Lire l'Histoire Complète de nos Tournois</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CDR_HISTORY.keyPoints.map((point, idx) => (
              <div key={idx} className="p-6 rounded-xl card-royal space-y-3">
                <div className="w-10 h-10 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 font-serif font-bold text-lg">
                  0{idx + 1}
                </div>
                <h3 className="font-serif text-lg font-bold text-white">
                  {point.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {point.desc}
                </p>
              </div>
            ))}

            <div className="p-6 rounded-xl bg-gradient-to-br from-gold-500/20 via-noir-900 to-noir-950 border border-gold-500/30 flex flex-col justify-between">
              <div className="space-y-2">
                <Crown className="w-8 h-8 text-gold-400" />
                <h3 className="font-serif text-lg font-bold text-white">Le Rendez-Vous Sacré</h3>
                <p className="text-xs text-slate-300">
                  Un rituel immuable à Annaba pour transmettre le noble jeu aux nouvelles générations.
                </p>
              </div>
              <div className="pt-4 text-xs font-semibold text-gold-400 uppercase tracking-widest">
                Toujours après Isha • Entrée libre
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= ARCHIVES & PALMARÈS PREVIEW ================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-t border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-400">
              <Trophy className="w-4 h-4" />
              <span>Le Palmarès Officiel</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Les Dernières Éditions <span className="text-gold-gradient">Archivées</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl">
              Retrouvez les classements officiels, podiums et statistiques certifiés sur Chess-Results de toutes nos rencontres passées.
            </p>
          </div>

          <Link
            href="/archives"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold-400 hover:text-gold-300 group"
          >
            <span>Voir toutes les archives</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {archivedTournaments.slice(0, 3).map((t) => (
            <div key={t.id} className="rounded-xl card-royal p-6 flex flex-col justify-between space-y-6 group hover:border-gold-500/50 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="px-2.5 py-0.5 rounded bg-noir-800 text-gold-400 font-semibold border border-slate-700">
                    Édition #{t.edition}
                  </span>
                  <span>{t.dateFormatted}</span>
                </div>

                <div>
                  <h3 className="font-serif text-xl font-bold text-white group-hover:text-gold-300 transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-gold-500" />
                    <span>{t.location}</span>
                  </p>
                </div>

                {/* Podium Highlight */}
                {t.podium?.first && (
                  <div className="p-3.5 rounded-lg bg-noir-850 border border-gold-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-gold-400 uppercase tracking-wider">
                      <Trophy className="w-4 h-4 text-gold-500" />
                      <span>Vainqueur de l'édition</span>
                    </div>
                    <div className="text-sm font-bold text-white flex items-center justify-between">
                      <span>{t.podium.first.name}</span>
                      <span className="text-gold-400 font-mono text-xs">{t.podium.first.points} pts</span>
                    </div>
                    {t.podium.first.club && (
                      <div className="text-[11px] text-slate-400 truncate">
                        {t.podium.first.club}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  <strong>{t.participantsCount || t.standings?.length || 0}</strong> participants
                </span>
                <Link
                  href={`/archives#${t.id}`}
                  className="text-xs font-semibold text-gold-400 hover:text-gold-300 inline-flex items-center gap-1"
                >
                  <span>Grille complète</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= COMMUNITY CALLOUT ================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-noir-900 via-noir-850 to-noir-900 border border-gold-500/30 text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-chess-pattern opacity-10 pointer-events-none" />
          
          <Crown className="w-12 h-12 text-gold-400 mx-auto" />
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white max-w-2xl mx-auto">
            Vous jouez aux échecs à Annaba ? <br />
            <span className="text-gold-gradient">Votre place est parmi nous.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-light">
            Rejoignez notre annuaire de joueurs, recevez les convocations des prochains tournois et venez partager des moments inoubliables.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/tournois"
              className="px-8 py-3.5 rounded-xl font-bold bg-gold-500 text-noir-950 hover:bg-gold-400 shadow-gold-glow transition-all"
            >
              Rejoindre le Prochain Tournoi
            </Link>
            <Link
              href="/annuaire"
              className="px-7 py-3.5 rounded-xl font-semibold bg-noir-800 text-slate-300 border border-slate-700 hover:border-gold-500/50 transition-colors"
            >
              Consulter l'Annuaire des Membres
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
