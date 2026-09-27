'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Crown, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  Download, 
  Lock, 
  Unlock,
  Filter,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import playersSeed from '@/data/players.json';
import { DirectoryPlayer } from '@/types';

export default function AnnuairePage() {
  const players: DirectoryPlayer[] = playersSeed as unknown as DirectoryPlayer[];

  const [search, setSearch] = useState('');
  const [selectedClub, setSelectedClub] = useState('ALL');
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState('');

  // Extract unique clubs for filter
  const clubs = ['ALL', ...Array.from(new Set(players.map(p => p.club || 'Indépendant')))];

  // Filter players
  const filteredPlayers = players.filter(p => {
    const matchesSearch = 
      p.nomComplet.toLowerCase().includes(search.toLowerCase()) ||
      (p.fideId && p.fideId.includes(search)) ||
      (p.telephone && p.telephone.includes(search));

    const matchesClub = selectedClub === 'ALL' || (p.club || 'Indépendant') === selectedClub;

    return matchesSearch && matchesClub;
  });

  const handleUnlockPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '12081988') {
      setAdminUnlocked(true);
      setShowPinModal(false);
      setPinError('');
    } else {
      setPinError('Code secret invalide.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Nom', 'Prenom', 'Club', 'FIDE_ID', 'Elo', 'Nb_Tournois_CDR', 'Meilleur_Rang', 'Telephone', 'Email', 'Date_Naissance'];
    const rows = filteredPlayers.map(p => [
      `"${p.nom}"`,
      `"${p.prenom}"`,
      `"${p.club || 'Indépendant'}"`,
      `"${p.fideId || ''}"`,
      p.elo || 0,
      p.nbTournois || 0,
      p.bestRank || '',
      `"${adminUnlocked ? p.telephone || '' : 'PROTEGE'}"`,
      `"${adminUnlocked ? p.email || '' : 'PROTEGE'}"`,
      `"${adminUnlocked ? p.dateNaissance || '' : 'PROTEGE'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `annuaire_cercle_des_rois_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          <span>Communauté & Répertoire</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
          L'Annuaire des <span className="text-gold-400">Joueurs</span>
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Le répertoire unifié des {players.length} passionnés d'échecs d'Annaba et fidèles du Cercle des Rois.
        </p>
      </div>

      {/* CONTROLS BAR: SEARCH, CLUB FILTER, EXPORT & ADMIN PRIVACY TOGGLE */}
      <div className="p-6 rounded-2xl card-royal border border-gold-500/30 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-grow max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou ID FIDE..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-noir-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-gold-500 transition-colors"
            />
          </div>

          {/* Club Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            <Filter className="w-4 h-4 text-gold-500 flex-shrink-0" />
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-noir-900 border border-slate-700 text-xs sm:text-sm text-white focus:border-gold-500 transition-colors"
            >
              {clubs.map(c => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'Tous les clubs' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Admin Lock / Export Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (adminUnlocked) {
                  setAdminUnlocked(false);
                } else {
                  setShowPinModal(true);
                }
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                adminUnlocked
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-noir-850 text-gold-400 border border-gold-500/30 hover:border-gold-400'
              }`}
            >
              {adminUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{adminUnlocked ? 'Mode Organisateur Actif' : 'Déverrouiller Téléphones (PIN)'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-gold-500 text-noir-950 hover:bg-gold-400 transition-colors shadow-gold-glow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter CSV</span>
            </button>
          </div>

        </div>

        {/* Privacy Note */}
        {!adminUnlocked && (
          <div className="text-[11px] text-slate-300 flex items-center gap-1.5 pt-1 border-t border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
            <span>
              Respect de la vie privée : Les numéros de téléphone et emails sont réservés aux organisateurs via code secret.
            </span>
          </div>
        )}
      </div>

      {/* PLAYERS GRID / DIRECTORY CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-300 px-1">
          <span>Affichage de <strong className="text-white">{filteredPlayers.length}</strong> joueur{filteredPlayers.length > 1 ? 's' : ''}</span>
          <span className="text-slate-400">Triés par fidélité aux tournois CDR</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player) => {
            const isChampion = player.bestRank === 1;

            return (
              <div 
                key={player.id} 
                className={`p-5 rounded-2xl card-royal border flex flex-col justify-between space-y-4 transition-colors ${
                  isChampion ? 'border-gold-500/60 bg-noir-900/90' : 'border-slate-800 hover:border-gold-500/40'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-serif text-base font-bold text-white">
                          {player.nomComplet}
                        </h3>
                        {isChampion && <Crown className="w-4 h-4 text-gold-400 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {player.club || 'Indépendant'}
                      </p>
                    </div>

                    {player.elo > 0 ? (
                      <span className="font-mono text-xs font-bold text-gold-400 bg-noir-850 px-2 py-1 rounded border border-gold-500/30">
                        {player.elo} Elo
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 bg-noir-900 px-2 py-0.5 rounded border border-slate-800">
                        NC
                      </span>
                    )}
                  </div>

                  {/* CDR Tournament Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded-lg bg-noir-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Tournois CDR</div>
                      <div className="font-bold text-white flex items-center gap-1 mt-0.5">
                        <Award className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                        <span>{player.nbTournois} disputé{player.nbTournois > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-noir-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Meilleur Rang</div>
                      <div className="font-bold text-white mt-0.5">
                        {player.bestRank ? (
                          <span className={player.bestRank === 1 ? 'text-gold-400 font-bold' : ''}>
                            #{player.bestRank}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* FIDE ID badge */}
                  {player.fideId && (
                    <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                      <span className="text-slate-400">ID FIDE :</span>
                      <span className="font-mono font-semibold text-gold-400">{player.fideId}</span>
                    </div>
                  )}
                </div>

                {/* Confidential / Admin Contact Bar */}
                {adminUnlocked ? (
                  <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs animate-in fade-in">
                    {player.telephone ? (
                      <div className="flex items-center justify-between text-emerald-400">
                        <a href={`tel:${player.telephone}`} className="flex items-center gap-1.5 hover:underline">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{player.telephone}</span>
                        </a>
                        <a 
                          href={`https://wa.me/213${player.telephone.replace(/^0/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold hover:bg-emerald-500/30 transition-colors"
                        >
                          WhatsApp
                        </a>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Pas de téléphone</span>
                    )}

                    {player.email && (
                      <a href={`mailto:${player.email}`} className="flex items-center gap-1.5 text-slate-300 hover:text-white truncate block transition-colors">
                        <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{player.email}</span>
                      </a>
                    )}

                    {player.dateNaissance && (
                      <div className="text-[10px] text-slate-400">
                        Né(e) le : {player.dateNaissance}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Membre vérifié CDR</span>
                    <Lock className="w-3 h-3 text-slate-400" />
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* PIN UNLOCK MODAL */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl card-royal p-6 border-2 border-gold-500/60 shadow-gold-glow-lg text-center space-y-4">
            <Lock className="w-10 h-10 text-gold-400 mx-auto" />
            <div>
              <h3 className="font-serif text-xl font-bold text-white">Espace Sécurisé</h3>
              <p className="text-xs text-slate-400 mt-1">
                Entrez le code secret organisateur pour afficher les coordonnées complètes des membres.
              </p>
            </div>

            <form onSubmit={handleUnlockPin} className="space-y-3">
              <input
                type="password"
                autoFocus
                placeholder="Code secret..."
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-noir-900 border border-slate-700 text-center font-mono text-lg text-white tracking-widest focus:border-gold-500 transition-colors"
              />

              {pinError && (
                <div className="text-xs text-rose-400">{pinError}</div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-semibold bg-noir-800 text-slate-300 border border-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl text-xs font-bold bg-gold-500 text-noir-950 hover:bg-gold-400 shadow-gold-glow"
                >
                  Déverrouiller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
