'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  FileText, 
  Users, 
  ExternalLink, 
  AlertCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { Tournament, StandingEntry, Podium } from '@/types';
import { 
  parseTournamentStandings, 
  generateWhatsAppResultsMessage, 
  generateChatGptPrompt,
  ParseResult 
} from '@/lib/standings-parser';

interface TournamentResultsPublisherProps {
  tournaments: Tournament[];
  activeTourney: Tournament | null;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  onSuccess: () => void;
}

const SAMPLE_STANDARD_CDR = `1 | Saim, Bachir | ASSN | 1966 | 6.5 | 0 | 28.5 | 32
2 | Dorbane, Khaled | ASSN | 2086 | 6 | 0 | 31.5 | 33.5
3 | Mekerba, Sidahmed | AMCHLEF | 0 | 6 | 0 | 29 | 31.5
4 | Touahar, Khireddine | OMB | 1788 | 6 | 0 | 28.5 | 30
5 | Bouazdia, Yassine | AMCHLEF | 1846 | 6 | 0 | 27 | 30
6 | Belgaid, Abderaouf | Alger | 1655 | 5.5 | 0 | 26.5 | 29.5
7 | Tahir, Abderrahmane | AMCHLEF | 1796 | 5 | 0 | 29.5 | 32
8 | Saoudi, Mohamed Lamine | Himaya Djelfa | 1899 | 5 | 0 | 28.5 | 31.5`;

const SAMPLE_CHESS_RESULTS = `1\tBenlaid, Lakhdar\tALG\t1851\tMACOMADES\t4,5\t0\t13,5\t14,75
2\tBouzitoune, Abdelhafid\tALG\t0\tHAMRA ANNABA\t4,0\t0\t13,0\t10,50
3\tKoudri, Samir\tALG\t0\tHAMRA ANNABA\t3,5\t0\t13,5\t8,25
4\tAssoul, Abdelaziz\tALG\t1794\tHAMRA ANNABA\t3,0\t0\t13,5\t7,00
5\tTouil, Achref\tALG\t1640\tHAMRA ANNABA\t3,0\t0\t12,0\t5,50
6\tBensaid, Brahim\tALG\t1711\tHAMRA ANNABA\t2,5\t0\t11,5\t4,25
7\tOuerhani, Badreddine\tALG\t0\tHAMRA ANNABA\t2,5\t0\t10,5\t3,75
8\tToumari, Hatem\tALG\t1672\tHAMRA ANNABA\t2,0\t0\t11,0\t3,00`;

const SAMPLE_VERTICAL = `Classement final après 7 rondes
Rg
Rg initial
Nom
FED
Elo
Club/Ville
Pts
Dep.1
Dep.2
Dep.3
1
2
[Saim, Bachir](https://chess-results.com/tnr1458819.aspx?lan=20&art=9&fed=ALG&turdet=YES&snr=2)
ALG
1966
ASSN
6,5
0
28,5
32
2
1
[Dorbane, Khaled](https://chess-results.com/tnr1458819.aspx?lan=20&art=9&fed=ALG&turdet=YES&snr=1)
ALG
2086
ASSN
6
0
31,5
33,5
3
65
[Mekerba, Sidahmed](https://chess-results.com/tnr1458819.aspx?lan=20&art=9&fed=ALG&turdet=YES&snr=65)
ALG
0
AMCHLEF
6
0
29
31,5
4
10
[Touahar, Khireddine](https://chess-results.com/tnr1458819.aspx?lan=20&art=9&fed=ALG&turdet=YES&snr=10)
ALG
1788
OMB
6
0
28,5
30`;

const SAMPLE_WHATSAPP = `1. Benlaid Lakhdar (MACOMADES) - 4.5 pts [Elo 1851]
2. Bouzitoune Abdelhafid (HAMRA ANNABA) - 4 pts
3. Koudri Samir (HAMRA ANNABA) - 3.5 pts
4. Assoul Abdelaziz (HAMRA ANNABA) - 3 pts [Elo 1794]
5. Touil Achref (HAMRA ANNABA) - 3 pts
6. Bensaid Brahim (HAMRA ANNABA) - 2.5 pts`;

export function TournamentResultsPublisher({
  tournaments,
  activeTourney,
  authFetch,
  onSuccess
}: TournamentResultsPublisherProps) {
  // Sélection du tournoi cible
  const [targetId, setTargetId] = useState<string>(activeTourney?.id || tournaments[0]?.id || '');
  const [rawText, setRawText] = useState<string>('');
  const [chessResultsUrl, setChessResultsUrl] = useState<string>('');
  const [syncDirectory, setSyncDirectory] = useState<boolean>(true);

  // Édition manuelle des 3 premiers si besoin
  const [manualPodiumEdit, setManualPodiumEdit] = useState<boolean>(false);
  const [customPodium, setCustomPodium] = useState<Podium>({ first: null, second: null, third: null });

  // États d'action
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [publishedTournament, setPublishedTournament] = useState<Tournament | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Tournoi sélectionné
  const selectedTournament = useMemo(() => {
    return tournaments.find(t => t.id === targetId) || activeTourney || tournaments[0];
  }, [tournaments, targetId, activeTourney]);

  // Synchroniser l'URL Chess-Results si déjà présente dans le tournoi
  useEffect(() => {
    if (selectedTournament?.chessResultsUrl) {
      setChessResultsUrl(selectedTournament.chessResultsUrl);
    }
  }, [selectedTournament]);

  // Analyse automatique en temps réel du texte collé
  const parseResult: ParseResult = useMemo(() => {
    if (!rawText.trim()) {
      return {
        success: false,
        standings: [],
        podium: { first: null, second: null, third: null },
        errors: [],
        warnings: [],
        formatDetected: 'unknown',
        totalParticipants: 0
      };
    }
    return parseTournamentStandings(rawText);
  }, [rawText]);

  // Mettre à jour le customPodium dès que le parser extrait un nouveau podium
  useEffect(() => {
    if (parseResult.success) {
      setCustomPodium({
        first: parseResult.podium.first ? { ...parseResult.podium.first } : null,
        second: parseResult.podium.second ? { ...parseResult.podium.second } : null,
        third: parseResult.podium.third ? { ...parseResult.podium.third } : null,
      });
    }
  }, [parseResult]);

  const activePodium: Podium = manualPodiumEdit ? customPodium : parseResult.podium;

  // Génération du message WhatsApp
  const whatsappMessage = useMemo(() => {
    if (!selectedTournament) return '';
    const siteUrl = typeof window !== 'undefined' ? `${window.location.origin}/archives` : 'https://cercledesrois.dz/archives';
    return generateWhatsAppResultsMessage({
      tournamentTitle: selectedTournament.title,
      tournamentDate: selectedTournament.dateFormatted,
      location: selectedTournament.location,
      edition: selectedTournament.edition,
      podium: activePodium,
      totalParticipants: parseResult.totalParticipants,
      siteUrl
    });
  }, [selectedTournament, activePodium, parseResult.totalParticipants]);

  const handleCopyWhatsApp = async () => {
    if (!whatsappMessage) return;
    try {
      await navigator.clipboard.writeText(whatsappMessage);
      setCopiedWhatsApp(true);
      setTimeout(() => setCopiedWhatsApp(false), 3000);
    } catch {
      alert('Impossible de copier automatiquement dans le presse-papiers.');
    }
  };

  const handleCopyChatGptPrompt = async () => {
    try {
      const promptText = generateChatGptPrompt();
      await navigator.clipboard.writeText(promptText);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 3000);
    } catch {
      alert('Impossible de copier automatiquement dans le presse-papiers.');
    }
  };

  const handlePublish = async () => {
    if (!selectedTournament) {
      alert('Veuillez sélectionner un tournoi cible.');
      return;
    }

    if (!activePodium.first && parseResult.standings.length === 0) {
      alert('Veuillez coller un résultat contenant au moins le vainqueur et les participants classés.');
      return;
    }

    const confirmMsg = `Confirmez-vous la publication officielle du podium et l'archivage de "${selectedTournament.title}" (${parseResult.totalParticipants} joueurs classés) ?`;
    if (!confirm(confirmMsg)) return;

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const payload = {
        action: 'archive',
        podium: activePodium,
        standings: parseResult.standings,
        chessResultsUrl: chessResultsUrl.trim(),
        syncDirectory
      };

      const res = await authFetch(`/api/tournaments/${selectedTournament.id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de la publication.');
      }

      const responseData = await res.json();
      setPublishedTournament(responseData.tournament || selectedTournament);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur serveur';
      setErrorMessage(msg);
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ─── EN-TÊTE DU MODULE ─── */}
      <div className="card-royal p-6 sm:p-8 rounded-2xl border border-[var(--color-rule)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-gold-500" />
              <span>Module Officiel d'Import & Publication</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-2">
              Publication des Résultats & Podium
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Collez le classement brut (Chess-Results, liste WhatsApp ou CSV). Le système extrait automatiquement le Top 3, applique le format d'honneur officiel et archive l'édition.
            </p>
          </div>

          {selectedTournament && (
            <div className="bg-noir-900 px-4 py-3 rounded-xl border border-gold-500/30 text-xs space-y-1">
              <div className="text-slate-400">Tournoi ciblé :</div>
              <div className="font-serif font-bold text-white text-sm">{selectedTournament.title}</div>
              <div className="text-gold-400 flex items-center gap-1.5 font-mono text-[11px]">
                <Calendar className="w-3 h-3" />
                <span>{selectedTournament.dateFormatted}</span>
                <span>•</span>
                <span className={selectedTournament.isArchived ? 'text-slate-400' : 'text-emerald-400 font-bold'}>
                  {selectedTournament.isArchived ? 'Déjà archivé' : 'En cours (Actif)'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* SÉLECTEUR DE TOURNOI CIBLE */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
          <label className="text-slate-300 font-semibold flex items-center gap-1.5 whitespace-nowrap">
            <span>Choisir l'édition à mettre à jour :</span>
          </label>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-gold-500"
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.dateFormatted}) — {t.isArchived ? 'Archivé' : 'ACTIF'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── ZONE DE SAISIE & FORMATS ─── */}
      <div className="card-royal p-6 sm:p-8 rounded-2xl border border-[var(--color-rule)] space-y-6">
        
        {/* BANNIÈRE RECOMMANDATION : LE FORMAT STANDARD CERCLE DES ROIS */}
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-gold-500/15 via-gold-500/10 to-transparent border border-gold-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gold-500 text-noir-950">
                ⭐ Méthode Recommandée
              </span>
              <h4 className="font-serif font-bold text-sm sm:text-base text-white">
                Format Standard Unique (Copier-Coller Instantané)
              </h4>
            </div>
            <p className="text-xs text-slate-300">
              Format officiel : <code className="text-gold-300 font-mono font-bold bg-noir-900/90 px-2 py-0.5 rounded border border-gold-500/30">Rang | Nom | Club | Elo | Points | Dep1 | Dep2 | Dep3</code>
            </p>
            <p className="text-[11px] text-slate-400">
              Collez vos résultats bruts Chess-Results dans ChatGPT avec l'instruction fournie, puis collez le résultat ci-dessous.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyChatGptPrompt}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
                copiedPrompt
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gold-500 hover:bg-gold-400 text-noir-950 shadow-gold-glow'
              }`}
            >
              {copiedPrompt ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Prompt ChatGPT copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-noir-950" />
                  <span>Copier le prompt pour ChatGPT</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setRawText(SAMPLE_STANDARD_CDR)}
              className="px-3.5 py-2 rounded-lg bg-noir-900 hover:bg-noir-850 border border-gold-500/40 hover:border-gold-400 text-gold-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Tester avec l'exemple officiel</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-gold-400" />
              <span>Collez ici le résultat du tournoi</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Supporte le format standard officiel avec barres |, le flux web Chess-Results ou une liste WhatsApp.
            </p>
          </div>

          {/* Boutons d'exemples */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setRawText(SAMPLE_STANDARD_CDR)}
              className="px-3 py-1.5 rounded-lg bg-gold-500/20 border border-gold-500 text-gold-300 hover:bg-gold-500/30 text-xs font-bold transition-colors flex items-center gap-1"
            >
              <span>⭐ Standard (Barres |)</span>
            </button>
            <button
              type="button"
              onClick={() => setRawText(SAMPLE_VERTICAL)}
              className="px-3 py-1.5 rounded-lg bg-noir-850 border border-slate-700 hover:border-gold-500/40 text-slate-300 hover:text-white text-xs transition-colors"
            >
              Exemple Web (Cellules)
            </button>
            <button
              type="button"
              onClick={() => setRawText(SAMPLE_CHESS_RESULTS)}
              className="px-3 py-1.5 rounded-lg bg-noir-850 border border-slate-700 hover:border-gold-500/40 text-slate-300 hover:text-white text-xs transition-colors"
            >
              Exemple Chess-Results (Tabulaire)
            </button>
            <button
              type="button"
              onClick={() => setRawText(SAMPLE_WHATSAPP)}
              className="px-3 py-1.5 rounded-lg bg-noir-850 border border-slate-700 hover:border-gold-500/40 text-slate-300 hover:text-white text-xs transition-colors"
            >
              Exemple WhatsApp
            </button>
            {rawText && (
              <button
                type="button"
                onClick={() => setRawText('')}
                className="px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 hover:text-white text-xs transition-colors"
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            rows={8}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Collez ici le classement brut, par exemple :&#10;1 | Saim, Bachir | ASSN | 1966 | 6.5 | 0 | 28.5 | 32&#10;2 | Dorbane, Khaled | ASSN | 2086 | 6 | 0 | 31.5 | 33.5&#10;3 | Mekerba, Sidahmed | AMCHLEF | 0 | 6 | 0 | 29 | 31.5&#10;..."
            className="w-full font-mono text-xs sm:text-sm p-4 rounded-xl bg-noir-950 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>

        {/* Diagnostic d'analyse automatique */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            {parseResult.formatDetected !== 'unknown' && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold ${
                parseResult.formatDetected === 'standard-cdr'
                  ? 'bg-gold-500/20 border border-gold-500 text-gold-300'
                  : 'bg-gold-500/10 border border-gold-500/30 text-gold-400'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Format détecté : {
                  parseResult.formatDetected === 'standard-cdr' ? '✨ Standard Officiel Cercle des Rois' :
                  parseResult.formatDetected === 'vertical-stream' ? 'Flux Web Chess-Results' :
                  parseResult.formatDetected === 'chess-results' ? 'Chess-Results (Tabulaire)' :
                  parseResult.formatDetected === 'csv' ? 'Tableur CSV' :
                  'Liste WhatsApp'
                }</span>
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-noir-850 border border-slate-700 text-slate-300">
              <Users className="w-3.5 h-3.5 text-gold-400" />
              <span><strong>{parseResult.totalParticipants}</strong> participants reconnus</span>
            </span>

            {parseResult.errors.length > 0 && (
              <span className="text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{parseResult.errors[0]}</span>
              </span>
            )}
          </div>

          {/* Lien Chess-Results */}
          <div className="w-full sm:w-auto flex items-center gap-2">
            <label className="text-slate-400 whitespace-nowrap">Lien Chess-Results :</label>
            <input
              type="url"
              placeholder="https://chess-results.com/tnr..."
              value={chessResultsUrl}
              onChange={(e) => setChessResultsUrl(e.target.value)}
              className="flex-1 sm:w-64 px-3 py-1.5 rounded-lg bg-noir-900 border border-slate-700 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-gold-500"
            />
          </div>
        </div>
      </div>

      {/* ─── APERÇU EN DIRECT DU PODIUM D'HONNEUR (FORMAT OFFICIEL) ─── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-gold-400" />
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Le Podium d'Honneur (Aperçu en Direct)
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              (Format officiel Cercle des Rois)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setManualPodiumEdit(!manualPodiumEdit)}
            className="inline-flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-300 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{manualPodiumEdit ? 'Mode automatique actif' : 'Ajuster les 3 premiers manuellement'}</span>
          </button>
        </div>

        {/* Les 3 Cartes du Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 2ᵉ Place (Argent) */}
          <div className="order-2 md:order-1 p-6 rounded-2xl bg-noir-850/80 border border-slate-700 flex flex-col justify-between space-y-4 hover:border-slate-500 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-300/10 border border-slate-300/30 flex items-center justify-center text-slate-200 font-bold text-lg">
                🥈 2ᵉ
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Dauphin de l'Édition</div>
              
              {manualPodiumEdit ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Nom du 2ᵉ"
                    value={activePodium.second?.name || ''}
                    onChange={(e) => setCustomPodium({
                      ...customPodium,
                      second: { ...(customPodium.second || { rank: 2, name: '', elo: 0, club: '', points: 0 }), name: e.target.value }
                    })}
                    className="w-full px-2.5 py-1.5 rounded bg-noir-900 border border-slate-700 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Club"
                    value={activePodium.second?.club || ''}
                    onChange={(e) => setCustomPodium({
                      ...customPodium,
                      second: { ...(customPodium.second || { rank: 2, name: '', elo: 0, club: '', points: 0 }), club: e.target.value }
                    })}
                    className="w-full px-2.5 py-1.5 rounded bg-noir-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              ) : (
                <>
                  <h4 className="font-serif text-lg font-bold text-white">
                    {activePodium.second?.name || 'En attente de résultat...'}
                  </h4>
                  <p className="text-xs text-slate-300">
                    {activePodium.second?.club || 'Club non renseigné'}
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pt-3 border-t border-slate-800 gap-1.5">
              <div className="space-y-0.5">
                <span className="text-slate-400">
                  Elo : <span className="font-mono text-slate-200">{activePodium.second?.elo || 'NC'}</span>
                </span>
                {(activePodium.second?.dep1 !== undefined || activePodium.second?.dep2 !== undefined) && (
                  <div className="text-[11px] font-mono text-slate-300">
                    Départages : {[
                      activePodium.second.dep1 !== undefined ? `D1: ${activePodium.second.dep1}` : null,
                      activePodium.second.dep2 !== undefined ? `D2: ${activePodium.second.dep2}` : null,
                      activePodium.second.dep3 !== undefined ? `D3: ${activePodium.second.dep3}` : null,
                    ].filter(Boolean).join(' • ')}
                  </div>
                )}
              </div>
              <span className="font-mono font-bold text-white text-sm">
                {activePodium.second?.points !== undefined ? `${activePodium.second.points} pts` : '—'}
              </span>
            </div>
          </div>

          {/* 1ʳᵉ Place (Champion - Or Impérial) */}
          <div className="order-1 md:order-2 p-6 sm:p-8 rounded-2xl bg-noir-900 border-2 border-gold-500 shadow-gold-glow flex flex-col justify-between space-y-4 md:-translate-y-2">
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-full bg-gold-500/20 border border-gold-400 flex items-center justify-center text-gold-300 font-bold text-xl mx-auto sm:mx-0">
                🥇 1ᵉʳ
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-gold-400 flex items-center justify-center sm:justify-start gap-1">
                <Crown className="w-3.5 h-3.5 text-gold-400" />
                <span>Champion de l'Édition</span>
              </div>

              {manualPodiumEdit ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Nom du Champion"
                    value={activePodium.first?.name || ''}
                    onChange={(e) => setCustomPodium({
                      ...customPodium,
                      first: { ...(customPodium.first || { rank: 1, name: '', elo: 0, club: '', points: 0 }), name: e.target.value }
                    })}
                    className="w-full px-2.5 py-1.5 rounded bg-noir-950 border border-gold-500/50 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Club"
                    value={activePodium.first?.club || ''}
                    onChange={(e) => setCustomPodium({
                      ...customPodium,
                      first: { ...(customPodium.first || { rank: 1, name: '', elo: 0, club: '', points: 0 }), club: e.target.value }
                    })}
                    className="w-full px-2.5 py-1.5 rounded bg-noir-950 border border-gold-500/50 text-xs text-white"
                  />
                </div>
              ) : (
                <>
                  <h4 className="font-serif text-xl sm:text-2xl font-bold text-white">
                    {activePodium.first?.name || 'En attente de résultat...'}
                  </h4>
                  <p className="text-xs text-gold-300">
                    {activePodium.first?.club || 'Club non renseigné'}
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pt-3 border-t border-gold-500/20 gap-1.5">
              <div className="space-y-0.5">
                <span className="text-slate-300">
                  Elo : <span className="font-mono text-white">{activePodium.first?.elo || 'NC'}</span>
                </span>
                {(activePodium.first?.dep1 !== undefined || activePodium.first?.dep2 !== undefined) && (
                  <div className="text-[11px] font-mono text-gold-300">
                    Départages : {[
                      activePodium.first.dep1 !== undefined ? `D1: ${activePodium.first.dep1}` : null,
                      activePodium.first.dep2 !== undefined ? `D2: ${activePodium.first.dep2}` : null,
                      activePodium.first.dep3 !== undefined ? `D3: ${activePodium.first.dep3}` : null,
                    ].filter(Boolean).join(' • ')}
                  </div>
                )}
              </div>
              <span className="font-mono font-bold text-gold-400 text-lg">
                {activePodium.first?.points !== undefined ? `${activePodium.first.points} pts` : '—'}
              </span>
            </div>
          </div>

          {/* 3ᵉ Place (Bronze) */}
          <div className="order-3 p-6 rounded-2xl bg-noir-850/80 border border-amber-800/40 flex flex-col justify-between space-y-4 hover:border-amber-700/60 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-600/10 border border-amber-600/30 flex items-center justify-center text-amber-400 font-bold text-lg">
                🥉 3ᵉ
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">3ᵉ Place du Podium</div>

              {manualPodiumEdit ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Nom du 3ᵉ"
                    value={activePodium.third?.name || ''}
                    onChange={(e) => setCustomPodium({
                      ...customPodium,
                      third: { ...(customPodium.third || { rank: 3, name: '', elo: 0, club: '', points: 0 }), name: e.target.value }
                    })}
                    className="w-full px-2.5 py-1.5 rounded bg-noir-900 border border-slate-700 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Club"
                    value={activePodium.third?.club || ''}
                    onChange={(e) => setCustomPodium({
                      ...customPodium,
                      third: { ...(customPodium.third || { rank: 3, name: '', elo: 0, club: '', points: 0 }), club: e.target.value }
                    })}
                    className="w-full px-2.5 py-1.5 rounded bg-noir-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              ) : (
                <>
                  <h4 className="font-serif text-lg font-bold text-white">
                    {activePodium.third?.name || 'En attente de résultat...'}
                  </h4>
                  <p className="text-xs text-slate-300">
                    {activePodium.third?.club || 'Club non renseigné'}
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pt-3 border-t border-slate-800 gap-1.5">
              <div className="space-y-0.5">
                <span className="text-slate-400">
                  Elo : <span className="font-mono text-slate-200">{activePodium.third?.elo || 'NC'}</span>
                </span>
                {(activePodium.third?.dep1 !== undefined || activePodium.third?.dep2 !== undefined) && (
                  <div className="text-[11px] font-mono text-amber-300/90">
                    Départages : {[
                      activePodium.third.dep1 !== undefined ? `D1: ${activePodium.third.dep1}` : null,
                      activePodium.third.dep2 !== undefined ? `D2: ${activePodium.third.dep2}` : null,
                      activePodium.third.dep3 !== undefined ? `D3: ${activePodium.third.dep3}` : null,
                    ].filter(Boolean).join(' • ')}
                  </div>
                )}
              </div>
              <span className="font-mono font-bold text-white text-sm">
                {activePodium.third?.points !== undefined ? `${activePodium.third.points} pts` : '—'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ─── TABLEAU COMPLET DES PARTICIPANTS CLASSÉS ─── */}
      {parseResult.standings.length > 0 && (
        <div className="card-royal p-6 rounded-2xl border border-[var(--color-rule)] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <Medal className="w-4 h-4 text-gold-400" />
              <span>Classement Général Extrait ({parseResult.standings.length} Joueurs)</span>
            </h4>
            <span className="text-xs text-slate-400">
              Prêt pour archivage dans la grille officielle
            </span>
          </div>

          {(() => {
            const hasTieBreaks = parseResult.standings.some(p => p.dep1 !== undefined || p.dep2 !== undefined);
            return (
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-noir-900 text-slate-400 border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold w-12">Rg</th>
                      <th className="py-2.5 px-3 font-semibold">Nom & Prénom</th>
                      <th className="py-2.5 px-3 font-semibold">Club</th>
                      <th className="py-2.5 px-3 font-semibold w-16">Elo</th>
                      <th className="py-2.5 px-3 font-semibold w-20 text-right">Points</th>
                      {hasTieBreaks && (
                        <>
                          <th className="py-2.5 px-2 font-semibold w-16 text-right font-mono">Dép. 1</th>
                          <th className="py-2.5 px-2 font-semibold w-16 text-right font-mono">Dép. 2</th>
                          <th className="py-2.5 px-2 font-semibold w-16 text-right font-mono">Dép. 3</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {parseResult.standings.map((p) => (
                      <tr key={p.rank} className={p.rank <= 3 ? 'bg-gold-500/5 font-medium' : 'hover:bg-noir-900/50'}>
                        <td className="py-2 px-3 font-mono">
                          {p.rank === 1 ? '🥇 1' : p.rank === 2 ? '🥈 2' : p.rank === 3 ? '🥉 3' : p.rank}
                        </td>
                        <td className="py-2 px-3 text-white font-medium">{p.name}</td>
                        <td className="py-2 px-3 text-slate-400">{p.club || 'Indépendant'}</td>
                        <td className="py-2 px-3 font-mono text-slate-400">{p.elo || 'NC'}</td>
                        <td className="py-2 px-3 font-mono font-bold text-gold-400 text-right">{p.points}</td>
                        {hasTieBreaks && (
                          <>
                            <td className="py-2 px-2 font-mono text-slate-300 text-right">{p.dep1 !== undefined ? p.dep1 : '—'}</td>
                            <td className="py-2 px-2 font-mono text-slate-300 text-right">{p.dep2 !== undefined ? p.dep2 : '—'}</td>
                            <td className="py-2 px-2 font-mono text-slate-300 text-right">{p.dep3 !== undefined ? p.dep3 : '—'}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* ─── OPTIONS & ACTIONS DE PUBLICATION ─── */}
      <div className="card-royal p-6 sm:p-8 rounded-2xl border-2 border-gold-500/30 space-y-6">
        
        {/* Toggle Synchronisation Annuaire */}
        <div className="flex items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-noir-900 border border-slate-800">
          <div>
            <div className="font-semibold text-white text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-gold-400" />
              <span>Synchroniser automatiquement l'annuaire des membres</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Incrémente le nombre de tournois joués, met à jour le meilleur rang et ajoute cette édition à l'historique de chaque joueur.
            </p>
          </div>
          <input
            type="checkbox"
            checked={syncDirectory}
            onChange={(e) => setSyncDirectory(e.target.checked)}
            className="w-5 h-5 rounded accent-gold-500 cursor-pointer"
          />
        </div>

        {/* Boutons d'Action */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            type="button"
            disabled={isSubmitting || !activePodium.first}
            onClick={handlePublish}
            className={`w-full sm:flex-1 py-4 px-6 rounded-xl font-serif text-base font-bold flex items-center justify-center gap-3 transition-all ${
              !activePodium.first
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gold-500 hover:bg-gold-400 text-noir-950 shadow-gold-glow active:scale-[0.99]'
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Publication en cours...</span>
              </>
            ) : (
              <>
                <Crown className="w-5 h-5 text-noir-950" />
                <span>Publier Officiellement & Archiver le Tournoi</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={!activePodium.first}
            onClick={handleCopyWhatsApp}
            className={`w-full sm:w-auto py-4 px-6 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border transition-all ${
              copiedWhatsApp
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                : 'bg-noir-850 hover:bg-noir-900 border-gold-500/40 text-gold-400 hover:text-gold-300'
            }`}
          >
            {copiedWhatsApp ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Communiqué WhatsApp copié !</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Copier le communiqué WhatsApp</span>
              </>
            )}
          </button>
        </div>

        {/* Message de succès après publication */}
        {publishedTournament && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Tournoi "{publishedTournament.title}" clôturé et archivé avec succès !</span>
            </div>
            <p className="text-xs text-emerald-200">
              Le podium d'honneur et la grille de classement sont désormais publiés et visibles publiquement.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/archives"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold"
              >
                <span>Voir les Archives officielles</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold"
              >
                <span>Voir sur la Page d'Accueil</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
