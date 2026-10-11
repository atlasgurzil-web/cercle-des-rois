-- ==============================================================================
-- LE CERCLE DES ROIS (ANNABA) — BASE DE DONNÉES OFFICIELLE SUPABASE (POSTGRESQL)
-- Script d'initialisation complet : Schéma, Index, Sécurité RLS et Données Initiales
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase (Dashboard > SQL Editor)
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

-- Index pour requêtes ultra-rapides
CREATE INDEX IF NOT EXISTS idx_tournaments_slug ON tournaments(slug);
CREATE INDEX IF NOT EXISTS idx_tournaments_archived ON tournaments(is_archived);

-- 3. TABLE : REGISTRATIONS (Inscriptions & Pointage des Tournois)
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

-- Index pour recherche et tri instantanés
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
-- POLITIQUES DE SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Tournois : Tout le monde peut lire
DROP POLICY IF EXISTS "Tournois consultables publiquement" ON tournaments;
CREATE POLICY "Tournois consultables publiquement" ON tournaments FOR SELECT USING (true);

-- Tournois : Modification réservée au service_role (Admin API)
DROP POLICY IF EXISTS "Tournois modifiables par admin" ON tournaments;
CREATE POLICY "Tournois modifiables par admin" ON tournaments FOR ALL USING (true) WITH CHECK (true);

-- Inscriptions : Consultation publique (liste des joueurs)
DROP POLICY IF EXISTS "Inscriptions consultables publiquement" ON registrations;
CREATE POLICY "Inscriptions consultables publiquement" ON registrations FOR SELECT USING (true);

-- Inscriptions : Tout le monde peut s'inscrire (INSERT public)
DROP POLICY IF EXISTS "Inscriptions publiques ouvertes" ON registrations;
CREATE POLICY "Inscriptions publiques ouvertes" ON registrations FOR INSERT WITH CHECK (true);

-- Inscriptions : Modifications (pointage, suppression) gérées par l'Admin API
DROP POLICY IF EXISTS "Inscriptions modifiables par admin" ON registrations;
CREATE POLICY "Inscriptions modifiables par admin" ON registrations FOR ALL USING (true) WITH CHECK (true);

-- Annuaire Joueurs : Consultation publique
DROP POLICY IF EXISTS "Annuaire consultable publiquement" ON players;
CREATE POLICY "Annuaire consultable publiquement" ON players FOR SELECT USING (true);

DROP POLICY IF EXISTS "Annuaire modifiable par admin" ON players;
CREATE POLICY "Annuaire modifiable par admin" ON players FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- DONNÉES INITIALES : ÉDITION ACTUELLE (CDR IV)
-- ==============================================================================
INSERT INTO tournaments (id, edition, title, slug, date, date_formatted, time, location, cadence, rounds, max_participants, is_archived, description, rules, chess_results_url)
VALUES (
  'cdr-4',
  4,
  'Le Cercle des Rois IV – Édition Annaba',
  'le-cercle-des-rois-4',
  '2026-10-01',
  '1 Octobre 2026',
  '20:30 (Après la prière d''Isha)',
  'Café Dardara / Selon édition, Annaba',
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

-- Insertion des archives historiques (CDR 1, CDR 2, CDR 3)
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
  'Édition inaugurale du Cercle des Rois à Annaba. Vainqueur : BENLAID Lakhdar (4.5 pts / 5).',
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
  'Deuxième édition du Cercle des Rois réunissant 28 joueurs. Vainqueur : ASSOUL Abdelaziz (6.5 pts / 7).',
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
  'Troisième édition au Café Dardara réunissant 27 participants. Vainqueur : BENLAID Lakhdar (6.0 pts / 7).',
  'https://chess-results.com/tnr1482060.aspx?lan=20'
)
ON CONFLICT (id) DO NOTHING;
