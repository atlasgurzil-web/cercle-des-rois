'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Calendar, 
  Users, 
  Trophy, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Trash2, 
  Phone, 
  Mail, 
  Clock, 
  MapPin, 
  Crown, 
  Flame, 
  Sparkles,
  ExternalLink,
  Archive,
  RefreshCw,
  Search
} from 'lucide-react';
import { Tournament, PlayerRegistration, DirectoryPlayer } from '@/types';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Dashboard Tabs: 'active-tournament' | 'create-tournament' | 'archive-tournament' | 'directory'
  const [activeTab, setActiveTab] = useState<'active-tournament' | 'create-tournament' | 'archive-tournament' | 'directory'>('active-tournament');

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [players, setPlayers] = useState<DirectoryPlayer[]>([]);
  const [loading, setLoading] = useState(false);

  // New Tournament form
  const [newTourney, setNewTourney] = useState({
    title: 'Le Cercle des Rois V – Édition Spéciale',
    date: '2026-11-05',
    time: '20:30 (Après la prière d\'Isha)',
    location: 'Café Dardara, Annaba',
    cadence: 'Blitz 5m + 3s',
    maxParticipants: 32,
    rounds: 7,
    fee: '0',
    feeDescription: 'Gratuit / Entrée libre (consommation au café)',
    prizes: 'Trophée Le Cercle des Rois & Médailles d\'Honneur',
    description: 'Rendez-vous mensuel du premier jeudi du mois après la prière d\'Isha. Tournoi amical et fraternel.',
    rules: 'Système suisse en 7 rondes. Pendules et jeux fournis.'
  });

  // Archive modal form
  const [archiveForm, setArchiveForm] = useState({
    firstWinner: '',
    firstPoints: '6',
    secondWinner: '',
    secondPoints: '5.5',
    thirdWinner: '',
    thirdPoints: '5',
    chessResultsUrl: ''
  });

  // Directory search
  const [dirSearch, setDirSearch] = useState('');

  // Check session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('cdr_admin_auth');
      if (stored === 'valid') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tRes, pRes] = await Promise.all([
        fetch('/api/tournaments'),
        fetch('/api/players')
      ]);
      const tData = await tRes.json();
      const pData = await pRes.json();
      setTournaments(tData);
      setPlayers(pData);
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '12081988') {
      setIsAuthenticated(true);
      sessionStorage.setItem('cdr_admin_auth', 'valid');
      setAuthError('');
    } else {
      setAuthError('Code PIN secret incorrect.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('cdr_admin_auth');
  };

  const activeTourney = tournaments.find(t => !t.isArchived) || tournaments[0];

  // Checkin & Paid actions
  const handleAction = async (action: 'checkin' | 'paid' | 'remove', regId: string) => {
    if (!activeTourney) return;
    if (action === 'remove' && !confirm('Supprimer définitivement cette inscription ?')) return;

    try {
      const res = await fetch(`/api/tournaments/${activeTourney.id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, registrationId: regId })
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create tournament
  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTourney)
      });
      if (res.ok) {
        alert('Nouveau tournoi créé et publié avec succès !');
        setActiveTab('active-tournament');
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Erreur lors de la création');
      }
    } catch (err) {
      alert('Erreur serveur');
    }
  };

  // Archive tournament
  const handleArchiveTournament = async () => {
    if (!activeTourney) return;
    if (!confirm(`Confirmer la clôture et l'archivage de "${activeTourney.title}" ?`)) return;

    try {
      const podium = {
        first: archiveForm.firstWinner ? { rank: 1, name: archiveForm.firstWinner, points: parseFloat(archiveForm.firstPoints), elo: 0 } : null,
        second: archiveForm.secondWinner ? { rank: 2, name: archiveForm.secondWinner, points: parseFloat(archiveForm.secondPoints), elo: 0 } : null,
        third: archiveForm.thirdWinner ? { rank: 3, name: archiveForm.thirdWinner, points: parseFloat(archiveForm.thirdPoints), elo: 0 } : null,
      };

      const res = await fetch(`/api/tournaments/${activeTourney.id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'archive',
          podium,
          chessResultsUrl: archiveForm.chessResultsUrl
        })
      });

      if (res.ok) {
        alert('Tournoi clôturé et archivé avec succès !');
        loadData();
      }
    } catch (err) {
      alert('Erreur serveur');
    }
  };

  // Export registrations for Papi / Swiss-Manager
  const handleExportPapi = () => {
    if (!activeTourney || !activeTourney.registeredPlayers) return;

    const headers = ['N', 'Nom', 'Prenom', 'Club', 'FIDE_ID', 'Date_Naissance', 'Telephone', 'Email', 'Statut', 'Pointe_Arrivee', 'Paye'];
    const rows = activeTourney.registeredPlayers.map((p, idx) => [
      idx + 1,
      `"${p.nom}"`,
      `"${p.prenom}"`,
      `"${p.club || 'Indépendant'}"`,
      `"${p.fideId || ''}"`,
      `"${p.dateNaissance || ''}"`,
      `"${p.telephone}"`,
      `"${p.email || ''}"`,
      `"${p.status}"`,
      p.isCheckedIn ? 'OUI' : 'NON',
      p.isPaid ? 'OUI' : 'NON'
    ]);

    const csv = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inscrits_${activeTourney.slug}_papi.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // LOGIN SCREEN IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl card-royal border-2 border-gold-500/40 shadow-gold-glow-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/40 flex items-center justify-center text-gold-400 mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Espace Organisateur
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Veuillez saisir votre code PIN secret pour accéder à la gestion du Cercle des Rois.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                autoFocus
                placeholder="Code PIN..."
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-noir-900 border border-slate-700 text-center font-mono text-xl tracking-widest text-gold-400 focus:border-gold-500 transition-colors"
              />
            </div>

            {authError && (
              <div className="text-xs text-rose-400 bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold bg-gold-500 text-noir-950 hover:bg-gold-400 shadow-gold-glow transition-colors"
            >
              Déverrouiller le Panneau
            </button>
          </form>

          <div className="text-[11px] text-slate-400">
            Réservé aux membres du comité d'organisation d'Annaba
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD
  const confirmed = activeTourney?.registeredPlayers?.filter(p => p.status === 'confirmed') || [];
  const waitlist = activeTourney?.registeredPlayers?.filter(p => p.status === 'waitlist') || [];
  const checkedInCount = activeTourney?.registeredPlayers?.filter(p => p.isCheckedIn).length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-gold-400 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Administration Active • Annaba</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white">
            Tableau de Bord du <span className="text-gold-400">Cercle des Rois</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-noir-850 text-slate-300 border border-slate-700 hover:text-gold-400 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-noir-850 text-rose-400 border border-rose-500/30 hover:bg-rose-500/10 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('active-tournament')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-150 ${
            activeTab === 'active-tournament'
              ? 'bg-gold-500 text-noir-950 font-bold'
              : 'bg-noir-850 text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>Tournoi Actif ({confirmed.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('create-tournament')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-150 ${
            activeTab === 'create-tournament'
              ? 'bg-gold-500 text-noir-950 font-bold'
              : 'bg-noir-850 text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          <PlusCircle className="w-4 h-4 flex-shrink-0" />
          <span>Créer un Nouveau Tournoi</span>
        </button>

        <button
          onClick={() => setActiveTab('archive-tournament')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-150 ${
            activeTab === 'archive-tournament'
              ? 'bg-gold-500 text-noir-950 font-bold'
              : 'bg-noir-850 text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          <Archive className="w-4 h-4 flex-shrink-0" />
          <span>Clôturer & Archiver</span>
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-150 ${
            activeTab === 'directory'
              ? 'bg-gold-500 text-noir-950 font-bold'
              : 'bg-noir-850 text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          <Users className="w-4 h-4 flex-shrink-0" />
          <span>Annuaire ({players.length} Joueurs)</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE TOURNAMENT MANAGEMENT */}
      {activeTab === 'active-tournament' && (
        <div className="space-y-6 animate-in fade-in">
          {activeTourney ? (
            <>
              {/* Tourney Summary Banner */}
              <div className="p-6 rounded-2xl card-royal border border-gold-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gold-400 uppercase">
                    <span>Édition #{activeTourney.edition}</span>
                    <span>•</span>
                    <span>{activeTourney.dateFormatted}</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-white">
                    {activeTourney.title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {activeTourney.location} • {activeTourney.time} • Cadence : {activeTourney.cadence}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/tournoi/${activeTourney.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-noir-800 text-slate-200 border border-slate-700 hover:border-gold-500/50"
                  >
                    <span>Voir la Page Publique</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={handleExportPapi}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-gold-500 text-noir-950 hover:bg-gold-400 shadow-gold-glow transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exporter pour Papi / Swiss (CSV)</span>
                  </button>
                </div>
              </div>

              {/* Key Check-in Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-noir-850 border border-slate-800">
                  <div className="text-[11px] text-slate-300 uppercase font-semibold">Inscrits Confirmés</div>
                  <div className="text-2xl font-bold text-white font-mono mt-1">
                    {confirmed.length} / {activeTourney.maxParticipants}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-noir-850 border border-slate-800">
                  <div className="text-[11px] text-emerald-400 uppercase font-semibold">Présents Pointés</div>
                  <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                    {checkedInCount} / {confirmed.length}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-noir-850 border border-slate-800">
                  <div className="text-[11px] text-amber-400 uppercase font-semibold">Liste d'Attente</div>
                  <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
                    {waitlist.length}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-noir-850 border border-slate-800">
                  <div className="text-[11px] text-gold-400 uppercase font-semibold">Places Libres</div>
                  <div className="text-2xl font-bold text-gold-400 font-mono mt-1">
                    {Math.max(0, activeTourney.maxParticipants - confirmed.length)}
                  </div>
                </div>
              </div>

              {/* Players Table with Live Checkin & Controls */}
              <div className="p-6 rounded-2xl card-royal border border-gold-500/20 space-y-4">
                <h3 className="font-serif text-lg font-bold text-white flex items-center justify-between">
                  <span>Liste des Inscriptions & Pointage sur Place</span>
                  <span className="text-xs text-slate-300 font-normal">
                    Cliquez sur "Pointage" à l'arrivée du joueur au Café Dardara
                  </span>
                </h3>

                {activeTourney.registeredPlayers?.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    Aucun joueur inscrit pour le moment.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-300 uppercase text-[11px] font-semibold">
                          <th className="py-2.5 px-3">N°</th>
                          <th className="py-2.5 px-3">Joueur</th>
                          <th className="py-2.5 px-3">Téléphone (WhatsApp)</th>
                          <th className="py-2.5 px-3">Club</th>
                          <th className="py-2.5 px-3">ID FIDE</th>
                          <th className="py-2.5 px-3 text-center">Pointage (Présence)</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                        {activeTourney.registeredPlayers?.map((p, idx) => (
                          <tr key={p.id} className="hover:bg-noir-800/50 transition-colors">
                            <td className="py-3 px-3 text-slate-300">
                              #{idx + 1}
                            </td>
                            <td className="py-3 px-3 font-sans font-semibold text-white">
                              <div>{p.nom} {p.prenom}</div>
                              {p.dateNaissance && <div className="text-[10px] text-slate-400 font-mono">Né(e) le {p.dateNaissance}</div>}
                            </td>
                            <td className="py-3 px-3">
                              <a
                                href={`https://wa.me/213${p.telephone.replace(/^0/, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:underline flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3 flex-shrink-0" />
                                <span>{p.telephone}</span>
                              </a>
                            </td>
                            <td className="py-3 px-3 font-sans text-slate-300">
                              {p.club || 'Indépendant'}
                            </td>
                            <td className="py-3 px-3 text-gold-400 font-semibold">
                              {p.fideId || '-'}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={() => handleAction('checkin', p.id)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                                  p.isCheckedIn
                                    ? 'bg-emerald-500 text-noir-950 shadow-sm'
                                    : 'bg-noir-850 text-slate-300 border border-slate-700 hover:border-emerald-500/60'
                                }`}
                              >
                                {p.isCheckedIn ? '✓ Présent' : 'Non pointé'}
                              </button>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => handleAction('remove', p.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4 flex-shrink-0" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center card-royal rounded-2xl">
              <p className="text-slate-400">Aucun tournoi actif. Créez-en un dans l'onglet dédié !</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CREATE TOURNAMENT FORM */}
      {activeTab === 'create-tournament' && (
        <div className="max-w-3xl card-royal p-8 rounded-2xl border border-gold-500/30 space-y-6 animate-in fade-in">
          <div>
            <h2 className="font-serif text-2xl font-bold text-white">Créer un Nouveau Tournoi</h2>
            <p className="text-xs text-slate-400 mt-1">
              Remplissez les détails pour ouvrir immédiatement les inscriptions publiques et générer le lien de partage WhatsApp.
            </p>
          </div>

          <form onSubmit={handleCreateTournament} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Titre de l'édition</label>
              <input
                type="text"
                required
                value={newTourney.title}
                onChange={(e) => setNewTourney({ ...newTourney, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-noir-900 border border-slate-700 text-sm text-white focus:border-gold-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Date du Tournoi</label>
                <input
                  type="date"
                  required
                  value={newTourney.date}
                  onChange={(e) => setNewTourney({ ...newTourney, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-noir-900 border border-slate-700 text-sm text-white focus:border-gold-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Horaire</label>
                <input
                  type="text"
                  value={newTourney.time}
                  onChange={(e) => setNewTourney({ ...newTourney, time: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-noir-900 border border-slate-700 text-sm text-white focus:border-gold-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Lieu physique</label>
                <input
                  type="text"
                  required
                  value={newTourney.location}
                  onChange={(e) => setNewTourney({ ...newTourney, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-noir-900 border border-slate-700 text-sm text-white focus:border-gold-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Cadence de jeu</label>
                <input
                  type="text"
                  value={newTourney.cadence}
                  onChange={(e) => setNewTourney({ ...newTourney, cadence: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-noir-900 border border-slate-700 text-sm text-white focus:border-gold-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Jauge Max (Participants)</label>
                <input
                  type="number"
                  value={newTourney.maxParticipants}
                  onChange={(e) => setNewTourney({ ...newTourney, maxParticipants: parseInt(e.target.value) || 32 })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-noir-900 border border-slate-700 text-sm text-white focus:border-gold-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Nombre de Rondes</label>
                <input
                  type="number"
                  value={newTourney.rounds}
                  onChange={(e) => setNewTourney({ ...newTourney, rounds: parseInt(e.target.value) || 7 })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-noir-900 border border-slate-700 text-sm text-white focus:border-gold-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Description & Message aux joueurs</label>
              <textarea
                rows={3}
                value={newTourney.description}
                onChange={(e) => setNewTourney({ ...newTourney, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-noir-900 border border-slate-700 text-sm text-white focus:border-gold-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl font-bold bg-gold-500 text-noir-950 hover:bg-gold-400 shadow-gold-glow transition-colors"
            >
              Publier le Tournoi & Activer les Inscriptions
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: CLÔTURE & ARCHIVAGE */}
      {activeTab === 'archive-tournament' && (
        <div className="max-w-3xl card-royal p-8 rounded-2xl border border-gold-500/30 space-y-6 animate-in fade-in">
          <div>
            <h2 className="font-serif text-2xl font-bold text-white">Clôturer le Tournoi & Sauvegarder aux Archives</h2>
            <p className="text-xs text-slate-400 mt-1">
              Une fois le tournoi disputé, entrez le podium final pour transférer automatiquement cette édition dans les Archives & le Palmarès officiel.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gold-400">🥇 1ᵉʳ Vainqueur (Nom & Prénom)</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="ex: Benlaid Lakhdar"
                  value={archiveForm.firstWinner}
                  onChange={(e) => setArchiveForm({ ...archiveForm, firstWinner: e.target.value })}
                  className="col-span-2 px-3.5 py-2 rounded-lg bg-noir-900 border border-slate-700 text-sm text-white"
                />
                <input
                  type="number"
                  step="0.5"
                  placeholder="Points (ex: 6)"
                  value={archiveForm.firstPoints}
                  onChange={(e) => setArchiveForm({ ...archiveForm, firstPoints: e.target.value })}
                  className="px-3.5 py-2 rounded-lg bg-noir-900 border border-slate-700 text-sm text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">🥈 2ᵉ Place (Nom & Prénom)</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="ex: Touil Achref"
                  value={archiveForm.secondWinner}
                  onChange={(e) => setArchiveForm({ ...archiveForm, secondWinner: e.target.value })}
                  className="col-span-2 px-3.5 py-2 rounded-lg bg-noir-900 border border-slate-700 text-sm text-white"
                />
                <input
                  type="number"
                  step="0.5"
                  placeholder="Points (ex: 5.5)"
                  value={archiveForm.secondPoints}
                  onChange={(e) => setArchiveForm({ ...archiveForm, secondPoints: e.target.value })}
                  className="px-3.5 py-2 rounded-lg bg-noir-900 border border-slate-700 text-sm text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-amber-500">🥉 3ᵉ Place (Nom & Prénom)</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="ex: Koudri Samir"
                  value={archiveForm.thirdWinner}
                  onChange={(e) => setArchiveForm({ ...archiveForm, thirdWinner: e.target.value })}
                  className="col-span-2 px-3.5 py-2 rounded-lg bg-noir-900 border border-slate-700 text-sm text-white"
                />
                <input
                  type="number"
                  step="0.5"
                  placeholder="Points (ex: 5)"
                  value={archiveForm.thirdPoints}
                  onChange={(e) => setArchiveForm({ ...archiveForm, thirdPoints: e.target.value })}
                  className="px-3.5 py-2 rounded-lg bg-noir-900 border border-slate-700 text-sm text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Lien Chess-Results (Optionnel)</label>
              <input
                type="url"
                placeholder="https://chess-results.com/tnr..."
                value={archiveForm.chessResultsUrl}
                onChange={(e) => setArchiveForm({ ...archiveForm, chessResultsUrl: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg bg-noir-900 border border-slate-700 text-sm text-white"
              />
            </div>

            <button
              type="button"
              onClick={handleArchiveTournament}
              className="w-full py-3.5 rounded-xl font-bold bg-amber-500 text-noir-950 hover:bg-amber-400 transition-colors mt-2"
            >
              Enregistrer aux Archives du Club
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: DIRECTORY MANAGEMENT */}
      {activeTab === 'directory' && (
        <div className="card-royal p-6 sm:p-8 rounded-2xl border border-gold-500/20 space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-white">Annuaire Central des Joueurs</h2>
              <p className="text-xs text-slate-400">
                {players.length} joueurs répertoriés avec coordonnées directes pour communications et convocations WhatsApp.
              </p>
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou tél..."
                value={dirSearch}
                onChange={(e) => setDirSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-noir-900 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-300 uppercase text-[11px] font-semibold">
                  <th className="py-2.5 px-3">Nom & Prénom</th>
                  <th className="py-2.5 px-3">Téléphone</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Club</th>
                  <th className="py-2.5 px-3">Elo</th>
                  <th className="py-2.5 px-3 text-center">Tournois CDR</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {players.filter(p => p.nomComplet.toLowerCase().includes(dirSearch.toLowerCase()) || (p.telephone && p.telephone.includes(dirSearch))).map(p => (
                  <tr key={p.id} className="hover:bg-noir-800/50 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-bold text-white">
                      {p.nomComplet}
                    </td>
                    <td className="py-2.5 px-3">
                      {p.telephone ? (
                        <a
                          href={`https://wa.me/213${p.telephone.replace(/^0/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span>{p.telephone}</span>
                        </a>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans truncate max-w-[160px]">
                      {p.email || '-'}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-300">
                      {p.club || 'Indépendant'}
                    </td>
                    <td className="py-2.5 px-3 text-gold-400 font-semibold">
                      {p.elo > 0 ? p.elo : 'NC'}
                    </td>
                    <td className="py-2.5 px-3 text-center text-white font-bold">
                      {p.nbTournois}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {p.telephone && (
                        <a
                          href={`https://wa.me/213${p.telephone.replace(/^0/, '')}?text=${encodeURIComponent(`Salam ${p.prenom}, rendez-vous au prochain tournoi du Cercle des Rois !`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-semibold hover:bg-emerald-500/30 transition-colors"
                        >
                          Message
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
