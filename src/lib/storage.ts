import fs from 'fs';
import path from 'path';
import os from 'os';
import { Tournament, DirectoryPlayer, PlayerRegistration } from '@/types';
import tournamentsSeed from '@/data/tournaments.json';
import playersSeed from '@/data/players.json';
import { normalizePhoneNumber } from '@/lib/validation';

const PRIMARY_DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');
const FALLBACK_DB_PATH = path.join(os.tmpdir(), 'cdr-database.json');

interface DatabaseSchema {
  tournaments: Tournament[];
  players: DirectoryPlayer[];
}

// In-process memory store to handle serverless warm instances and read-only environments
declare global {
  // eslint-disable-next-line no-var
  var __CDR_DB__: DatabaseSchema | undefined;
}

function getInitialUpcomingTournament(): Tournament {
  return {
    id: 'cdr-4',
    edition: 4,
    title: 'Le Cercle des Rois IV – Édition Annaba',
    slug: 'le-cercle-des-rois-4',
    date: '2026-10-01',
    dateFormatted: 'Jeudi 1er Octobre 2026',
    time: '20:30 (Après la prière d\'Isha)',
    location: 'Café Dardara, Annaba',
    isOnline: false,
    rounds: 7,
    cadence: 'Blitz 5m + 3s',
    type: 'Système suisse amical',
    maxParticipants: 32,
    fee: 0,
    feeDescription: 'Gratuit / Entrée libre (consommation au café)',
    prizes: 'Trophée Le Cercle des Rois pour le vainqueur & Médailles pour le podium',
    description: 'Le grand rendez-vous mensuel du premier jeudi du mois après Isha ! Ouvert de 7 à 77 ans, venez partager le thé et la passion du noble jeu entre amis, anciens de Hamra, de l\'AUCA et nouveaux talents.',
    rules: 'Système suisse en 7 rondes. Cadence Blitz 5 min + 3 sec d\'incrément par coup. Pendules et jeux fournis sur place. Fair-play, convivialité et respect de rigueur.',
    isArchived: false,
    organizer: 'Le Cercle des Rois (Hamra & AUCA)',
    director: 'Benghida Hamza',
    registeredPlayers: [
      {
        id: 'reg-1',
        nom: 'BENGHIDA',
        prenom: 'Hamza',
        fideId: '7981600',
        dateNaissance: '1988-08-12',
        telephone: '0551056785',
        email: 'thealgerino23@gmail.com',
        club: 'Hamra Annaba',
        eloFide: 0,
        status: 'confirmed',
        registeredAt: '2026-09-20T14:30:00Z',
        isCheckedIn: true,
        isPaid: true,
        notes: 'Directeur du tournoi'
      },
      {
        id: 'reg-2',
        nom: 'BENLAID',
        prenom: 'Lakhdar',
        fideId: '7903413',
        dateNaissance: '1978-10-25',
        telephone: '0551263599',
        email: '',
        club: 'Makomades chess Club oum el bouaghi',
        eloFide: 1867,
        status: 'confirmed',
        registeredAt: '2026-09-21T09:15:00Z',
        isCheckedIn: false,
        isPaid: true
      },
      {
        id: 'reg-3',
        nom: 'ASSOUL',
        prenom: 'Abdelaziz',
        fideId: '7922817',
        dateNaissance: '1991-01-01',
        telephone: '0555000000',
        email: 'assoul@gmail.com',
        club: 'Hamra Annaba',
        eloFide: 1820,
        status: 'confirmed',
        registeredAt: '2026-09-21T11:00:00Z',
        isCheckedIn: false,
        isPaid: true
      },
      {
        id: 'reg-4',
        nom: 'KOUDRI',
        prenom: 'Samir',
        fideId: '7922884',
        dateNaissance: '1981-01-01',
        telephone: '0550123456',
        email: 'samir.koudri@gmail.com',
        club: 'Hamra Annaba',
        eloFide: 1854,
        status: 'confirmed',
        registeredAt: '2026-09-22T16:20:00Z',
        isCheckedIn: false,
        isPaid: true
      }
    ]
  };
}

function initializeDatabase(): DatabaseSchema {
  const initialTournaments: Tournament[] = [
    getInitialUpcomingTournament(),
    ...(tournamentsSeed as unknown as Tournament[]).map(t => ({
      ...t,
      isArchived: true
    }))
  ];

  const initialPlayers: DirectoryPlayer[] = playersSeed as unknown as DirectoryPlayer[];

  const initialData: DatabaseSchema = {
    tournaments: initialTournaments,
    players: initialPlayers
  };

  try {
    fs.writeFileSync(PRIMARY_DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  } catch {
    try {
      fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    } catch {
      // Memory store fallback
    }
  }

  globalThis.__CDR_DB__ = initialData;
  return initialData;
}

export function readDatabase(): DatabaseSchema {
  // 1. Check in-memory store first
  if (globalThis.__CDR_DB__) {
    return globalThis.__CDR_DB__;
  }

  // 2. Try primary path
  try {
    if (fs.existsSync(PRIMARY_DB_PATH)) {
      const raw = fs.readFileSync(PRIMARY_DB_PATH, 'utf-8');
      const data: DatabaseSchema = JSON.parse(raw);
      globalThis.__CDR_DB__ = data;
      return data;
    }
  } catch (err) {
    console.warn('Could not read from primary DB path:', err);
  }

  // 3. Try fallback tmp path
  try {
    if (fs.existsSync(FALLBACK_DB_PATH)) {
      const raw = fs.readFileSync(FALLBACK_DB_PATH, 'utf-8');
      const data: DatabaseSchema = JSON.parse(raw);
      globalThis.__CDR_DB__ = data;
      return data;
    }
  } catch (err) {
    console.warn('Could not read from fallback DB path:', err);
  }

  // 4. Initialize if nothing exists
  return initializeDatabase();
}

export function writeDatabase(data: DatabaseSchema): void {
  // Always update global memory first
  globalThis.__CDR_DB__ = data;

  const serialized = JSON.stringify(data, null, 2);

  // Try writing to primary DB path
  let written = false;
  try {
    fs.writeFileSync(PRIMARY_DB_PATH, serialized, 'utf-8');
    written = true;
  } catch {
    // Primary path is read-only (e.g. Vercel serverless)
  }

  // Try writing to fallback tmp path if primary failed
  if (!written) {
    try {
      fs.writeFileSync(FALLBACK_DB_PATH, serialized, 'utf-8');
    } catch {
      // Memory persistence only
    }
  }
}

// ---------------- TOURNAMENTS OPERATIONS ----------------

export function getAllTournaments(): Tournament[] {
  const db = readDatabase();
  return db.tournaments;
}

export function getUpcomingTournaments(): Tournament[] {
  const db = readDatabase();
  return db.tournaments.filter(t => !t.isArchived);
}

export function getArchivedTournaments(): Tournament[] {
  const db = readDatabase();
  return db.tournaments.filter(t => t.isArchived).sort((a, b) => b.edition - a.edition);
}

export function getTournamentBySlug(slug: string): Tournament | undefined {
  const db = readDatabase();
  return db.tournaments.find(t => t.slug === slug || t.id === slug);
}

export function saveTournament(tournament: Tournament): Tournament {
  const db = readDatabase();
  const index = db.tournaments.findIndex(t => t.id === tournament.id);
  if (index >= 0) {
    db.tournaments[index] = tournament;
  } else {
    db.tournaments.unshift(tournament);
  }
  writeDatabase(db);
  return tournament;
}

export function deleteTournament(id: string): boolean {
  const db = readDatabase();
  const initialLen = db.tournaments.length;
  db.tournaments = db.tournaments.filter(t => t.id !== id);
  if (db.tournaments.length !== initialLen) {
    writeDatabase(db);
    return true;
  }
  return false;
}

// ---------------- PLAYER REGISTRATION OPERATIONS ----------------

export function registerPlayerToTournament(
  tournamentId: string,
  playerData: {
    nom: string;
    prenom: string;
    fideId?: string;
    dateNaissance?: string;
    telephone: string;
    email?: string;
    club?: string;
    eloFide?: number;
    notes?: string;
  }
): { 
  success: boolean; 
  registration?: PlayerRegistration; 
  error?: string; 
  isWaitlist?: boolean; 
  dossardNumber?: number; 
  waitlistRank?: number 
} {
  const db = readDatabase();
  const tournament = db.tournaments.find(t => t.id === tournamentId || t.slug === tournamentId);
  if (!tournament) {
    return { success: false, error: 'Tournoi introuvable' };
  }

  tournament.registeredPlayers = tournament.registeredPlayers || [];

  // Normalize comparisons
  const cleanPhone = normalizePhoneNumber(playerData.telephone || '');
  const cleanEmail = (playerData.email || '').toLowerCase().trim();
  const cleanFide = (playerData.fideId || '').trim();
  const cleanNom = (playerData.nom || '').trim().toUpperCase();
  const cleanPrenom = (playerData.prenom || '').trim().toLowerCase();

  // Check for duplicates
  const isDuplicate = tournament.registeredPlayers.some(p => {
    // Match by phone
    if (cleanPhone && cleanPhone.length >= 8 && normalizePhoneNumber(p.telephone || '') === cleanPhone) {
      return true;
    }
    // Match by email if provided
    if (cleanEmail && cleanEmail.length > 3 && p.email && p.email.toLowerCase().trim() === cleanEmail) {
      return true;
    }
    // Match by FIDE ID if provided
    if (cleanFide && cleanFide.length > 3 && p.fideId && p.fideId.trim() === cleanFide) {
      return true;
    }
    // Match by exact full name
    if (p.nom.toUpperCase().trim() === cleanNom && p.prenom.toLowerCase().trim() === cleanPrenom) {
      return true;
    }
    return false;
  });

  if (isDuplicate) {
    return { success: false, error: 'Ce joueur est déjà enregistré sur la liste de ce tournoi !' };
  }

  const confirmedPlayers = tournament.registeredPlayers.filter(p => p.status === 'confirmed');
  const waitlistPlayers = tournament.registeredPlayers.filter(p => p.status === 'waitlist');
  const isWaitlist = confirmedPlayers.length >= tournament.maxParticipants;

  const assignedDossard = !isWaitlist ? confirmedPlayers.length + 1 : undefined;
  const assignedWaitlistRank = isWaitlist ? waitlistPlayers.length + 1 : undefined;

  const formattedPrenom = cleanPrenom.charAt(0).toUpperCase() + cleanPrenom.slice(1);

  const newReg: PlayerRegistration = {
    id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    nom: cleanNom,
    prenom: formattedPrenom,
    fideId: cleanFide,
    dateNaissance: playerData.dateNaissance || '',
    telephone: cleanPhone,
    email: cleanEmail,
    club: (playerData.club || 'Indépendant').trim(),
    eloFide: playerData.eloFide || 0,
    status: isWaitlist ? 'waitlist' : 'confirmed',
    dossardNumber: assignedDossard,
    waitlistRank: assignedWaitlistRank,
    registeredAt: new Date().toISOString(),
    isCheckedIn: false,
    isPaid: false,
    notes: playerData.notes || ''
  };

  tournament.registeredPlayers.push(newReg);

  // Sync to players directory automatically
  syncPlayerToDirectory(db, newReg);

  writeDatabase(db);

  return { 
    success: true, 
    registration: newReg, 
    isWaitlist,
    dossardNumber: assignedDossard,
    waitlistRank: assignedWaitlistRank
  };
}

export function togglePlayerCheckIn(tournamentId: string, registrationId: string): boolean {
  const db = readDatabase();
  const tournament = db.tournaments.find(t => t.id === tournamentId || t.slug === tournamentId);
  if (!tournament || !tournament.registeredPlayers) return false;

  const reg = tournament.registeredPlayers.find(p => p.id === registrationId);
  if (!reg) return false;

  reg.isCheckedIn = !reg.isCheckedIn;
  writeDatabase(db);
  return true;
}

export function togglePlayerPaid(tournamentId: string, registrationId: string): boolean {
  const db = readDatabase();
  const tournament = db.tournaments.find(t => t.id === tournamentId || t.slug === tournamentId);
  if (!tournament || !tournament.registeredPlayers) return false;

  const reg = tournament.registeredPlayers.find(p => p.id === registrationId);
  if (!reg) return false;

  reg.isPaid = !reg.isPaid;
  writeDatabase(db);
  return true;
}

export function promoteWaitlistPlayer(tournamentId: string, registrationId: string): boolean {
  const db = readDatabase();
  const tournament = db.tournaments.find(t => t.id === tournamentId || t.slug === tournamentId);
  if (!tournament || !tournament.registeredPlayers) return false;

  const reg = tournament.registeredPlayers.find(p => p.id === registrationId);
  if (!reg || reg.status !== 'waitlist') return false;

  const confirmedCount = tournament.registeredPlayers.filter(p => p.status === 'confirmed').length;
  reg.status = 'confirmed';
  reg.dossardNumber = confirmedCount + 1;
  delete reg.waitlistRank;

  // Re-index remaining waitlist
  const waitlist = tournament.registeredPlayers.filter(p => p.status === 'waitlist');
  waitlist.forEach((p, idx) => {
    p.waitlistRank = idx + 1;
  });

  writeDatabase(db);
  return true;
}

export function removeRegistration(tournamentId: string, registrationId: string): boolean {
  const db = readDatabase();
  const tournament = db.tournaments.find(t => t.id === tournamentId || t.slug === tournamentId);
  if (!tournament || !tournament.registeredPlayers) return false;

  const initialLen = tournament.registeredPlayers.length;
  tournament.registeredPlayers = tournament.registeredPlayers.filter(p => p.id !== registrationId);

  // If a confirmed player was removed and waitlist exists, promote first waitlist player
  const hasWaitlist = tournament.registeredPlayers.find(p => p.status === 'waitlist');
  const confirmedCount = tournament.registeredPlayers.filter(p => p.status === 'confirmed').length;

  if (hasWaitlist && confirmedCount < tournament.maxParticipants) {
    hasWaitlist.status = 'confirmed';
    delete hasWaitlist.waitlistRank;
  }

  // Ensure sequential dossards
  const confirmed = tournament.registeredPlayers.filter(p => p.status === 'confirmed');
  confirmed.forEach((p, idx) => {
    p.dossardNumber = idx + 1;
  });

  // Ensure sequential waitlist ranks
  const waitlist = tournament.registeredPlayers.filter(p => p.status === 'waitlist');
  waitlist.forEach((p, idx) => {
    p.waitlistRank = idx + 1;
  });

  writeDatabase(db);
  return tournament.registeredPlayers.length !== initialLen;
}

// ---------------- PLAYERS DIRECTORY OPERATIONS ----------------

export function getAllPlayers(): DirectoryPlayer[] {
  const db = readDatabase();
  return db.players;
}

function syncPlayerToDirectory(db: DatabaseSchema, reg: PlayerRegistration) {
  const normNom = reg.nom.toLowerCase().trim();
  const normPrenom = reg.prenom.toLowerCase().trim();
  const normPhone = normalizePhoneNumber(reg.telephone);

  const existing = db.players.find(p => {
    if (reg.fideId && p.fideId && reg.fideId === p.fideId) return true;
    if (normPhone && p.telephone && normalizePhoneNumber(p.telephone) === normPhone) return true;
    return p.nom.toLowerCase().trim() === normNom && p.prenom.toLowerCase().trim() === normPrenom;
  });

  if (existing) {
    if (reg.telephone && !existing.telephone) existing.telephone = reg.telephone;
    if (reg.email && !existing.email) existing.email = reg.email;
    if (reg.dateNaissance && !existing.dateNaissance) existing.dateNaissance = reg.dateNaissance;
    if (reg.fideId && !existing.fideId) existing.fideId = reg.fideId;
    if (reg.club && existing.club === 'Indépendant') existing.club = reg.club;
  } else {
    db.players.push({
      id: `cdr-player-${db.players.length + 1}`,
      nom: reg.nom,
      prenom: reg.prenom,
      nomComplet: `${reg.nom} ${reg.prenom}`,
      sexe: 'M',
      dateNaissance: reg.dateNaissance,
      telephone: reg.telephone,
      email: reg.email,
      club: reg.club || 'Indépendant',
      fideId: reg.fideId,
      elo: reg.eloFide || 0,
      nbTournois: 1,
      bestRank: null,
      tournoisParticipes: []
    });
  }
}

export function savePlayer(player: DirectoryPlayer): DirectoryPlayer {
  const db = readDatabase();
  const index = db.players.findIndex(p => p.id === player.id);
  if (index >= 0) {
    db.players[index] = player;
  } else {
    db.players.unshift(player);
  }
  writeDatabase(db);
  return player;
}

export function deletePlayer(id: string): boolean {
  const db = readDatabase();
  const initialLen = db.players.length;
  db.players = db.players.filter(p => p.id !== id);
  if (db.players.length !== initialLen) {
    writeDatabase(db);
    return true;
  }
  return false;
}
