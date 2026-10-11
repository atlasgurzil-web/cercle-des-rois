'use client';

import React, { useState } from 'react';
import { 
  Database, 
  Copy, 
  Check, 
  X, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Terminal, 
  KeyRound, 
  AlertCircle 
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SUPABASE_SQL_SCRIPT = `-- ==============================================================================
-- LE CERCLE DES ROIS (ANNABA) — BASE DE DONNÉES OFFICIELLE SUPABASE (POSTGRESQL)
-- Base 100% Saine : Aucun faux inscrit de test, schémas prêts pour vos tournois
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE : TOURNAMENTS (Éditions du Cercle des Rois)
CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY,
  edition INT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  date TEXT NOT NULL,
  date_formatted TEXT NOT NULL,
  time TEXT NOT NULL DEFAULT '20:30 (Après la prière d''Isha)',
  location TEXT NOT NULL DEFAULT 'Café Dardara, Annaba',
  cadence TEXT NOT NULL DEFAULT 'Blitz 5m + 3s',
  type TEXT NOT NULL DEFAULT 'Système suisse',
  rounds INT NOT NULL DEFAULT 7,
  max_participants INT NOT NULL DEFAULT 32,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT,
  rules TEXT,
  fee TEXT DEFAULT '0',
  fee_description TEXT DEFAULT 'Gratuit / Entrée libre (consommation sur place)',
  prizes TEXT DEFAULT 'Trophée Le Cercle des Rois & Médailles d''Honneur',
  chess_results_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tournaments_slug ON tournaments(slug);
CREATE INDEX IF NOT EXISTS idx_tournaments_archived ON tournaments(is_archived);

-- 3. TABLE : REGISTRATIONS (Inscriptions & Pointage des Tournois — 100% Vierge)
CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL DEFAULT '',
  telephone TEXT DEFAULT '',
  club TEXT NOT NULL DEFAULT 'Indépendant',
  email TEXT DEFAULT '',
  fide_id TEXT DEFAULT '',
  date_naissance TEXT DEFAULT '',
  elo_fide INT DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'waitlist')),
  dossard_number INT,
  waitlist_rank INT,
  is_checked_in BOOLEAN NOT NULL DEFAULT FALSE,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT DEFAULT '',
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registrations_tournament ON registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_dossard ON registrations(dossard_number);
CREATE INDEX IF NOT EXISTS idx_registrations_phone ON registrations(telephone);

-- 4. TABLE : PLAYERS (Annuaire des Joueurs de la Wilaya d'Annaba)
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  nom_complet TEXT NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL DEFAULT '',
  club TEXT NOT NULL DEFAULT 'Indépendant',
  elo INT NOT NULL DEFAULT 0,
  fide_id TEXT DEFAULT '',
  telephone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  date_naissance TEXT DEFAULT '',
  tournois_joues INT NOT NULL DEFAULT 0,
  meilleur_classement TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_players_search ON players(nom_complet);
CREATE INDEX IF NOT EXISTS idx_players_club ON players(club);
CREATE INDEX IF NOT EXISTS idx_players_elo ON players(elo DESC);

-- ==============================================================================
-- SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tournois consultables publiquement" ON tournaments;
CREATE POLICY "Tournois consultables publiquement" ON tournaments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Tournois modifiables par admin" ON tournaments;
CREATE POLICY "Tournois modifiables par admin" ON tournaments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Inscriptions consultables publiquement" ON registrations;
CREATE POLICY "Inscriptions consultables publiquement" ON registrations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Inscriptions publiques ouvertes" ON registrations;
CREATE POLICY "Inscriptions publiques ouvertes" ON registrations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Inscriptions modifiables par admin" ON registrations;
CREATE POLICY "Inscriptions modifiables par admin" ON registrations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Annuaire consultable publiquement" ON players;
CREATE POLICY "Annuaire consultable publiquement" ON players FOR SELECT USING (true);

DROP POLICY IF EXISTS "Annuaire modifiable par admin" ON players;
CREATE POLICY "Annuaire modifiable par admin" ON players FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- DONNÉES HISTORIQUES HOMOLOGUÉES (CDR 1, CDR 2, CDR 3)
-- (La table des inscriptions reste vierge : aucun faux inscrit de test)
-- ==============================================================================
INSERT INTO tournaments (id, edition, title, slug, date, date_formatted, time, location, cadence, rounds, max_participants, is_archived, description, chess_results_url)
VALUES 
(
  'cdr-1',
  1,
  'Le Cercle des Rois I',
  'le-cercle-des-rois-1',
  '2026-05-29',
  '29 Mai 2026',
  '20:30 (Après la prière d''Isha)',
  'Annaba',
  'Rapide / Blitz',
  5,
  12,
  TRUE,
  'Édition inaugurale. Vainqueur : BENLAID Lakhdar (4.5 pts / 5 rondes).',
  'https://chess-results.com/tnr1426425.aspx?lan=20'
),
(
  'cdr-2',
  2,
  'Le Cercle des Rois II – 2ᵉ édition',
  'le-cercle-des-rois-2',
  '2026-08-01',
  '1 Août 2026',
  '20:30 (Après la prière d''Isha)',
  'Annaba',
  'Blitz 5m + 3s',
  7,
  28,
  TRUE,
  'Deuxième édition réunissant 28 joueurs. Vainqueur : ASSOUL Abdelaziz (6.5 pts / 7 rondes).',
  'https://chess-results.com/tnr1463342.aspx?lan=20'
),
(
  'cdr-3',
  3,
  'Le Cercle des Rois III – 3ᵉ édition',
  'le-cercle-des-rois-3',
  '2026-08-28',
  '27-28 Août 2026',
  '20:30 (Après la prière d''Isha)',
  'Café Dardara, Annaba',
  'Blitz 5m + 3s',
  7,
  27,
  TRUE,
  'Troisième édition au Café Dardara réunissant 27 participants. Vainqueur : BENLAID Lakhdar (6.0 pts / 7 rondes).',
  'https://chess-results.com/tnr1482060.aspx?lan=20'
)
ON CONFLICT (id) DO NOTHING;

-- Édition actuelle (Tournoi 4 vierge, prêt pour de vraies inscriptions)
INSERT INTO tournaments (id, edition, title, slug, date, date_formatted, time, location, cadence, rounds, max_participants, is_archived, description, rules, chess_results_url)
VALUES (
  'cdr-4',
  4,
  'Le Cercle des Rois IV – Édition Annaba',
  'le-cercle-des-rois-4',
  '2026-10-01',
  'Jeudi 1er Octobre 2026',
  '20:30 (Après la prière d''Isha)',
  'Café Dardara, Annaba',
  'Blitz 5m + 3s',
  7,
  32,
  FALSE,
  'Rendez-vous mensuel du premier jeudi du mois après la prière d''Isha. Système suisse en 7 rondes, cadence Blitz 5m + 3s. Ambiance fraternelle et compétitive réunissant anciens et nouvelle génération.',
  'Système suisse en 7 rondes. Pendules électroniques et jeux fournis sur place. Départages FIDE officiels (Buchholz Cut 1, Buchholz Total, Sonneborn-Berger).',
  'https://chess-results.com/tnr1482060.aspx?lan=20'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  date_formatted = EXCLUDED.date_formatted,
  time = EXCLUDED.time;
`;

export function SupabaseModal({ isOpen, onClose }: Props) {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleCopyEnv = () => {
    const envText = `NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
SUPABASE_SERVICE_ROLE_KEY=votre-cle-service-role`;
    navigator.clipboard.writeText(envText);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto card-royal p-6 sm:p-8 rounded-2xl border border-gold-500/40 bg-noir-900 shadow-2xl space-y-6 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Database className="w-4 h-4" />
              <span>Base de Données Cloud Supabase</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Script SQL à Copier-Coller en 1 Clic
            </h2>
            <p className="text-xs text-slate-300">
              Base 100% saine : aucune donnée de test polluante, archives authentiques CDR 1, 2, 3 et tournoi 4 vierge.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-noir-800 text-slate-400 hover:text-white hover:bg-noir-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Step Instruction Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-noir-850 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-gold-400 block">Étape 1</span>
            <p className="text-xs text-slate-200 font-semibold">Ouvrir Supabase</p>
            <p className="text-[11px] text-slate-400">
              Connectez-vous sur votre projet sur <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-gold-400 underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3 inline" /></a>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-noir-850 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-gold-400 block">Étape 2</span>
            <p className="text-xs text-slate-200 font-semibold">Aller dans SQL Editor</p>
            <p className="text-[11px] text-slate-400">
              Dans le menu gauche, cliquez sur l'icône <strong>SQL Editor</strong> puis <strong>New Query</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-noir-850 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-gold-400 block">Étape 3</span>
            <p className="text-xs text-slate-200 font-semibold">Coller & Run</p>
            <p className="text-[11px] text-slate-400">
              Cliquez sur le gros bouton doré ci-dessous, faites <strong>Ctrl+V</strong> et cliquez sur <strong>Run</strong> !
            </p>
          </div>
        </div>

        {/* BIG 1-CLICK COPY BUTTON */}
        <div className="space-y-3">
          <button
            onClick={handleCopySql}
            className={`w-full py-4 px-6 rounded-xl text-base font-bold flex items-center justify-center gap-3 transition-all cursor-pointer ${
              copiedSql
                ? 'bg-emerald-500 text-white shadow-emerald-glow'
                : 'bg-gold-500 text-noir-950 hover:bg-gold-400 shadow-gold-glow'
            }`}
          >
            {copiedSql ? (
              <>
                <Check className="w-5 h-5 text-white animate-bounce" />
                <span>Script SQL Copié avec Succès dans le Presse-Papier !</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 text-noir-950" />
                <span>Copier le Script SQL (1 Clic)</span>
              </>
            )}
          </button>
          <p className="text-[11px] text-center text-slate-400">
            {copiedSql ? '👉 Ouvrez maintenant votre SQL Editor sur Supabase et faites Ctrl+V' : 'Cliquez pour copier l\'intégralité du script SQL prêt à exécuter'}
          </p>
        </div>

        {/* SQL Script Viewer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px] text-gold-400 font-semibold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>Aperçu du script SQL (PostgreSQL Supabase)</span>
            </span>
            <span>{SUPABASE_SQL_SCRIPT.split('\n').length} lignes</span>
          </div>

          <div className="p-4 rounded-xl bg-noir-950 border border-slate-800 font-mono text-xs text-slate-300 max-h-56 overflow-y-auto leading-relaxed select-all">
            <pre>{SUPABASE_SQL_SCRIPT}</pre>
          </div>
        </div>

        {/* Environment variables reminder */}
        <div className="p-4 rounded-xl bg-noir-850 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <KeyRound className="w-4 h-4 text-gold-400" />
              <span>Les 3 Clés à brancher ensuite (Project Settings &gt; API) :</span>
            </div>
            <button
              onClick={handleCopyEnv}
              className="text-xs text-gold-400 hover:text-gold-300 font-semibold flex items-center gap-1"
            >
              {copiedEnv ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEnv ? 'Copié !' : 'Copier modèle'}</span>
            </button>
          </div>

          <div className="p-3 rounded-lg bg-noir-900 border border-slate-800/80 font-mono text-xs text-slate-300 space-y-1">
            <p className="text-slate-400"># Dans votre fichier .env.local ou variables Vercel :</p>
            <p><span className="text-gold-400">NEXT_PUBLIC_SUPABASE_URL</span>=https://votre-projet.supabase.co</p>
            <p><span className="text-gold-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>=votre-cle-anon</p>
            <p><span className="text-gold-400">SUPABASE_SERVICE_ROLE_KEY</span>=votre-cle-service-role</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-noir-800 text-white hover:bg-noir-700 transition-colors"
          >
            Fermer
          </button>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="btn-gold text-xs py-2.5 px-5 flex items-center gap-1.5"
          >
            <span>Ouvrir Supabase Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
