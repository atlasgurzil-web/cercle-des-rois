export interface StandingEntry {
  rank: number;
  initialRank?: number;
  name: string;
  fed?: string;
  elo: number;
  club?: string;
  points: number;
  dep1?: number;
  dep2?: number;
  dep3?: number;
}

export interface Podium {
  first: StandingEntry | null;
  second: StandingEntry | null;
  third: StandingEntry | null;
}

export interface PlayerRegistration {
  id: string;
  nom: string;
  prenom: string;
  fideId?: string;
  dateNaissance: string;
  telephone: string;
  email: string;
  club?: string;
  eloFide?: number;
  status: 'confirmed' | 'waitlist';
  registeredAt: string;
  isCheckedIn: boolean;
  isPaid: boolean;
  notes?: string;
}

export interface Tournament {
  id: string;
  edition: number;
  title: string;
  slug: string;
  date: string; // YYYY-MM-DD
  dateFormatted: string;
  time?: string; // e.g. "20:30 (après Isha)"
  location: string; // e.g. "Café Dardara, Annaba" or "Café Le Majestic"
  isOnline: boolean;
  onlineUrl?: string;
  rounds: number;
  cadence: string; // e.g. "Blitz 5m + 3s" or "Rapide 10m + 2s"
  type: string; // "Système suisse"
  maxParticipants: number; // e.g. 32
  fee: number; // 0 for free, or amount
  feeDescription?: string; // "Gratuit" or "Participation 500 DZD sur place"
  prizes?: string; // "Trophée Roi & médailles pour le podium"
  description?: string;
  rules?: string;
  isArchived: boolean;
  chessResultsUrl?: string;
  organizer?: string;
  director?: string;
  arbiter?: string;
  deputyArbiter?: string;
  avgElo?: number;
  avgAge?: number;
  podium?: Podium;
  standings?: StandingEntry[];
  registeredPlayers?: PlayerRegistration[];
  participantsCount?: number;
}

export interface DirectoryPlayer {
  id: string;
  nom: string;
  prenom: string;
  nomComplet: string;
  sexe: string;
  dateNaissance?: string;
  telephone?: string;
  email?: string;
  club: string;
  fideId?: string;
  elo: number;
  nbTournois: number;
  bestRank: number | null;
  tournoisParticipes: {
    tournamentTitle: string;
    rank: number;
    points: number;
  }[];
}
