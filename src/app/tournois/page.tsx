import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Users, Flame, ChevronRight, Trophy, Sparkles, CheckCircle2 } from 'lucide-react';
import { getUpcomingTournaments, getArchivedTournaments } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export default function TournamentsListPage() {
  const upcoming = getUpcomingTournaments();
  const archives = getArchivedTournaments();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-16">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          <span>Agenda & Inscriptions</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
          Les Tournois du <span className="text-gold-400">Cercle des Rois</span>
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Inscrivez-vous directement en ligne pour réserver votre place autour des échiquiers d'Annaba.
        </p>
      </div>

      {/* UPCOMING TOURNAMENTS SECTION */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-gold-400 flex-shrink-0" />
            <span>Prochain(s) Tournoi(s) Annoncé(s)</span>
          </h2>
          <span className="text-xs text-gold-400 font-semibold px-2.5 py-1 rounded bg-gold-500/10 border border-gold-500/20">
            {upcoming.length} actif{upcoming.length > 1 ? 's' : ''}
          </span>
        </div>

        {upcoming.length === 0 ? (
          <div className="p-12 text-center card-royal rounded-xl space-y-3">
            <Calendar className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="font-serif text-lg text-white font-semibold">Aucun nouveau tournoi programmé pour le moment</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Le prochain tournoi aura lieu le premier jeudi du mois prochain après la prière d'Isha. Restez connectés !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcoming.map(t => {
              const confirmed = t.registeredPlayers?.filter(p => p.status === 'confirmed') || [];
              const spotsLeft = Math.max(0, t.maxParticipants - confirmed.length);
              const fillPct = Math.min(100, Math.round((confirmed.length / t.maxParticipants) * 100));

              return (
                <div key={t.id} className="rounded-2xl card-royal p-6 sm:p-8 flex flex-col justify-between space-y-6 border border-gold-500/30 hover:border-gold-500/60 transition-colors">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Inscriptions Ouvertes
                      </span>
                      <span className="text-xs font-mono text-gold-400 bg-noir-850 px-2.5 py-1 rounded border border-slate-700">
                        Édition #{t.edition}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-2xl font-bold text-white hover:text-gold-300 transition-colors">
                        <Link href={`/tournoi/${t.slug}`}>
                          {t.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
                        <span>{t.location}</span>
                      </p>
                    </div>

                    <p className="text-sm text-slate-300 line-clamp-2">
                      {t.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gold-400" />
                        <span>{t.dateFormatted}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gold-400" />
                        <span>{t.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-gold-400" />
                        <span>{t.cadence}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gold-400" />
                        <span>{spotsLeft} places restantes</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1 pt-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Remplissage</span>
                        <span className="text-gold-400 font-semibold">{confirmed.length} / {t.maxParticipants} inscrits</span>
                      </div>
                      <div className="w-full h-2 bg-noir-900 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="h-full bg-gold-500 rounded-full transition-[width] duration-500"
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-300">
                      {t.feeDescription || 'Gratuit'}
                    </span>
                    <Link
                      href={`/tournoi/${t.slug}#inscription`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gold-500 text-noir-950 hover:bg-gold-400 shadow-gold-glow transition-colors"
                    >
                      <span>S'inscrire</span>
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ARCHIVES TEASER */}
      <div className="space-y-6 pt-8 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-gold-400 flex-shrink-0" />
              <span>Archives des Tournois Déjà Disputés</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Consultez les résultats finaux, grilles américaines et vainqueurs de toutes nos éditions passées.
            </p>
          </div>
          <Link
            href="/archives"
            className="text-xs sm:text-sm font-semibold text-gold-400 hover:text-gold-300 inline-flex items-center gap-1 transition-colors"
          >
            <span>Voir le Palmarès</span>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {archives.map(t => (
            <Link
              key={t.id}
              href={`/archives#${t.id}`}
              className="p-5 rounded-xl card-royal hover:border-gold-500/50 transition-colors flex flex-col justify-between space-y-3 group"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400 bg-noir-800 px-2 py-0.5 rounded">
                  Édition #{t.edition}
                </span>
                <h4 className="font-serif text-base font-bold text-white mt-2 group-hover:text-gold-300 transition-colors">
                  {t.title}
                </h4>
                <p className="text-xs text-slate-300 mt-1">{t.dateFormatted}</p>
              </div>

              {t.podium?.first && (
                <div className="text-xs text-slate-300 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-gold-400 font-medium">🥇 {t.podium.first.name}</span>
                  <span className="font-mono text-slate-300">{t.podium.first.points} pts</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
