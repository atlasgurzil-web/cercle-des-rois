'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Medal, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Search, 
  ExternalLink, 
  Crown, 
  ShieldCheck, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import tournamentsSeed from '@/data/tournaments.json';
import { Tournament, StandingEntry } from '@/types';

export default function ArchivesPage() {
  const tournaments = tournamentsSeed as unknown as Tournament[];
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(tournaments[2]?.id || tournaments[0]?.id);
  const [searchQuery, setSearchQuery] = useState('');

  const currentTournament = tournaments.find(t => t.id === selectedTournamentId) || tournaments[0];
  
  const standings: StandingEntry[] = currentTournament?.standings || [];
  const filteredStandings = standings.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.club && p.club.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.elo && p.elo.toString().includes(searchQuery))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5 text-gold-500" />
          <span>Palmarès & Histoire Compétitive</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
          Les Archives du <span className="text-gold-400">Cercle des Rois</span>
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Explorez les classements complets, podiums et feuilles de résultats officielles de toutes les éditions disputées à Annaba.
        </p>
      </div>

      {/* TOURNAMENT SELECTOR TABS */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {tournaments.map((t) => {
          const isSelected = t.id === selectedTournamentId;
          return (
            <button
              key={t.id}
              onClick={() => {
                setSelectedTournamentId(t.id);
                setSearchQuery('');
              }}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 ${
                isSelected
                  ? 'bg-gold-500 text-noir-950 font-bold'
                  : 'bg-noir-850 text-slate-300 border border-slate-800 hover:border-gold-500/40 hover:text-white'
              }`}
            >
              <Crown className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-noir-950' : 'text-gold-400'}`} />
              <span>{t.title}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${isSelected ? 'bg-noir-950/20 text-noir-950 font-mono' : 'bg-noir-900 text-slate-300 font-mono'}`}>
                {t.dateFormatted}
              </span>
            </button>
          );
        })}
      </div>

      {/* CURRENT TOURNAMENT SUMMARY */}
      {currentTournament && (
        <div id={currentTournament.id} className="space-y-8 animate-in fade-in duration-300">
          
          {/* Card Overview */}
          <div className="p-6 sm:p-8 rounded-2xl card-royal border-2 border-gold-500/30 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gold-400 uppercase tracking-widest">
                  <span>Édition #{currentTournament.edition}</span>
                  <span>•</span>
                  <span>{currentTournament.type}</span>
                  <span>•</span>
                  <span>{currentTournament.rounds} Rondes</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white mt-1">
                  {currentTournament.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 mt-2">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gold-500" />
                    {currentTournament.dateFormatted}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gold-500" />
                    {currentTournament.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-gold-500" />
                    {currentTournament.participantsCount || standings.length} Joueurs
                  </span>
                </div>
              </div>

              {currentTournament.chessResultsUrl && (
                <a
                  href={currentTournament.chessResultsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-noir-850 text-gold-400 border border-gold-500/30 hover:border-gold-400 hover:bg-gold-500/10 transition-colors"
                >
                  <span>Fiche Chess-Results Officielle</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Arbiters & Directors if available */}
            {(currentTournament.director || currentTournament.arbiter) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
                {currentTournament.director && (
                  <div>
                    <span className="text-slate-400">Directeur du tournoi :</span>{' '}
                    <strong className="text-white">{currentTournament.director}</strong>
                  </div>
                )}
                {currentTournament.arbiter && (
                  <div>
                    <span className="text-slate-400">Arbitrage :</span>{' '}
                    <strong className="text-white">{currentTournament.arbiter}</strong>
                    {currentTournament.deputyArbiter && ` & ${currentTournament.deputyArbiter}`}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PODIUM SECTION */}
          {currentTournament.podium && (
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-gold-400" />
                <span>Le Podium d'Honneur</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 2nd Place */}
                {currentTournament.podium.second && (
                  <div className="order-2 md:order-1 p-6 rounded-2xl bg-noir-850/80 border border-slate-700 flex flex-col justify-between space-y-4 hover:border-slate-500 transition-colors">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-300/10 border border-slate-300/30 flex items-center justify-center text-slate-200 font-bold text-lg">
                        🥈 2ᵉ
                      </div>
                      <h4 className="font-serif text-lg font-bold text-white">
                        {currentTournament.podium.second.name}
                      </h4>
                      <p className="text-xs text-slate-300">
                        {currentTournament.podium.second.club || 'Indépendant'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800">
                      <span className="text-slate-300">Elo : {currentTournament.podium.second.elo || 'NC'}</span>
                      <span className="font-mono font-bold text-white text-sm">{currentTournament.podium.second.points} pts</span>
                    </div>
                  </div>
                )}

                {/* 1st Place - Gold Champion */}
                {currentTournament.podium.first && (
                  <div className="order-1 md:order-2 p-6 sm:p-8 rounded-2xl bg-noir-900 border-2 border-gold-500 shadow-gold-glow flex flex-col justify-between space-y-4 md:-translate-y-2">
                    <div className="space-y-2 text-center sm:text-left">
                      <div className="w-12 h-12 rounded-full bg-gold-500/20 border border-gold-400 flex items-center justify-center text-gold-300 font-bold text-xl mx-auto sm:mx-0">
                        🥇 1ᵉʳ
                      </div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-gold-400">Champion de l'Édition</div>
                      <h4 className="font-serif text-xl sm:text-2xl font-bold text-white">
                        {currentTournament.podium.first.name}
                      </h4>
                      <p className="text-xs text-gold-300">
                        {currentTournament.podium.first.club || 'Indépendant'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-gold-500/20">
                      <span className="text-slate-300">Elo : {currentTournament.podium.first.elo || 'NC'}</span>
                      <span className="font-mono font-bold text-gold-400 text-lg">{currentTournament.podium.first.points} pts</span>
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {currentTournament.podium.third && (
                  <div className="order-3 p-6 rounded-2xl bg-noir-850/80 border border-amber-800/40 flex flex-col justify-between space-y-4 hover:border-amber-700/60 transition-colors">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-full bg-amber-600/10 border border-amber-600/30 flex items-center justify-center text-amber-400 font-bold text-lg">
                        🥉 3ᵉ
                      </div>
                      <h4 className="font-serif text-lg font-bold text-white">
                        {currentTournament.podium.third.name}
                      </h4>
                      <p className="text-xs text-slate-300">
                        {currentTournament.podium.third.club || 'Indépendant'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800">
                      <span className="text-slate-300">Elo : {currentTournament.podium.third.elo || 'NC'}</span>
                      <span className="font-mono font-bold text-white text-sm">{currentTournament.podium.third.points} pts</span>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* FULL STANDINGS TABLE */}
          <div className="p-6 sm:p-8 rounded-2xl card-royal border border-gold-500/20 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                  <Medal className="w-5 h-5 text-gold-400 flex-shrink-0" />
                  <span>Classement Général Complet</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {standings.length} participants enregistrés pour cette édition
                </p>
              </div>

              {/* Search in Standings */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Chercher un joueur ou club..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-noir-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-gold-500 transition-colors"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-300 uppercase text-[11px] font-semibold tracking-wider">
                    <th className="py-3 px-3">Rg</th>
                    <th className="py-3 px-3">Nom & Prénom</th>
                    <th className="py-3 px-3">Club / Ville</th>
                    <th className="py-3 px-3">Elo</th>
                    <th className="py-3 px-3 text-center font-bold text-gold-400">Points</th>
                    <th className="py-3 px-3 text-right">Dep. 1</th>
                    <th className="py-3 px-3 text-right">Dep. 2</th>
                    <th className="py-3 px-3 text-right">Dep. 3</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {filteredStandings.map((p) => {
                    const isTop3 = p.rank <= 3;
                    return (
                      <tr 
                        key={p.rank} 
                        className={`hover:bg-noir-800/60 transition-colors ${
                          isTop3 ? 'bg-gold-500/5' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-bold">
                          {p.rank === 1 && <span className="text-gold-400">🥇 1</span>}
                          {p.rank === 2 && <span className="text-slate-300">🥈 2</span>}
                          {p.rank === 3 && <span className="text-amber-500">🥉 3</span>}
                          {p.rank > 3 && <span className="text-slate-400">#{p.rank}</span>}
                        </td>
                        <td className="py-3 px-3 font-sans font-semibold text-white">
                          {p.name}
                        </td>
                        <td className="py-3 px-3 font-sans text-slate-300 text-xs">
                          {p.club || 'Indépendant'}
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {p.elo > 0 ? (
                            <span className="text-gold-400 font-semibold">{p.elo}</span>
                          ) : (
                            <span className="text-slate-500">NC</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-gold-400 text-sm">
                          {p.points}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-300">
                          {p.dep1 || 0}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-300">
                          {p.dep2 || 0}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-300">
                          {p.dep3 || 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-2 text-[11px] text-slate-400">
              * Départages officiels selon les normes FIDE : Départage 1 = Rencontre directe (DE), Départage 2 = Buchholz Cut 1, Départage 3 = Sonneborn-Berger.
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
