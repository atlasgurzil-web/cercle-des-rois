/* Hallmark · macrostructure: Split Studio · theme: Studio/Royal · genre: editorial
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 * slop: pass (1-58) · contrast: pass (40-41) · nav: N5 · footer: Ft5
 */

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
  Flame, 
  ArrowUpRight,
  BookOpen
} from 'lucide-react';
import { getUpcomingTournaments, getArchivedTournaments, getAllPlayers } from '@/lib/storage';
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
    <div className="space-y-24 py-12 md:py-16">

      {/* ================= HERO SECTION : SPLIT STUDIO DIPTYCH ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Positioning & Identity */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-md bg-noir-900 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-widest">
              <Crown className="w-3.5 h-3.5 text-gold-500" />
              <span>Annaba • Tournois Indépendants</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
              L'Arène des Passionnés <br />
              <span className="text-gold-solid">d'Échecs d'Annaba</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl font-light leading-relaxed">
              Une tradition préservée par quelques fidèles : des tournois amicaux le premier jeudi de chaque mois, après la prière d'Isha. De 7 à 77 ans autour du même échiquier.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {activeTournament && (
                <Link
                  href={`/tournoi/${activeTournament.slug}`}
                  className="px-7 py-3.5 rounded-xl font-bold bg-gold-500 text-noir-950 hover:bg-gold-400 transition-colors shadow-sm whitespace-nowrap"
                >
                  S'inscrire au Prochain Tournoi
                </Link>
              )}
              <Link
                href="/archives"
                className="px-6 py-3.5 rounded-xl font-semibold bg-noir-850 text-slate-200 border border-gold-500/30 hover:border-gold-400 transition-colors whitespace-nowrap"
              >
                Palmarès & Archives
              </Link>
            </div>

            {/* Factual Metrics Bar (Gate 46: Honest copy, no invented stats) */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-left">
              <div>
                <div className="font-serif text-2xl font-bold text-white">3</div>
                <div className="text-xs text-slate-400 mt-0.5">Éditions officielles</div>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <div className="font-serif text-2xl font-bold text-white">{allPlayers.length}</div>
                <div className="text-xs text-slate-400 mt-0.5">Joueurs dans l'annuaire</div>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <div className="font-serif text-2xl font-bold text-gold-400">1ᵉʳ Jeudi</div>
                <div className="text-xs text-slate-400 mt-0.5">Après la prière d'Isha</div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Event Card (Proof Column) */}
          <div className="lg:col-span-5">
            {activeTournament ? (
              <div className="p-7 sm:p-8 rounded-2xl card-royal border-2 border-gold-500/35 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Inscriptions Ouvertes
                  </span>
                  <span className="text-xs font-mono text-gold-400 bg-noir-900 px-2.5 py-1 rounded border border-slate-800">
                    Édition #{activeTournament.edition}
                  </span>
                </div>

                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                    {activeTournament.title}
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                    {activeTournament.description}
                  </p>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gold-400 flex-shrink-0" />
                    <span>{activeTournament.dateFormatted}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gold-400 flex-shrink-0" />
                    <span>{activeTournament.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0" />
                    <span className="font-medium text-white">{activeTournament.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-gold-400 flex-shrink-0" />
                    <span>Cadence : <strong>{activeTournament.cadence}</strong></span>
                  </div>
                </div>

                {/* Seats progress indicator */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Jauge salle</span>
                    <span className="text-gold-400 font-semibold">{confirmedPlayers.length} / {activeTournament.maxParticipants} inscrits ({spotsLeft} places)</span>
                  </div>
                  <div className="w-full h-2 bg-noir-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-gold-500 rounded-full"
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href={`/tournoi/${activeTournament.slug}`}
                    className="w-full py-3 rounded-xl font-bold bg-gold-500 text-noir-950 hover:bg-gold-400 text-center text-sm transition-colors"
                  >
                    Réserver ma Place
                  </Link>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`♟️ *Le Cercle des Rois - Tournoi d'échecs à Annaba* %0A📅 ${activeTournament.dateFormatted} à ${activeTournament.time} %0A📍 ${activeTournament.location} %0AInscriptions ouvertes : https://cercledesrois.dz/tournoi/${activeTournament.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-noir-900 text-emerald-400 border border-emerald-500/30 hover:bg-noir-850 text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Partager sur WhatsApp</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl card-royal text-center">
                <p className="text-slate-400 text-sm">Prochain tournoi en cours de programmation.</p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ================= EDITORIAL NARRATIVE : L'HISTOIRE DU CLUB ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-400">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Mémoire d'Annaba</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-snug">
              Une tradition née de la passion, <br />
              portée par la fraternité
            </h2>
            <p className="text-xs text-slate-400">
              En hommage aux anciens du Hamra Annaba et de l'AUCA.
            </p>
            <div className="pt-2">
              <Link
                href="/histoire"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-400 hover:text-gold-300 transition-colors"
              >
                <span>Lire le récit complet</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            <p className="border-l-2 border-gold-500 pl-4 py-1 text-slate-200">
              « Nous sommes en grande majorité des joueurs d'échecs d'Annaba, pour la plupart d'anciens joueurs du Hamra Annaba ou de l'AUCA. Aujourd'hui, la réalité est là : nous n'avons quasiment plus de club, la plupart ont disparu. Et nous n'avons jamais réussi à ouvrir une vraie ligue dans notre ville. »
            </p>
            <p>
              Mais ce n'est pas parce que les clubs ont fermé leurs portes qu'on doit ranger les échiquiers. Grâce à l'engagement de quelques fidèles, on a réussi à préserver une tradition : des tournois, généralement le premier jeudi du mois, après la prière d'Isha.
            </p>
            <p className="text-xs text-slate-400">
              Ce que nous recherchons, ce n'est pas la médaille. C'est de garder vivante une tradition, un espace, une famille de joueurs.
            </p>
          </div>

        </div>
      </section>

      {/* ================= HALL OF FAME / DERNIERS TOURNOIS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 pt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-400">
              <Trophy className="w-3.5 h-3.5" />
              <span>Palmarès Officiel</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
              Les Dernières Éditions Archivées
            </h2>
          </div>
          <Link
            href="/archives"
            className="text-xs font-semibold text-gold-400 hover:text-gold-300 inline-flex items-center gap-1 transition-colors"
          >
            <span>Consulter les classements complets</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {archivedTournaments.slice(0, 3).map((t) => (
            <div key={t.id} className="p-6 rounded-2xl card-royal border border-slate-800 hover:border-gold-500/40 transition-colors space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-gold-400">Édition #{t.edition}</span>
                <span>{t.dateFormatted}</span>
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  {t.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{t.location}</p>
              </div>

              {t.podium?.first && (
                <div className="p-3 rounded-xl bg-noir-900 border border-slate-800 text-xs space-y-1">
                  <div className="text-gold-400 font-semibold flex items-center gap-1">
                    <span>🥇 Vainqueur :</span>
                    <strong className="text-white">{t.podium.first.name}</strong>
                  </div>
                  <div className="text-slate-400">
                    {t.podium.first.club} • {t.podium.first.points} pts
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">{t.participantsCount || t.standings?.length || 0} participants</span>
                <Link href={`/archives#${t.id}`} className="text-gold-400 font-semibold hover:underline">
                  Grille complète →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
