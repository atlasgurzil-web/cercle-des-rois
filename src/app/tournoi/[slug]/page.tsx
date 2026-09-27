'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Flame, 
  Share2, 
  QrCode, 
  Copy, 
  Check, 
  Crown, 
  Sparkles, 
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Trophy,
  X,
  Hash,
  HeartHandshake
} from 'lucide-react';
import QRCodeLib from 'qrcode';
import { Tournament, PlayerRegistration } from '@/types';

interface RegistrationSuccessInfo {
  message: string;
  isWaitlist: boolean;
  dossardNumber?: number;
  waitlistRank?: number;
  playerName: string;
}

export default function TournamentDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Registration form state
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    fideId: '',
    dateNaissance: '',
    telephone: '',
    email: '',
    club: 'Hamra Annaba',
    notes: ''
  });

  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<RegistrationSuccessInfo | null>(null);
  const [formError, setFormError] = useState('');

  // Players roster tab: 'confirmed' (Dossards) | 'waitlist' (Liste d'attente)
  const [playersTab, setPlayersTab] = useState<'confirmed' | 'waitlist'>('confirmed');

  // Share & QR Code state
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Input ref for 1-click CTA autofocus
  const nomInputRef = useRef<HTMLInputElement>(null);

  // Smooth scroll and focus helper
  const scrollToForm = () => {
    const el = document.getElementById('inscription');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        nomInputRef.current?.focus();
      }, 350);
    }
  };

  // Load tournament
  const fetchTournament = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tournaments/${slug}`);
      if (!res.ok) throw new Error('Tournoi introuvable');
      const data = await res.json();
      setTournament(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du tournoi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchTournament();
    }
  }, [slug]);

  // Handle URL hash #inscription auto-scroll on arrival
  useEffect(() => {
    if (typeof window !== 'undefined' && tournament) {
      if (window.location.hash === '#inscription') {
        setTimeout(() => scrollToForm(), 300);
      }
    }
  }, [tournament]);

  // Generate QR Code with direct #inscription link
  useEffect(() => {
    if (typeof window !== 'undefined' && tournament) {
      const url = `${window.location.origin}/tournoi/${slug}#inscription`;
      QRCodeLib.toDataURL(url, {
        width: 320,
        margin: 2,
        color: {
          dark: '#07080B',
          light: '#F5D061'
        }
      })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR code error', err));
    }
  }, [tournament, slug]);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/tournoi/${slug}#inscription` : '';

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setRegistrationSuccess(null);

    const safeNom = (formData.nom || formData.prenom || 'Joueur').trim();
    const safePrenom = formData.prenom.trim();

    const payload = {
      ...formData,
      nom: safeNom,
      prenom: safePrenom
    };

    try {
      setSubmitting(true);
      const res = await fetch(`/api/tournaments/${tournament?.id || slug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      const assignedDossard = data.dossardNumber || (data.registration && data.registration.dossardNumber);
      const assignedWaitlist = data.waitlistRank || (data.registration && data.registration.waitlistRank);

      setRegistrationSuccess({
        message: data.isWaitlist 
          ? 'Votre pré-inscription est confirmée en liste d\'attente prioritaire ! Ne vous inquiétez pas : il y a toujours des absents le jour J, nous ferons le maximum pour vous faire jouer.'
          : 'Félicitations ! Votre inscription est validée avec succès.',
        isWaitlist: !!data.isWaitlist,
        dossardNumber: assignedDossard,
        waitlistRank: assignedWaitlist,
        playerName: `${safeNom.toUpperCase()} ${safePrenom}`.trim()
      });

      // If registered to waitlist, automatically switch tab so they see themselves
      if (data.isWaitlist) {
        setPlayersTab('waitlist');
      }

      // Reset form fields
      setFormData({
        nom: '',
        prenom: '',
        fideId: '',
        dateNaissance: '',
        telephone: '',
        email: '',
        club: 'Hamra Annaba',
        notes: ''
      });

      // Reload tournament to refresh players list
      fetchTournament();

    } catch (err: any) {
      setFormError(err.message || 'Une erreur est survenue lors de l\'inscription.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-serif text-lg text-slate-300">Chargement de la fiche du tournoi...</p>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
        <h1 className="font-serif text-2xl font-bold text-white">Tournoi introuvable</h1>
        <p className="text-slate-400">{error || "Ce tournoi n'existe pas ou a été déplacé."}</p>
        <Link href="/tournois" className="inline-block mt-4 px-6 py-2.5 rounded-lg bg-gold-500 text-noir-950 font-bold">
          Retour à la liste des tournois
        </Link>
      </div>
    );
  }

  const confirmedPlayers = tournament.registeredPlayers?.filter(p => p.status === 'confirmed') || [];
  const waitlistPlayers = tournament.registeredPlayers?.filter(p => p.status === 'waitlist') || [];
  const spotsLeft = Math.max(0, tournament.maxParticipants - confirmedPlayers.length);
  const fillPct = Math.min(100, Math.round((confirmedPlayers.length / tournament.maxParticipants) * 100));

  const shareText = `♟️ *Le Cercle des Rois - Tournoi d'échecs à Annaba* %0A🏆 ${tournament.title} %0A📅 Date : ${tournament.dateFormatted} à ${tournament.time} %0A📍 Lieu : ${tournament.location} %0A⏱️ Cadence : ${tournament.cadence} %0A⚡ Inscription rapide en 1 clic (dossard immédiat) : %0A${shareUrl}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-12">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-gold-400">Accueil</Link>
        <span>/</span>
        <Link href="/tournois" className="hover:text-gold-400">Tournois</Link>
        <span>/</span>
        <span className="text-gold-400 truncate">{tournament.title}</span>
      </div>

      {/* TOURNAMENT HERO BANNER */}
      <div className="relative rounded-2xl p-6 sm:p-10 card-royal border-2 border-gold-500/40 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Inscriptions Ouvertes
            </span>
            <span className="text-xs font-semibold text-gold-400 bg-noir-850 px-3 py-1 rounded border border-slate-700">
              Édition #{tournament.edition}
            </span>
          </div>

          {/* Social Share & QR Code Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`https://wa.me/?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Partager WhatsApp</span>
            </a>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap bg-noir-800 text-slate-200 border border-slate-700 hover:border-gold-500/50 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> : <Copy className="w-3.5 h-3.5 flex-shrink-0" />}
              <span>{copied ? 'Lien Copié !' : 'Copier le Lien Direct'}</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap bg-noir-800 text-gold-400 border border-gold-500/30 hover:bg-gold-500/10 hover:border-gold-500 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 flex-shrink-0" />
              <span>QR Code Inscription</span>
            </button>
          </div>
        </div>

        <div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-wide">
            {tournament.title}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
            {tournament.description}
          </p>
        </div>

        {/* 1-CLICK CTA HERO BUTTON */}
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <button
            onClick={scrollToForm}
            className="btn btn--accent py-3.5 px-6 sm:px-8 text-sm sm:text-base font-bold shadow-gold-glow flex items-center gap-2.5 group cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Sparkles className="w-5 h-5 text-noir-950 group-hover:rotate-12 transition-transform" />
            <span>S'INSCRIRE EN 1 CLIC (OBTENIR MON DOSSARD)</span>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('roster-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn btn--ghost text-xs sm:text-sm py-3 px-4 flex items-center gap-2 text-slate-300 hover:text-white"
          >
            <Users className="w-4 h-4 text-gold-400" />
            <span>Voir la liste des inscrits ({confirmedPlayers.length}) & attente ({waitlistPlayers.length})</span>
          </button>
        </div>

        {/* Tournament Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-noir-850/80 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs text-gold-400 font-semibold">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>Date</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-white">{tournament.dateFormatted}</div>
          </div>

          <div className="p-4 rounded-xl bg-noir-850/80 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs text-gold-400 font-semibold">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>Horaire</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-white">{tournament.time}</div>
          </div>

          <div className="p-4 rounded-xl bg-noir-850/80 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs text-gold-400 font-semibold">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>Lieu</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-white truncate">{tournament.location}</div>
          </div>

          <div className="p-4 rounded-xl bg-noir-850/80 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs text-gold-400 font-semibold">
              <Flame className="w-4 h-4 flex-shrink-0" />
              <span>Cadence</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-white">{tournament.cadence}</div>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="p-4 rounded-xl bg-noir-900 border border-slate-800 space-y-2">
          <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm font-semibold">
            <span className="text-slate-300">Jauge des Inscriptions :</span>
            <span className="text-gold-400 font-mono">
              {confirmedPlayers.length} / {tournament.maxParticipants} Places confirmées ({spotsLeft > 0 ? `${spotsLeft} restantes` : 'Complet - Inscriptions en liste d\'attente'})
            </span>
          </div>
          <div className="w-full h-3 bg-noir-950 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gold-500 rounded-full transition-[width] duration-500"
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

      </div>

      {/* TWO COLUMNS: REGISTRATION FORM + REGISTERED PLAYERS LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* FORM COLUMN (5 COLS) */}
        <div 
          id="inscription" 
          className="lg:col-span-5 card-royal p-6 sm:p-8 rounded-2xl border-2 border-gold-500/40 space-y-6 scroll-mt-28"
        >
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-400">
              <Sparkles className="w-4 h-4" />
              <span>Formulaire Express • 1 Clic</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-white">
              Obtenir mon Dossard
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Inscription immédiate et gratuite : aucun champ n'est bloquant. Indiquez simplement votre nom ou pseudo pour recevoir votre dossard officiel instantanément.
            </p>
          </div>

          {/* DOSSARD CARD / SUCCESS STATE */}
          {registrationSuccess && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              {!registrationSuccess.isWaitlist ? (
                /* OFFICIAL DOSSARD CARD FOR CONFIRMED PLAYERS */
                <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-500/20 via-noir-900 to-noir-950 border-2 border-gold-500 shadow-gold-glow-lg text-center space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-500 text-noir-950 shadow">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Dossard Officiel Attribué</span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] uppercase font-mono tracking-widest text-slate-400">
                      Numéro de Dossard
                    </div>
                    <div className="font-mono text-6xl font-black text-gold-400 drop-shadow-[0_2px_12px_rgba(245,208,97,0.4)]">
                      #{registrationSuccess.dossardNumber || confirmedPlayers.length}
                    </div>
                  </div>

                  <div className="py-2.5 px-4 rounded-xl bg-noir-850/80 border border-gold-500/30 font-serif text-lg font-bold text-white">
                    {registrationSuccess.playerName}
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 text-left bg-noir-900/60 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-1.5 text-gold-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>Votre place est confirmée !</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Présentez ce numéro à la table d'arbitrage lors de votre arrivée au café à <strong>20:30 (après la prière d'Isha)</strong>.
                    </p>
                  </div>

                  <button
                    onClick={() => setRegistrationSuccess(null)}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-gold-400 border border-gold-500/30 hover:bg-gold-500/10 transition-colors"
                  >
                    + Inscrire un autre joueur ou un ami
                  </button>
                </div>
              ) : (
                /* REASSURING WAITLIST CARD */
                <div className="p-6 rounded-2xl bg-amber-500/10 border-2 border-amber-500/50 text-left space-y-4">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <HeartHandshake className="w-5 h-5 flex-shrink-0" />
                    <span className="text-base">Inscrit en Liste d'Attente Prioritaire (Rang #{registrationSuccess.waitlistRank || (waitlistPlayers.length + 1)})</span>
                  </div>

                  <div className="p-4 rounded-xl bg-noir-900 border border-amber-500/30 space-y-2.5">
                    <div className="font-serif text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span>Message important de l'équipe du Cercle :</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      <strong>Ne vous inquiétez pas et ne renoncez surtout pas !</strong> Dans nos tournois amicaux, il y a <em>systématiquement des désistements ou des absents</em> le soir même.
                    </p>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      Les organisateurs font tout leur possible sur place pour ajouter des tables et échiquiers supplémentaires ou repêcher chaque joueur de la liste dès la première ronde.
                    </p>
                    <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-gold-400 text-xs font-semibold flex items-center gap-2">
                      <span>👉 Venez au café le jour J à 20:30 dès la fin d'Isha : vous avez de très grandes chances de jouer !</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setRegistrationSuccess(null)}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-amber-300 border border-amber-500/30 hover:bg-amber-500/10 transition-colors text-center"
                  >
                    + Inscrire un autre joueur
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error Banner */}
          {formError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Primary input: Nom ou Pseudo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white flex items-center justify-between">
                <span>Nom ou Pseudo de Joueur *</span>
                <span className="text-[11px] font-normal text-gold-400">Le seul champ indispensable !</span>
              </label>
              <input
                ref={nomInputRef}
                type="text"
                required
                placeholder="ex: BENGHIDA Hamza (ou pseudo)"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-noir-900 border-2 border-slate-700 text-base text-white placeholder-slate-500 focus:border-gold-500 focus:outline-none transition-colors uppercase font-medium shadow-inner"
              />
            </div>

            {/* Quick phone input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Numéro de Téléphone</span>
                <span className="text-slate-500 font-normal text-[11px]">Optionnel (pour rappel le soir J)</span>
              </label>
              <input
                type="tel"
                placeholder="ex: 0551056785"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-noir-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-gold-500 focus:outline-none transition-colors font-mono"
              />
            </div>

            {/* Toggle for optional advanced details */}
            <button
              type="button"
              onClick={() => setShowAdvancedFields(!showAdvancedFields)}
              className="text-xs font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-1.5 transition-colors pt-1"
            >
              {showAdvancedFields ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>{showAdvancedFields ? 'Masquer les options avancées' : '+ Renseigner Club, ID FIDE ou Date de naissance (Optionnel)'}</span>
            </button>

            {/* Collapsible advanced fields */}
            {showAdvancedFields && (
              <div className="space-y-3 pt-2 border-t border-slate-800 animate-in fade-in duration-200">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">Prénom</label>
                    <input
                      type="text"
                      placeholder="ex: Lakhdar"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-gold-500 capitalize"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">Club / Ville</label>
                    <select
                      value={formData.club}
                      onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-lg bg-noir-900 border border-slate-700 text-xs text-white focus:border-gold-500"
                    >
                      <option value="Hamra Annaba">Hamra Annaba</option>
                      <option value="AUCA">AUCA</option>
                      <option value="Chess Club Annaba">Chess Club Annaba</option>
                      <option value="Makomades Oum El Bouaghi">Makomades Oum El Bouaghi</option>
                      <option value="Biskra">Biskra</option>
                      <option value="Tébessa">Tébessa</option>
                      <option value="Indépendant">Indépendant (Sans club)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">ID FIDE</label>
                    <input
                      type="text"
                      placeholder="ex: 7981600"
                      value={formData.fideId}
                      onChange={(e) => setFormData({ ...formData, fideId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-gold-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">Date de Naissance</label>
                    <input
                      type="date"
                      value={formData.dateNaissance}
                      onChange={(e) => setFormData({ ...formData, dateNaissance: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-gold-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">Email</label>
                  <input
                    type="email"
                    placeholder="votre.email@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-gold-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">Message à l'organisation</label>
                  <textarea
                    rows={2}
                    placeholder="ex: Je viendrai directement après la prière..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-noir-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-gold-500"
                  />
                </div>
              </div>
            )}

            {/* Giant Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-xl text-base font-bold bg-gold-500 text-noir-950 hover:bg-gold-400 active:bg-gold-600 transition-all shadow-gold-glow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Hash className="w-5 h-5 flex-shrink-0" />
              <span>
                {submitting 
                  ? 'Attribution du Dossard...' 
                  : spotsLeft > 0 
                    ? 'Valider mon Inscription & Obtenir mon Dossard' 
                    : 'Rejoindre la Liste d\'Attente Prioritaire'}
              </span>
            </button>

            <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
              <span>{tournament.feeDescription || 'Entrée libre / Gratuit'} • Dossard attribué immédiatement</span>
            </div>
          </form>
        </div>

        {/* REGISTERED PLAYERS ROSTER (7 COLS) WITH CONFIRMED & WAITLIST TABS */}
        <div 
          id="roster-section" 
          className="lg:col-span-7 card-royal p-6 sm:p-8 rounded-2xl border border-gold-500/30 space-y-6 scroll-mt-28"
        >
          {/* Header & Tabs */}
          <div className="space-y-4 border-b border-slate-800 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-gold-400 flex-shrink-0" />
                  <span>Participants du Tournoi</span>
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Consultez la liste des titulaires (dossards) et la liste d'attente prioritaire.
                </p>
              </div>

              <div className="text-xs text-slate-300 bg-noir-900 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Pointage à 20:30 après Isha</span>
              </div>
            </div>

            {/* TAB SELECTOR: CONFIRMED VS WAITLIST */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setPlayersTab('confirmed')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  playersTab === 'confirmed'
                    ? 'bg-gold-500 text-noir-950 shadow-gold-glow'
                    : 'bg-noir-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <Trophy className="w-4 h-4 flex-shrink-0" />
                <span>Liste Principale (Dossards)</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
                  playersTab === 'confirmed' ? 'bg-noir-950/30 text-noir-950' : 'bg-noir-800 text-gold-400'
                }`}>
                  {confirmedPlayers.length} / {tournament.maxParticipants}
                </span>
              </button>

              <button
                onClick={() => setPlayersTab('waitlist')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  playersTab === 'waitlist'
                    ? 'bg-amber-500 text-noir-950 shadow-amber-glow'
                    : 'bg-noir-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>Liste d'Attente</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
                  playersTab === 'waitlist' ? 'bg-noir-950/30 text-noir-950' : 'bg-noir-800 text-amber-400'
                }`}>
                  {waitlistPlayers.length}
                </span>
              </button>
            </div>
          </div>

          {/* TAB 1: CONFIRMED PLAYERS TABLE */}
          {playersTab === 'confirmed' && (
            <div className="space-y-4 animate-in fade-in">
              {confirmedPlayers.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Aucun joueur encore inscrit. Soyez le premier à obtenir votre dossard !
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 bg-noir-900/90 text-xs font-semibold uppercase tracking-wider text-slate-300">
                        <th className="py-2.5 px-3 text-center">Dossard</th>
                        <th className="py-2.5 px-3">Nom & Prénom</th>
                        <th className="py-2.5 px-3">Club</th>
                        <th className="py-2.5 px-3">FIDE / Elo</th>
                        <th className="py-2.5 px-3 text-right">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {confirmedPlayers.map((player, idx) => (
                        <tr key={player.id} className="hover:bg-noir-850/60 transition-colors">
                          <td className="py-3 px-3 text-center font-mono">
                            <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-md text-xs font-bold bg-gold-500/15 text-gold-400 border border-gold-500/30">
                              #{player.dossardNumber || (idx + 1)}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-white">
                            {player.nom} {player.prenom}
                          </td>
                          <td className="py-3 px-3 text-xs text-slate-300">
                            {player.club || 'Indépendant'}
                          </td>
                          <td className="py-3 px-3 font-mono text-xs text-slate-300">
                            {player.fideId ? (
                              <span className="text-gold-400 font-semibold">{player.fideId}</span>
                            ) : (
                              <span className="text-slate-500">NC</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                              <span>Titulaire</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WAITLIST TABLE WITH WARM REASSURING BANNER */}
          {playersTab === 'waitlist' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Reassuring Banner */}
              <div className="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <HeartHandshake className="w-5 h-5 flex-shrink-0" />
                  <span>Message d'encouragement de l'organisation :</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  <strong>Il y a TOUJOURS des absents ou des imprévus de dernière minute le soir du tournoi.</strong> Ne baissez surtout pas les bras ! Venez au café dès <strong>20:30 après la prière d'Isha</strong> : nous faisons tout le nécessaire pour repêcher les joueurs de la liste d'attente par ordre de priorité et faire jouer un maximum d'échiquiers.
                </p>
              </div>

              {waitlistPlayers.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm bg-noir-900/40 rounded-xl border border-slate-800">
                  La liste d'attente est actuellement vide. Des places titulaires sont encore disponibles !
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 bg-noir-900/90 text-xs font-semibold uppercase tracking-wider text-slate-300">
                        <th className="py-2.5 px-3 text-center">Rang Priorité</th>
                        <th className="py-2.5 px-3">Nom & Prénom</th>
                        <th className="py-2.5 px-3">Club</th>
                        <th className="py-2.5 px-3 text-right">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {waitlistPlayers.map((player, idx) => (
                        <tr key={player.id} className="hover:bg-noir-850/60 transition-colors">
                          <td className="py-3 px-3 text-center font-mono">
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Attente #{player.waitlistRank || (idx + 1)}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-white">
                            {player.nom} {player.prenom}
                          </td>
                          <td className="py-3 px-3 text-xs text-slate-300">
                            {player.club || 'Indépendant'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span>Prioritaire au pointage</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tournament Rules / Notes */}
          <div className="p-4 rounded-xl bg-noir-850/60 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              <span>Règlement & Convivialité</span>
            </div>
            <p className="leading-relaxed">
              {tournament.rules || "Système suisse en 7 rondes. Pendules et jeux fournis. Début du pointage 30 minutes avant la 1ère ronde. Respect, fair-play et convivialité."}
            </p>
          </div>

        </div>

      </div>

      {/* QR CODE MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl card-royal p-6 border-2 border-gold-500/60 shadow-gold-glow-lg text-center space-y-4">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-noir-800"
            >
              <X className="w-5 h-5" />
            </button>

            <Crown className="w-8 h-8 text-gold-400 mx-auto" />
            <div>
              <h3 className="font-serif text-xl font-bold text-white">QR Code d'Inscription Directe</h3>
              <p className="text-xs text-slate-400 mt-1">{tournament.title}</p>
            </div>

            {qrDataUrl && (
              <div className="p-3 bg-white rounded-xl inline-block shadow-inner mx-auto">
                <img src={qrDataUrl} alt="QR Code Tournoi" className="w-60 h-60 rounded" />
              </div>
            )}

            <p className="text-xs text-slate-300 leading-relaxed">
              Scannez ce QR code pour ouvrir directement le formulaire et obtenir votre numéro de dossard en 1 clic.
            </p>

            <button
              onClick={() => {
                const a = document.createElement('a');
                a.href = qrDataUrl;
                a.download = `qrcode-${tournament.slug}.png`;
                a.click();
              }}
              className="w-full py-2.5 rounded-xl font-bold bg-gold-500 text-noir-950 hover:bg-gold-400 text-sm transition-colors cursor-pointer"
            >
              Télécharger l'image du QR Code
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
