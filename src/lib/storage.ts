import fs from 'fs';
import path from 'path';
import { Tournament, DirectoryPlayer, PlayerRegistration } from '@/types';
import tournamentsSeed from '@/data/tournaments.json';
import playersSeed from '@/data/players.json';

const DB_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

interface DatabaseSchema {
  tournaments: Tournament[];
  players: DirectoryPlayer[];
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
      },
      {
        id: 'reg-5',
        nom: 'TOUIL',
        prenom: 'Achref',
        fideId: '7981961',
        dateNaissance: '2010-03-16',
        telephone: '0776112018',
        email: 'achreftll46@gmail.com',
        club: 'Indépendant',
        eloFide: 0,
        status: 'confirmed',
        registeredAt: '2026-09-23T18:45:00Z',
        isCheckedIn: false,
        isPaid: true
      },
      {
        id: 'reg-6',
        nom: 'ACHACHE',
        prenom: 'Abd erahim',
        fideId: '7981627',
        dateNaissance: '2010-01-26',
        telephone: '0793178153',
        email: 'oumao965@gmail.com',
        club: 'AUCA',
        eloFide: 0,
        status: 'confirmed',
        registeredAt: '2026-09-23T20:10:00Z',
        isCheckedIn: false,
        isPaid: true
      },
      {
        id: 'reg-7',
        nom: 'DJAWAD',
        prenom: 'Mohammed',
        fideId: '7981783',
        dateNaissance: '1954-01-01',
        telephone: '0661000000',
        email: 'm.djawad@gmail.com',
        club: 'Hamra Annaba',
        eloFide: 0,
        status: 'confirmed',
        registeredAt: '2026-09-24T10:00:00Z',
        isCheckedIn: false,
        isPaid: true
      },
      {
        id: 'reg-8',
        nom: 'BENSAID',
        prenom: 'Brahim',
        fideId: '7904606',
        dateNaissance: '2005-01-28',
        telephone: '0698170839',
        email: 'sampras1970@hotmail.com',
        club: 'Hamra Annaba',
        eloFide: 1711,
        status: 'confirmed',
        registeredAt: '2026-09-24T14:15:00Z',
        isCheckedIn: false,
        isPaid: true
      },
      {
        id: 'reg-9',
        nom: 'AYAD',
        prenom: 'Zoheir',
        dateNaissance: '1978-08-31',
        telephone: '0662535291',
        email: 'ayad.zoheir@gmail.com',
        club: 'Hamra Annaba',
        status: 'confirmed',
        registeredAt: '2026-09-25T11:20:00Z',
        isCheckedIn: false,
        isPaid: true
      },
      {
        id: 'reg-10',
        nom: 'ANIBA',
        prenom: 'Tarek',
        fideId: '7921624',
        dateNaissance: '1990-01-01',
        telephone: '0555333222',
        email: 'tarek.aniba@gmail.com',
        club: 'Hamra Annaba',
        eloFide: 1551,
        status: 'confirmed',
        registeredAt: '2026-09-25T17:40:00Z',
        isCheckedIn: false,
        isPaid: true
      },
      {
        id: 'reg-11',
        nom: 'ZEGHIB',
        prenom: 'Rami',
        fideId: '7973152',
        dateNaissance: '2003-01-20',
        telephone: '0793128926',
        email: 'ramidentaire23@gmail.com',
        club: 'Hamra Annaba',
        eloFide: 1579,
        status: 'confirmed',
        registeredAt: '2026-09-26T08:30:00Z',
        isCheckedIn: false,
        isPaid: true
      },
      {
        id: 'reg-12',
        nom: 'TOUMARI',
        prenom: 'Hatem',
        fideId: '7981970',
        dateNaissance: '2001-03-06',
        telephone: '0697101458',
        email: 'hatemtm36@gmail.com',
        club: 'Hamra Annaba',
        eloFide: 1672,
        status: 'confirmed',
        registeredAt: '2026-09-26T12:00:00Z',
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
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write initial db.json:', err);
  }

  return initialData;
}

export function readDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading db.json, re-initializing:', err);
  }
  return initializeDatabase();
}

export function writeDatabase(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to db.json:', err);
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
    dateNaissance: string;
    telephone: string;
    email: string;
    club?: string;
    eloFide?: number;
    notes?: string;
  }
): { success: boolean; registration?: PlayerRegistration; error?: string; isWaitlist?: boolean } {
  const db = readDatabase();
  const tournament = db.tournaments.find(t => t.id === tournamentId || t.slug === tournamentId);
  if (!tournament) {
    return { success: false, error: 'Tournoi introuvable' };
  }

  tournament.registeredPlayers = tournament.registeredPlayers || [];

  // Check if already registered by phone or email or FIDE ID
  const cleanPhone = playerData.telephone.replace(/\s+/g, '');
  const cleanEmail = (playerData.email || '').toLowerCase().trim();
  const cleanFide = (playerData.fideId || '').trim();

  const isDuplicate = tournament.registeredPlayers.some(p => {
    if (cleanPhone && p.telephone.replace(/\s+/g, '') === cleanPhone) return true;
    if (cleanEmail && p.email.toLowerCase().trim() === cleanEmail) return true;
    if (cleanFide && p.fideId && p.fideId === cleanFide) return true;
    return false;
  });

  if (isDuplicate) {
    return { success: false, error: 'Ce joueur est déjà inscrit à ce tournoi !' };
  }

  const confirmedCount = tournament.registeredPlayers.filter(p => p.status === 'confirmed').length;
  const isWaitlist = confirmedCount >= tournament.maxParticipants;

  const newReg: PlayerRegistration = {
    id: `reg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    nom: playerData.nom.toUpperCase().trim(),
    prenom: playerData.prenom.trim().charAt(0).toUpperCase() + playerData.prenom.trim().slice(1),
    fideId: playerData.fideId?.trim() || '',
    dateNaissance: playerData.dateNaissance || '',
    telephone: playerData.telephone.trim(),
    email: playerData.email.trim(),
    club: playerData.club?.trim() || 'Indépendant',
    eloFide: playerData.eloFide || 0,
    status: isWaitlist ? 'waitlist' : 'confirmed',
    registeredAt: new Date().toISOString(),
    isCheckedIn: false,
    isPaid: false,
    notes: playerData.notes || ''
  };

  tournament.registeredPlayers.push(newReg);

  // Sync to players directory automatically!
  syncPlayerToDirectory(db, newReg);

  writeDatabase(db);

  return { success: true, registration: newReg, isWaitlist };
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

export function removeRegistration(tournamentId: string, registrationId: string): boolean {
  const db = readDatabase();
  const tournament = db.tournaments.find(t => t.id === tournamentId || t.slug === tournamentId);
  if (!tournament || !tournament.registeredPlayers) return false;

  const initialLen = tournament.registeredPlayers.length;
  tournament.registeredPlayers = tournament.registeredPlayers.filter(p => p.id !== registrationId);

  // If a confirmed player was removed and there's someone in waitlist, promote the first waitlist player!
  const hasWaitlist = tournament.registeredPlayers.find(p => p.status === 'waitlist');
  const confirmedCount = tournament.registeredPlayers.filter(p => p.status === 'confirmed').length;

  if (hasWaitlist && confirmedCount < tournament.maxParticipants) {
    hasWaitlist.status = 'confirmed';
  }

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

  let existing = db.players.find(p => {
    if (reg.fideId && p.fideId && reg.fideId === p.fideId) return true;
    if (reg.telephone && p.telephone && reg.telephone.replace(/\s+/g, '') === p.telephone.replace(/\s+/g, '')) return true;
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
