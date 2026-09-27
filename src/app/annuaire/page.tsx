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
  Sparkles,
  ExternalLink
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
    const query = search.toLowerCase().trim();
    const matchesSearch = 
      p.nomComplet.toLowerCase().includes(query) ||
      (p.fideId && p.fideId.includes(query)) ||
      (p.telephone && p.telephone.includes(query)) ||
      (p.club && p.club.toLowerCase().includes(query));

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
    const headers = ['N', 'Nom', 'Prenom', 'Club', 'FIDE_ID', 'Elo', 'Nb_Tournois_CDR', 'Meilleur_Rang', 'Telephone', 'Email', 'Date_Naissance'];
    const rows = filteredPlayers.map((p, idx) => [
      idx + 1,
      `"${p.nom}"`,
      `"${p.prenom}"`,
      `"${p.club || 'Indépendant'}"`,
      `"${p.fideId || ''}"`,
      p.elo || 0,
      p.nbTournois || 0,
      p.bestRank ? `#${p.bestRank}` : '',
      `"${adminUnlocked ? p.telephone || '' : 'PROTEGE'}"`,
      `"${adminUnlocked ? p.email || '' : 'PROTEGE'}"`,
      `"${adminUnlocked ? p.dateNaissance || '' : 'PROTEGE'}"`
    ]);

    // UTF-8 BOM (\uFEFF) ensures Excel displays accents properly
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `annuaire_cercle_des_rois_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] text-[var(--color-accent)] text-xs font-semibold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          <span>Communauté d'Annaba</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
          L'Annuaire des <span className="text-[var(--color-accent)]">Joueurs</span>
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Tableau officiel des {players.length} passionnés d'échecs d'Annaba répertoriés au Cercle des Rois.
        </p>
      </div>

      {/* CONTROLS BAR: SEARCH, CLUB FILTER, EXPORT & ADMIN PRIVACY TOGGLE */}
      <div className="p-4 sm:p-5 rounded-2xl card-royal border border-[var(--color-rule)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-grow max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, club ou ID FIDE..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-noir-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-gold-500 transition-colors"
            />
          </div>

          {/* Club Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            <Filter className="w-4 h-4 text-gold-500 flex-shrink-0" />
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-noir-900 border border-slate-700 text-xs sm:text-sm text-white focus:border-gold-500 transition-colors"
            >
              {clubs.map(c => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'Tous les clubs' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons: Export CSV + Admin Unlock */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="btn btn--accent text-xs sm:text-sm py-2 px-4 shadow-[0_0_16px_var(--color-glow-2)]"
              title="Télécharger la liste complète au format CSV tableur"
            >
              <Download className="w-4 h-4" />
              <span>Exporter l'Annuaire (CSV)</span>
            </button>

            <button
              onClick={() => {
                if (adminUnlocked) {
                  setAdminUnlocked(false);
                } else {
                  setShowPinModal(true);
                }
              }}
              className={`btn text-xs sm:text-sm py-2 px-3.5 ${
                adminUnlocked
                  ? 'btn--accent !bg-emerald-500/20 !text-emerald-300 !border-emerald-500/40'
                  : 'btn--ghost'
              }`}
            >
              {adminUnlocked ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-[var(--color-accent)]" />}
              <span>{adminUnlocked ? 'Mode Organisateur' : 'Coordonnées (PIN)'}</span>
            </button>
          </div>

        </div>

        {/* Privacy Note & Total Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800 gap-2">
          <span>
            Affichage de <strong className="text-white font-mono">{filteredPlayers.length}</strong> joueur{filteredPlayers.length > 1 ? 's' : ''} sur {players.length}
          </span>
          {!adminUnlocked && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
              Téléphones et emails confidentiels · Déverrouillage sécurisé par code secret
            </span>
          )}
        </div>
      </div>

      {/* COMPACT & STRUCTURED PLAYERS LIST TABLE */}
      <div className="rounded-2xl card-royal border border-[var(--color-rule)] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-rule)] bg-[oklch(15%_0.014_265)] text-slate-300 uppercase text-[11px] font-semibold tracking-wider">
                <th className="py-3 px-3 sm:px-4 w-12 text-center text-slate-400">#</th>
                <th className="py-3 px-4">Joueur</th>
                <th className="py-3 px-4">Club</th>
                <th className="py-3 px-4 text-center">Elo FIDE</th>
                <th className="py-3 px-4 text-center">ID FIDE</th>
                <th className="py-3 px-4 text-center">Tournois CDR</th>
                <th className="py-3 px-4 text-center">Meilleur Rang</th>
                <th className="py-3 px-4 text-right">Coordonnées</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-rule)]/60 text-slate-200">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                    Aucun joueur ne correspond à votre recherche.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player, idx) => {
                  const isChampion = player.bestRank === 1;

                  return (
                    <tr 
                      key={player.id} 
                      className={`transition-colors hover:bg-[oklch(20%_0.018_263_/_0.5)] ${
                        isChampion ? 'bg-[oklch(76%_0.17_50_/_0.04)]' : ''
                      }`}
                    >
                      {/* Index # */}
                      <td className="py-3 px-3 sm:px-4 text-center font-mono text-xs text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Name with Champion Crown */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white font-sans text-sm">
                            {player.nomComplet}
                          </span>
                          {isChampion && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <Crown className="w-3 h-3 text-amber-400" />
                              <span>Champion</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Club */}
                      <td className="py-3 px-4 text-xs font-sans">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                          player.club === 'Hamra Annaba' 
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : player.club === 'AUCA'
                            ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                            : player.club === 'Chess Club Annaba'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800/60 text-slate-300 border-slate-700'
                        }`}>
                          {player.club || 'Indépendant'}
                        </span>
                      </td>

                      {/* Elo */}
                      <td className="py-3 px-4 text-center font-mono text-xs">
                        {player.elo > 0 ? (
                          <span className="text-[var(--color-accent)] font-bold">
                            {player.elo}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">NC</span>
                        )}
                      </td>

                      {/* FIDE ID */}
                      <td className="py-3 px-4 text-center font-mono text-xs text-slate-300">
                        {player.fideId ? (
                          <a 
                            href={`https://ratings.fide.com/profile/${player.fideId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
                            title="Voir la fiche FIDE officielle"
                          >
                            <span>{player.fideId}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      {/* Tournois CDR */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-white text-xs">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 border border-slate-700">
                          {player.nbTournois}
                        </span>
                      </td>

                      {/* Meilleur Rang */}
                      <td className="py-3 px-4 text-center font-mono text-xs">
                        {player.bestRank ? (
                          <span className={`font-semibold ${
                            player.bestRank === 1 
                              ? 'text-amber-400 font-bold' 
                              : player.bestRank <= 3 
                              ? 'text-slate-200' 
                              : 'text-slate-400'
                          }`}>
                            #{player.bestRank}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      {/* Contact / Private details */}
                      <td className="py-3 px-4 text-right">
                        {adminUnlocked ? (
                          <div className="flex items-center justify-end gap-2 text-xs">
                            {player.telephone ? (
                              <a
                                href={`https://wa.me/213${player.telephone.replace(/^0/, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors font-mono"
                                title="Contacter sur WhatsApp"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{player.telephone}</span>
                              </a>
                            ) : (
                              <span className="text-slate-500 text-[11px]">-</span>
                            )}
                            {player.email && (
                              <a
                                href={`mailto:${player.email}`}
                                className="p-1 text-slate-400 hover:text-white transition-colors"
                                title={player.email}
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-sans">
                            <Lock className="w-3 h-3 text-slate-500" />
                            <span>Protégé</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
