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
  Edit2,
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
  Search,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { Tournament, PlayerRegistration, DirectoryPlayer } from '@/types';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Dashboard Tabs: 'active-tournament' | 'all-tournaments' | 'create-tournament' | 'archive-tournament' | 'directory'
  const [activeTab, setActiveTab] = useState<'active-tournament' | 'all-tournaments' | 'create-tournament' | 'archive-tournament' | 'directory'>('active-tournament');
  const [pointageTab, setPointageTab] = useState<'confirmed' | 'waitlist'>('confirmed');

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [players, setPlayers] = useState<DirectoryPlayer[]>([]);
  const [loading, setLoading] = useState(false);

  // New Tournament form
  const [newTourney, setNewTourney] = useState({
    title: 'Le Cercle des Rois V – Édition Spéciale',
    date: '2026-11-05',
    time: '20:30 (Après la prière d\'Isha)',
    location: 'Café Dardara / Selon édition, Annaba',
    cadence: 'Blitz 5m + 3s',
    maxParticipants: 32,
    rounds: 7,
    fee: '0',
    feeDescription: 'Gratuit / Entrée libre (consommation sur place)',
    prizes: 'Trophée Le Cercle des Rois & Médailles d\'Honneur',
    description: 'Rendez-vous mensuel du premier jeudi du mois après la prière d\'Isha. Tournoi amical et fraternel.',
    rules: 'Système suisse en 7 rondes. Pendules et jeux fournis.'
  });

  // Edit Tournament Modal State
  const [editingTourney, setEditingTourney] = useState<Tournament | null>(null);

  // Edit Player Modal State
  const [editingPlayer, setEditingPlayer] = useState<DirectoryPlayer | null>(null);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayerForm, setNewPlayerForm] = useState({
    nom: '',
    prenom: '',
    club: 'Hamra Annaba',
    elo: 0,
    fideId: '',
    telephone: '',
    email: '',
    dateNaissance: ''
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

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('cdr_admin_token') : '';
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const authFetch = (url: string, options: RequestInit = {}) => {
    const authHeaders = getAuthHeaders();
    return fetch(url, {
      ...options,
      headers: {
        ...authHeaders,
        ...(options.headers || {})
      }
    });
  };

  // Check session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('cdr_admin_token');
      if (stored) {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tRes, pRes] = await Promise.all([
        authFetch('/api/tournaments'),
        authFetch('/api/players')
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('cdr_admin_token', data.token);
        setIsAuthenticated(true);
        setAuthError('');
        setPinInput('');
      } else {
        setAuthError(data.error || 'Code PIN secret incorrect.');
      }
    } catch {
      setAuthError('Erreur de connexion au serveur.');
    }
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('cdr_admin_token');
    await fetch('/api/auth', { method: 'DELETE' }).catch(() => {});
  };

  const activeTourney = tournaments.find(t => !t.isArchived) || tournaments[0];

  // Checkin & Paid actions for active tournament registrations
  const handleAction = async (action: 'checkin' | 'paid' | 'remove' | 'promote', regId: string) => {
    if (!activeTourney) return;
    if (action === 'remove' && !confirm('Supprimer définitivement cette inscription ?')) return;
    if (action === 'promote' && !confirm('Promouvoir ce joueur en liste principale et lui attribuer un numéro de dossard ?')) return;

    try {
      const res = await authFetch(`/api/tournaments/${activeTourney.id}/checkin`, {
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
      const res = await authFetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTourney)
      });
      if (res.ok) {
        alert('Nouveau tournoi créé et publié avec succès !');
        setActiveTab('all-tournaments');
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Erreur lors de la création');
      }
    } catch (err) {
      alert('Erreur serveur');
    }
  };

  // Save edited tournament
  const handleUpdateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTourney) return;

    try {
      const res = await authFetch(`/api/tournaments/${editingTourney.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTourney)
      });
      if (res.ok) {
        alert('Tournoi mis à jour avec succès !');
        setEditingTourney(null);
        loadData();
      } else {
        alert('Erreur lors de la mise à jour');
      }
    } catch (err) {
      alert('Erreur serveur');
    }
  };

  // Delete tournament
  const handleDeleteTournament = async (tId: string, tTitle: string) => {
    if (!confirm(`Supprimer définitivement le tournoi "${tTitle}" ? Cette action est irréversible.`)) return;

    try {
      const res = await authFetch(`/api/tournaments/${tId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('Tournoi supprimé avec succès.');
        loadData();
      } else {
        alert('Erreur lors de la suppression');
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

      const res = await authFetch(`/api/tournaments/${activeTourney.id}/checkin`, {
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

  // Save edited player
  const handleUpdatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;

    try {
      const res = await authFetch('/api/players', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPlayer)
      });
      if (res.ok) {
        alert('Fiche joueur mise à jour avec succès !');
        setEditingPlayer(null);
        loadData();
      } else {
        alert('Erreur lors de la mise à jour');
      }
    } catch (err) {
      alert('Erreur serveur');
    }
  };

  // Delete player
  const handleDeletePlayer = async (pId: string, pName: string) => {
    if (!confirm(`Supprimer définitivement le joueur "${pName}" de l'annuaire ?`)) return;

    try {
      const res = await authFetch(`/api/players?id=${pId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('Joueur supprimé de l\'annuaire.');
        loadData();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (err) {
      alert('Erreur serveur');
    }
  };

  // Create new player
  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlayerForm)
      });
      if (res.ok) {
        alert('Joueur ajouté avec succès à l\'annuaire !');
        setIsAddingPlayer(false);
        setNewPlayerForm({
          nom: '',
          prenom: '',
          club: 'Hamra Annaba',
          elo: 0,
          fideId: '',
          telephone: '',
          email: '',
          dateNaissance: ''
        });
        loadData();
      } else {
        alert('Erreur lors de la création du joueur');
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

  // Export entire players directory to CSV
  const handleExportDirectoryCSV = () => {
    const headers = ['N', 'Nom', 'Prenom', 'Club', 'FIDE_ID', 'Elo', 'Nb_Tournois_CDR', 'Meilleur_Rang', 'Telephone', 'Email', 'Date_Naissance'];
    const rows = players.map((p, idx) => [
      idx + 1,
      `"${p.nom}"`,
      `"${p.prenom}"`,
      `"${p.club || 'Indépendant'}"`,
      `"${p.fideId || ''}"`,
      p.elo || 0,
      p.nbTournois || 0,
      p.bestRank ? `#${p.bestRank}` : '',
      `"${p.telephone || ''}"`,
      `"${p.email || ''}"`,
      `"${p.dateNaissance || ''}"`
    ]);

    const csv = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `annuaire_joueurs_cercle_des_rois_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // LOGIN SCREEN IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 pt-28 pb-16">
        <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl card-royal border border-[var(--color-rule-2)] text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[oklch(17%_0.016_265)] border border-[var(--color-rule-2)] flex items-center justify-center text-[var(--color-accent)] mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Espace Organisateur
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Veuillez saisir votre code PIN secret pour accéder à la gestion complète du Cercle des Rois.
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
                className="w-full px-4 py-3 rounded-xl bg-noir-900 border border-slate-700 text-center font-mono text-xl tracking-widest text-white focus:border-gold-500 transition-colors"
              />
              {authError && (
                <p className="text-xs text-rose-400 mt-2 font-medium">{authError}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn--accent w-full py-3 font-bold"
            >
              Déverrouiller la Console
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-accent)] uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Console Organisateur • Annaba</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white">
            Tableau de Bord du <span className="text-[var(--color-accent)]">Cercle des Rois</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-noir-850 text-slate-300 border border-slate-700 hover:text-[var(--color-accent)] transition-colors"
            title="Rafraîchir les données"
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
              ? 'btn--accent'
              : 'btn--ghost'
          }`}
        >
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>Pointage Tournoi Actif ({confirmed.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('all-tournaments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-150 ${
            activeTab === 'all-tournaments'
              ? 'btn--accent'
              : 'btn--ghost'
          }`}
        >
          <Trophy className="w-4 h-4 flex-shrink-0" />
          <span>Gestion des Tournois ({tournaments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-150 ${
            activeTab === 'directory'
              ? 'btn--accent'
              : 'btn--ghost'
          }`}
        >
          <Users className="w-4 h-4 flex-shrink-0" />
          <span>Annuaire des Joueurs ({players.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('create-tournament')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-150 ${
            activeTab === 'create-tournament'
              ? 'btn--accent'
              : 'btn--ghost'
          }`}
        >
          <PlusCircle className="w-4 h-4 flex-shrink-0" />
          <span>Créer un Tournoi</span>
        </button>

        <button
          onClick={() => setActiveTab('archive-tournament')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-150 ${
            activeTab === 'archive-tournament'
              ? 'btn--accent'
              : 'btn--ghost'
          }`}
        >
          <Archive className="w-4 h-4 flex-shrink-0" />
          <span>Clôturer & Archiver</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE TOURNAMENT CHECKIN & POINTAGE */}
      {activeTab === 'active-tournament' && (
        <div className="space-y-6 animate-in fade-in">
          {activeTourney ? (
            <div className="card-royal p-6 rounded-2xl border border-[var(--color-rule)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs uppercase font-bold text-[var(--color-accent)] tracking-wider">
                    Tournoi en cours d'inscriptions
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-white mt-1">
                    {activeTourney.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {activeTourney.dateFormatted} • {activeTourney.time} • {activeTourney.location}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handleExportPapi}
                    className="btn btn--ghost text-xs py-2 px-3.5 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    <span>Export Papi / Swiss-Manager</span>
                  </button>

                  <button
                    onClick={() => setEditingTourney(activeTourney)}
                    className="btn btn--accent text-xs py-2 px-3.5 flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Modifier ce tournoi</span>
                  </button>
                </div>
              </div>

              {/* Pointage KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-noir-900 border border-slate-800">
                  <div className="text-[11px] uppercase font-semibold text-slate-400">Total Inscrits</div>
                  <div className="font-mono text-2xl font-bold text-white mt-1">
                    {(activeTourney.registeredPlayers || []).length}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-noir-900 border border-slate-800">
                  <div className="text-[11px] uppercase font-semibold text-emerald-400">Confirmés</div>
                  <div className="font-mono text-2xl font-bold text-emerald-400 mt-1">
                    {confirmed.length}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-noir-900 border border-slate-800">
                  <div className="text-[11px] uppercase font-semibold text-amber-400">Pointés Présents</div>
                  <div className="font-mono text-2xl font-bold text-amber-400 mt-1">
                    {checkedInCount} / {confirmed.length}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-noir-900 border border-slate-800">
                  <div className="text-[11px] uppercase font-semibold text-slate-400">Liste d'Attente</div>
                  <div className="font-mono text-2xl font-bold text-slate-400 mt-1">
                    {waitlist.length}
                  </div>
                </div>
              </div>

              {/* Pointage Sub-Tabs: Titulaires (Dossards) vs Liste d'Attente */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPointageTab('confirmed')}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        pointageTab === 'confirmed'
                          ? 'bg-gold-500 text-noir-950 shadow-gold-glow'
                          : 'bg-noir-900 text-slate-300 hover:text-white border border-slate-800'
                      }`}
                    >
                      <Trophy className="w-4 h-4 flex-shrink-0" />
                      <span>Liste Principale (Dossards)</span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
                        pointageTab === 'confirmed' ? 'bg-noir-950/30 text-noir-950' : 'bg-noir-800 text-gold-400'
                      }`}>
                        {confirmed.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setPointageTab('waitlist')}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        pointageTab === 'waitlist'
                          ? 'bg-amber-500 text-noir-950 shadow-amber-glow'
                          : 'bg-noir-900 text-slate-300 hover:text-white border border-slate-800'
                      }`}
                    >
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>Liste d'Attente Prioritaire</span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
                        pointageTab === 'waitlist' ? 'bg-noir-950/30 text-noir-950' : 'bg-noir-800 text-amber-400'
                      }`}>
                        {waitlist.length}
                      </span>
                    </button>
                  </div>

                  <div className="text-xs text-slate-400">
                    {pointageTab === 'confirmed' ? (
                      <span>Pointage en direct à l'arrivée des joueurs</span>
                    ) : (
                      <span className="text-amber-400 font-medium">Repêchage direct en cas d'absent</span>
                    )}
                  </div>
                </div>

                {/* VIEW 1: CONFIRMED PLAYERS WITH DOSSARDS */}
                {pointageTab === 'confirmed' && (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-slate-800 bg-[oklch(15%_0.014_265)] text-slate-300 uppercase text-[11px] font-semibold">
                            <th className="py-2.5 px-3 text-center w-20">Dossard</th>
                            <th className="py-2.5 px-4">Joueur</th>
                            <th className="py-2.5 px-3">Club</th>
                            <th className="py-2.5 px-3">Téléphone</th>
                            <th className="py-2.5 px-3 text-center">Pointage Présence</th>
                            <th className="py-2.5 px-3 text-center">Règlement</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                          {confirmed.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                                Aucun joueur titulaire pour l'instant.
                              </td>
                            </tr>
                          ) : (
                            confirmed.map((p, idx) => (
                              <tr key={p.id} className="hover:bg-noir-850/60 transition-colors">
                                <td className="py-2.5 px-3 text-center">
                                  <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-md text-xs font-bold bg-gold-500/15 text-gold-400 border border-gold-500/30">
                                    #{p.dossardNumber || (idx + 1)}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 font-sans font-bold text-white">
                                  {p.nom} {p.prenom}
                                  {p.fideId && <span className="ml-1.5 text-[10px] text-slate-400 font-mono">({p.fideId})</span>}
                                </td>
                                <td className="py-2.5 px-3 font-sans text-slate-300">
                                  {p.club || 'Indépendant'}
                                </td>
                                <td className="py-2.5 px-3 text-slate-300">
                                  {p.telephone ? (
                                    <a href={`tel:${p.telephone}`} className="text-gold-400 hover:underline">
                                      {p.telephone}
                                    </a>
                                  ) : (
                                    <span className="text-slate-500">-</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <button
                                    onClick={() => handleAction('checkin', p.id)}
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                                      p.isCheckedIn
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                                    }`}
                                  >
                                    {p.isCheckedIn ? '✓ Présent' : 'Non pointé'}
                                  </button>
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <button
                                    onClick={() => handleAction('paid', p.id)}
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                                      p.isPaid
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                                    }`}
                                  >
                                    {p.isPaid ? '✓ Réglé' : 'En attente'}
                                  </button>
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    onClick={() => handleAction('remove', p.id)}
                                    className="text-rose-400 hover:text-rose-300 p-1.5 rounded hover:bg-rose-500/10 cursor-pointer"
                                    title="Retirer l'inscription"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* VIEW 2: WAITLIST WITH 1-CLICK PROMOTION TO DOSSARD */}
                {pointageTab === 'waitlist' && (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 flex-shrink-0 text-amber-400" />
                        <span>En cas de désistement ou d'absence d'un titulaire au pointage, cliquez sur « Promouvoir en Titulaire » pour repêcher le joueur et lui attribuer un numéro de dossard.</span>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-slate-800 bg-[oklch(15%_0.014_265)] text-slate-300 uppercase text-[11px] font-semibold">
                            <th className="py-2.5 px-3 text-center w-24">Rang Attente</th>
                            <th className="py-2.5 px-4">Joueur</th>
                            <th className="py-2.5 px-3">Club</th>
                            <th className="py-2.5 px-3">Téléphone</th>
                            <th className="py-2.5 px-3 text-center">Repêchage</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                          {waitlist.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                                Aucun joueur actuellement en liste d'attente.
                              </td>
                            </tr>
                          ) : (
                            waitlist.map((p, idx) => (
                              <tr key={p.id} className="hover:bg-noir-850/60 transition-colors">
                                <td className="py-2.5 px-3 text-center">
                                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                    Attente #{p.waitlistRank || (idx + 1)}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 font-sans font-bold text-white">
                                  {p.nom} {p.prenom}
                                </td>
                                <td className="py-2.5 px-3 font-sans text-slate-300">
                                  {p.club || 'Indépendant'}
                                </td>
                                <td className="py-2.5 px-3 text-slate-300">
                                  {p.telephone ? (
                                    <a href={`tel:${p.telephone}`} className="text-amber-400 hover:underline">
                                      {p.telephone}
                                    </a>
                                  ) : (
                                    <span className="text-slate-500">-</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <button
                                    onClick={() => handleAction('promote', p.id)}
                                    className="btn btn--accent text-xs py-1.5 px-3 flex items-center gap-1.5 mx-auto"
                                    title="Promouvoir ce joueur en titulaire avec un dossard"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Promouvoir en Titulaire (Dossard)</span>
                                  </button>
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    onClick={() => handleAction('remove', p.id)}
                                    className="text-rose-400 hover:text-rose-300 p-1.5 rounded hover:bg-rose-500/10 cursor-pointer"
                                    title="Retirer de la liste d'attente"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card-royal p-8 text-center text-slate-400">
              Aucun tournoi actif pour le moment.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL TOURNAMENTS MANAGEMENT (MODIFIER / EFFACER) */}
      {activeTab === 'all-tournaments' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-white">
                Gestion des Tournois du Cercle
              </h2>
              <p className="text-xs text-slate-400">
                Consultez, modifiez ou supprimez n'importe quelle édition (passée ou active).
              </p>
            </div>

            <button
              onClick={() => setActiveTab('create-tournament')}
              className="btn btn--accent text-xs py-2 px-4 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nouveau Tournoi</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {tournaments.map((t) => (
              <div 
                key={t.id}
                className="card-royal p-5 rounded-xl border border-[var(--color-rule)] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      !t.isArchived 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {!t.isArchived ? 'Actif' : 'Archivé'}
                    </span>
                    <span className="font-mono text-xs text-slate-400">Édition #{t.edition}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    {t.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                      {t.dateFormatted || t.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                      {t.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                      {t.cadence}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                      {(t.registeredPlayers || []).length} inscrits
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <Link
                    href={`/tournoi/${t.slug}`}
                    className="btn btn--ghost text-xs py-1.5 px-3"
                  >
                    Voir la page
                  </Link>

                  <button
                    onClick={() => setEditingTourney(t)}
                    className="btn btn--accent text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>

                  <button
                    onClick={() => handleDeleteTournament(t.id, t.title)}
                    className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
                    title="Supprimer ce tournoi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DIRECTORY MANAGEMENT (MODIFIER / EFFACER / EXPORT CSV / AJOUT) */}
      {activeTab === 'directory' && (
        <div className="card-royal p-6 sm:p-8 rounded-2xl border border-[var(--color-rule)] space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-white">Gestion de l'Annuaire des Joueurs</h2>
              <p className="text-xs text-slate-400">
                {players.length} joueurs répertoriés. Vous pouvez modifier, supprimer, ajouter des membres ou exporter l'annuaire complet.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleExportDirectoryCSV}
                className="btn btn--accent text-xs py-2 px-3.5 flex items-center gap-1.5"
                title="Exporter l'annuaire au format CSV"
              >
                <Download className="w-4 h-4" />
                <span>Exporter l'Annuaire (CSV)</span>
              </button>

              <button
                onClick={() => setIsAddingPlayer(true)}
                className="btn btn--ghost text-xs py-2 px-3.5 flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4 text-[var(--color-accent)]" />
                <span>Ajouter un Joueur</span>
              </button>
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, club ou téléphone..."
              value={dirSearch}
              onChange={(e) => setDirSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-noir-900 border border-slate-700 text-xs text-white"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-[oklch(15%_0.014_265)] text-slate-300 uppercase text-[11px] font-semibold">
                  <th className="py-2.5 px-3 text-center w-12">#</th>
                  <th className="py-2.5 px-4">Nom & Prénom</th>
                  <th className="py-2.5 px-3">Club</th>
                  <th className="py-2.5 px-3">Elo</th>
                  <th className="py-2.5 px-3">Téléphone</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3 text-center">Tournois</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {players
                  .filter(p => p.nomComplet.toLowerCase().includes(dirSearch.toLowerCase()) || (p.telephone && p.telephone.includes(dirSearch)) || (p.club && p.club.toLowerCase().includes(dirSearch)))
                  .map((p, idx) => (
                    <tr key={p.id} className="hover:bg-noir-850/60 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-sans font-bold text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{p.nomComplet}</span>
                          {p.bestRank === 1 && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-300">
                        {p.club || 'Indépendant'}
                      </td>
                      <td className="py-2.5 px-3 text-[var(--color-accent)] font-bold">
                        {p.elo > 0 ? p.elo : 'NC'}
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
                      <td className="py-2.5 px-3 text-slate-300 font-sans truncate max-w-[150px]">
                        {p.email || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center text-white font-bold">
                        {p.nbTournois}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingPlayer(p)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-[var(--color-accent)] hover:bg-slate-700 transition-colors"
                            title="Modifier ce joueur"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePlayer(p.id, p.nomComplet)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                            title="Supprimer ce joueur"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CREATE NEW TOURNAMENT */}
      {activeTab === 'create-tournament' && (
        <div className="card-royal p-6 sm:p-8 rounded-2xl border border-[var(--color-rule)] space-y-6 max-w-3xl animate-in fade-in">
          <div>
            <h2 className="font-serif text-2xl font-bold text-white">Créer un Nouveau Tournoi</h2>
            <p className="text-xs text-slate-400">
              Définissez la date, l'horaire et le lieu physique pour ouvrir les inscriptions publiques.
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
                  placeholder="ex: Café Dardara ou lieu selon édition"
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Description</label>
              <textarea
                rows={3}
                value={newTourney.description}
                onChange={(e) => setNewTourney({ ...newTourney, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-noir-900 border border-slate-700 text-sm text-white focus:border-gold-500"
              />
            </div>

            <button
              type="submit"
              className="btn btn--accent w-full py-3.5 font-bold"
            >
              Publier le Tournoi
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: ARCHIVE TOURNAMENT */}
      {activeTab === 'archive-tournament' && (
        <div className="card-royal p-6 sm:p-8 rounded-2xl border border-[var(--color-rule)] space-y-6 max-w-2xl animate-in fade-in">
          <div>
            <h2 className="font-serif text-2xl font-bold text-white">Clôturer et Archiver le Tournoi Actif</h2>
            <p className="text-xs text-slate-400">
              Enregistrez le podium officiel. Le tournoi passera automatiquement dans la section Palmarès & Archives.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-amber-400">🥇 1ʳᵉ Place (Champion)</label>
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
              className="btn btn--accent w-full py-3.5 font-bold"
            >
              Enregistrer aux Archives du Club
            </button>
          </div>
        </div>
      )}

      {/* EDIT TOURNAMENT MODAL */}
      {editingTourney && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl card-royal p-6 border-2 border-[var(--color-rule-2)] space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[var(--color-accent)]" />
                <h3 className="font-serif text-lg font-bold text-white">Modifier le Tournoi</h3>
              </div>
              <button 
                onClick={() => setEditingTourney(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTournament} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Titre</label>
                <input
                  type="text"
                  required
                  value={editingTourney.title}
                  onChange={(e) => setEditingTourney({ ...editingTourney, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    required
                    value={editingTourney.date}
                    onChange={(e) => setEditingTourney({ ...editingTourney, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Horaire</label>
                  <input
                    type="text"
                    value={editingTourney.time}
                    onChange={(e) => setEditingTourney({ ...editingTourney, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Lieu</label>
                  <input
                    type="text"
                    required
                    value={editingTourney.location}
                    onChange={(e) => setEditingTourney({ ...editingTourney, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Cadence</label>
                  <input
                    type="text"
                    value={editingTourney.cadence}
                    onChange={(e) => setEditingTourney({ ...editingTourney, cadence: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Description</label>
                <textarea
                  rows={3}
                  value={editingTourney.description}
                  onChange={(e) => setEditingTourney({ ...editingTourney, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTourney(null)}
                  className="btn btn--ghost w-1/2 py-2"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn--accent w-1/2 py-2 font-bold"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PLAYER MODAL */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl card-royal p-6 border-2 border-[var(--color-rule-2)] space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[var(--color-accent)]" />
                <h3 className="font-serif text-lg font-bold text-white">Modifier la fiche Joueur</h3>
              </div>
              <button 
                onClick={() => setEditingPlayer(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePlayer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Nom</label>
                  <input
                    type="text"
                    required
                    value={editingPlayer.nom}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, nom: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-white uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Prénom</label>
                  <input
                    type="text"
                    value={editingPlayer.prenom}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, prenom: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-white capitalize"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Club</label>
                  <input
                    type="text"
                    value={editingPlayer.club}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, club: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Elo</label>
                  <input
                    type="number"
                    value={editingPlayer.elo}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, elo: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Téléphone</label>
                  <input
                    type="tel"
                    value={editingPlayer.telephone || ''}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, telephone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">ID FIDE</label>
                  <input
                    type="text"
                    value={editingPlayer.fideId || ''}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, fideId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Email</label>
                <input
                  type="email"
                  value={editingPlayer.email || ''}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPlayer(null)}
                  className="btn btn--ghost w-1/2 py-2"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn--accent w-1/2 py-2 font-bold"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PLAYER MODAL */}
      {isAddingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl card-royal p-6 border-2 border-[var(--color-rule-2)] space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[var(--color-accent)]" />
                <h3 className="font-serif text-lg font-bold text-white">Ajouter un Joueur à l'Annuaire</h3>
              </div>
              <button 
                onClick={() => setIsAddingPlayer(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlayer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Nom</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: KASPAROV"
                    value={newPlayerForm.nom}
                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, nom: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-white uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Prénom</label>
                  <input
                    type="text"
                    placeholder="ex: Garry"
                    value={newPlayerForm.prenom}
                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, prenom: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-white capitalize"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Club</label>
                  <input
                    type="text"
                    placeholder="Hamra Annaba, AUCA..."
                    value={newPlayerForm.club}
                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, club: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Elo</label>
                  <input
                    type="number"
                    value={newPlayerForm.elo}
                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, elo: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Téléphone</label>
                  <input
                    type="tel"
                    placeholder="ex: 0551056785"
                    value={newPlayerForm.telephone}
                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, telephone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">ID FIDE</label>
                  <input
                    type="text"
                    placeholder="ex: 7904606"
                    value={newPlayerForm.fideId}
                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, fideId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Email</label>
                <input
                  type="email"
                  placeholder="joueur@gmail.com"
                  value={newPlayerForm.email}
                  onChange={(e) => setNewPlayerForm({ ...newPlayerForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingPlayer(false)}
                  className="btn btn--ghost w-1/2 py-2"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn--accent w-1/2 py-2 font-bold"
                >
                  Ajouter le joueur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
