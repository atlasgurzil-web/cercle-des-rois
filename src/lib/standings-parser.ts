import { StandingEntry, Podium } from '@/types';

export interface ParseResult {
  success: boolean;
  standings: StandingEntry[];
  podium: Podium;
  errors: string[];
  warnings: string[];
  formatDetected: 'standard-cdr' | 'chess-results' | 'tsv' | 'csv' | 'markdown-table' | 'whatsapp-list' | 'vertical-stream' | 'unknown';
  totalParticipants: number;
}

/**
 * Supprime les liens Markdown du type [Nom, Prénom](https://...) -> Nom, Prénom
 */
export function stripMarkdownLinks(str: string): string {
  if (!str) return '';
  return str.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
}

/**
 * Normalise un score en float (supporte "6,5", "6.5", "6", "4½", "4 1/2", "0")
 */
export function parseScore(val: string): number | null {
  if (val === undefined || val === null) return null;
  const cleaned = val.trim().replace(/\s*pts?|\s*points?/gi, '').replace(/\s+/g, ' ');

  if (!cleaned) return null;

  // Fraction 1/2 ou ½
  if (cleaned.includes('½')) {
    const base = parseFloat(cleaned.replace('½', '').trim()) || 0;
    return base + 0.5;
  }
  if (cleaned.endsWith('1/2')) {
    const base = parseFloat(cleaned.replace('1/2', '').trim()) || 0;
    return base + 0.5;
  }

  // Virgulé
  const normalized = cleaned.replace(',', '.');
  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

/**
 * Normalise un Elo (ex: "1966", "2086", "NC", "0", "-")
 */
export function parseEloValue(val: string): number {
  if (!val) return 0;
  const cleaned = val.trim().replace(/[^0-9]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Nettoie le nom d'un joueur
 */
export function cleanPlayerName(raw: string): string {
  if (!raw) return '';
  const withoutLinks = stripMarkdownLinks(raw);
  return withoutLinks
    .replace(/[*_~`]/g, '')
    .trim()
    .replace(/^[\d\.\-\)\s🥇🥈🥉]+/, '') // Enlève médailles ou numéros au début
    .replace(/[\-–—\:\;\[\]\(\)]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Vérifie si une chaîne ressemble à un nom de joueur
 */
function isCandidatePlayerName(str: string): boolean {
  if (!str) return false;
  const cleaned = stripMarkdownLinks(str).trim();
  if (cleaned.length < 2) return false;

  // Doit contenir au moins une lettre
  if (!/[a-zA-Z\u00C0-\u017F]/.test(cleaned)) return false;

  const lower = cleaned.toLowerCase();
  // Ne doit pas être un mot-clé de colonne ou de pied de page
  if (
    lower === 'rg' || 
    lower === 'rg initial' || 
    lower === 'nom' || 
    lower === 'fed' || 
    lower === 'elo' || 
    lower === 'club/ville' || 
    lower === 'club' || 
    lower === 'pts' || 
    lower.startsWith('dep.') || 
    lower.startsWith('depart') || 
    lower.startsWith('départ') ||
    lower.startsWith('annotation') ||
    lower.startsWith('classement')
  ) {
    return false;
  }

  // Ne doit pas être un code fédération seul
  if (/^[A-Z]{3}$/.test(cleaned)) return false;

  return true;
}

/**
 * Détecte si une ligne est une ligne d'en-tête ou du bruit de page
 */
function isHeaderOrNoiseLine(line: string): boolean {
  const lower = line.toLowerCase().trim();
  if (!lower) return true;

  // Lignes de séparation
  if (/^[\-\=\_\*#\|\s]+$/.test(lower)) return true;

  // Annotations et pieds de page
  if (
    lower.startsWith('annotation') ||
    lower.startsWith('départage') ||
    lower.startsWith('departage') ||
    lower.startsWith('remarque') ||
    lower.includes('chess-results.com')
  ) {
    return true;
  }

  // En-têtes Chess-Results ou tableurs
  if (
    lower.startsWith('rg') || 
    lower.startsWith('pl.') || 
    lower.startsWith('pos') || 
    lower.startsWith('rang') ||
    lower.startsWith('nom') || 
    lower.includes('classement final') ||
    lower.includes('grille americaine') ||
    lower.includes('grille américaine') ||
    lower.includes('arbitre') ||
    lower.includes('ronde')
  ) {
    const hasMultipleNumbers = (line.match(/\d+/g) || []).length;
    if (hasMultipleNumbers <= 1 && (lower.includes('pts') || lower.includes('nom') || lower.includes('elo') || lower.includes('club'))) {
      return true;
    }
  }

  return false;
}

/**
 * MODÈLE 1 : Analyseur de flux vertical (une cellule par ligne, cas fréquent de copier-coller Web/HTML)
 * Exemple :
 * 1
 * 2
 * [Saim, Bachir](https://chess-results.com/...)
 * ALG
 * 1966
 * ASSN
 * 6,5
 * 0
 * 28,5
 * 32
 * 2
 * 1
 * [Dorbane, Khaled](...)
 */
function tryParseVerticalStream(lines: string[]): StandingEntry[] | null {
  // Trouver l'index de départ du joueur 1 (ligne qui vaut '1', suivie d'un nom de joueur potentiel dans les 6 lignes)
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (l === '1') {
      const hasNameNear = lines.slice(i + 1, i + 6).some(cand => isCandidatePlayerName(cand));
      if (hasNameNear) {
        startIdx = i;
        break;
      }
    }
  }

  if (startIdx === -1) return null;

  const playerChunks: string[][] = [];
  let currentChunk: string[] = [];
  let currentChunkHasName = false;
  let nextExpectedRank = 2;

  for (let i = startIdx; i < lines.length; i++) {
    const raw = lines[i].trim();
    const lower = raw.toLowerCase();

    // Arrêt si on atteint les annotations de fin de page
    if (lower.startsWith('annotation') || lower.startsWith('départage') || lower.startsWith('departage') || lower.startsWith('remarque')) {
      break;
    }

    // Le prochain joueur commence SI ET SEULEMENT SI le joueur actuel a déjà trouvé son nom !
    if (currentChunkHasName && raw === nextExpectedRank.toString()) {
      const hasNameAhead = lines.slice(i + 1, i + 6).some(cand => isCandidatePlayerName(cand));
      if (hasNameAhead) {
        playerChunks.push(currentChunk);
        currentChunk = [raw];
        currentChunkHasName = false;
        nextExpectedRank++;
        continue;
      }
    }

    if (currentChunk.length === 0 && raw === '1') {
      currentChunk.push(raw);
      continue;
    }

    if (isCandidatePlayerName(raw)) {
      currentChunkHasName = true;
    }

    currentChunk.push(raw);
  }

  if (currentChunk.length > 0) {
    playerChunks.push(currentChunk);
  }

  if (playerChunks.length < 3) return null;

  const entries: StandingEntry[] = [];

  for (let cIdx = 0; cIdx < playerChunks.length; cIdx++) {
    const chunk = playerChunks[cIdx];
    const rank = cIdx + 1;

    // Trouver la cellule du Nom
    let nameIdx = -1;
    for (let j = 1; j < chunk.length; j++) {
      if (isCandidatePlayerName(chunk[j])) {
        nameIdx = j;
        break;
      }
    }

    if (nameIdx === -1) continue;

    const rawName = chunk[nameIdx];
    const name = cleanPlayerName(rawName);

    // Initial Rank si présent avant le nom
    let initialRank: number | undefined;
    if (nameIdx > 1) {
      const initNum = parseInt(chunk[1], 10);
      if (!isNaN(initNum)) initialRank = initNum;
    }

    // Analyser ce qui suit le nom
    let fed = 'ALG';
    let elo = 0;
    let club = 'Indépendant';
    let points = 0;
    let dep1: number | undefined;
    let dep2: number | undefined;
    let dep3: number | undefined;

    const remaining = chunk.slice(nameIdx + 1);

    // 1. FED (3 lettres majuscules)
    let fedIdx = -1;
    for (let j = 0; j < remaining.length; j++) {
      if (/^[A-Z]{3}$/.test(remaining[j])) {
        fed = remaining[j];
        fedIdx = j;
        break;
      }
    }

    // 2. Elo (nombre entier, souvent après FED ou avant le club)
    let eloIdx = -1;
    for (let j = (fedIdx >= 0 ? fedIdx + 1 : 0); j < remaining.length; j++) {
      if (/^\d{1,4}$/.test(remaining[j])) {
        elo = parseInt(remaining[j], 10);
        eloIdx = j;
        break;
      }
    }

    // 3. Club/Ville (texte après Elo)
    let clubIdx = -1;
    for (let j = (eloIdx >= 0 ? eloIdx + 1 : 0); j < remaining.length; j++) {
      const val = remaining[j];
      // Si c'est un nom de club ou '0' / '-' si non affilié
      if (val === '0' || val === '-') {
        club = 'Indépendant';
        clubIdx = j;
        break;
      } else if (/[a-zA-Z\u00C0-\u017F]{2,}/.test(val)) {
        club = val;
        clubIdx = j;
        break;
      }
    }

    // 4. Points et Départages (nombres après le Club)
    const scoreStart = clubIdx >= 0 ? clubIdx + 1 : (eloIdx >= 0 ? eloIdx + 1 : 0);
    const scoreValues: number[] = [];

    for (let j = scoreStart; j < remaining.length; j++) {
      const score = parseScore(remaining[j]);
      if (score !== null) {
        scoreValues.push(score);
      }
    }

    if (scoreValues.length > 0) {
      points = scoreValues[0];
      if (scoreValues.length > 1) dep1 = scoreValues[1];
      if (scoreValues.length > 2) dep2 = scoreValues[2];
      if (scoreValues.length > 3) dep3 = scoreValues[3];
    }

    entries.push({
      rank,
      initialRank,
      name,
      fed,
      elo,
      club,
      points,
      dep1,
      dep2,
      dep3
    });
  }

  return entries.length >= 3 ? entries : null;
}

/**
 * MODÈLE OFFICIEL CERCLE DES ROIS (Standard recommandé avec ChatGPT) :
 * Rang | Nom | Club | Elo | Points | Dep1 | Dep2 | Dep3
 */
export function tryParseStandardPipeFormat(lines: string[]): StandingEntry[] | null {
  // Déplier les lignes au cas où plusieurs joueurs se retrouvent collés sur la même ligne (copier-coller mobile)
  const expandedLines: string[] = [];
  for (const l of lines) {
    const unrolled = l
      .replace(/(?:^|\s+)(\d+)\s*\|\s*([a-zA-Z\u00C0-\u017F\[])/g, '\n$1 | $2')
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    expandedLines.push(...unrolled);
  }

  const pipeLines = expandedLines.filter(l => l.includes('|') && !l.includes('|-'));
  if (pipeLines.length < 1) return null;

  const entries: StandingEntry[] = [];

  for (let i = 0; i < pipeLines.length; i++) {
    const rawLine = pipeLines[i].trim();
    const cleaned = rawLine.replace(/^\|/, '').replace(/\|$/, '');
    const parts = cleaned.split('|').map(p => p.trim());

    if (parts.length < 4) continue;

    const lowerFirst = parts[0].toLowerCase();
    if (
      lowerFirst === 'rang' || 
      lowerFirst === 'rg' || 
      lowerFirst === 'pos' || 
      lowerFirst === 'pl.' ||
      lowerFirst === 'rk.' ||
      lowerFirst === 'pl'
    ) continue;

    const rankAsNum = parseInt(parts[0].replace(/[^0-9]/g, ''), 10);
    const rank = isNaN(rankAsNum) ? entries.length + 1 : rankAsNum;
    const name = cleanPlayerName(parts[1] || '');
    if (!name) continue;

    let club = 'Indépendant';
    let elo = 0;
    let points = 0;
    let dep1: number | undefined;
    let dep2: number | undefined;
    let dep3: number | undefined;

    if (parts.length >= 5) {
      const rawClub = parts[2] || '';
      club = (!rawClub || rawClub === '0' || rawClub === '-') ? 'Indépendant' : rawClub;
      elo = parseEloValue(parts[3] || '0');
      points = parseScore(parts[4] || '0') ?? 0;
      dep1 = parts[5] !== undefined && parts[5] !== '' ? parseScore(parts[5]) ?? undefined : undefined;
      dep2 = parts[6] !== undefined && parts[6] !== '' ? parseScore(parts[6]) ?? undefined : undefined;
      dep3 = parts[7] !== undefined && parts[7] !== '' ? parseScore(parts[7]) ?? undefined : undefined;
    } else if (parts.length === 4) {
      // Format 4 colonnes : Rang | Nom | Elo | Points OU Rang | Nom | Club | Points
      if (/^\d{3,4}$/.test(parts[2])) {
        elo = parseEloValue(parts[2]);
        points = parseScore(parts[3] || '0') ?? 0;
      } else {
        club = parts[2] || 'Indépendant';
        points = parseScore(parts[3] || '0') ?? 0;
      }
    }

    entries.push({
      rank,
      name,
      fed: 'ALG',
      club,
      elo,
      points,
      dep1,
      dep2,
      dep3
    });
  }

  return entries.length >= 1 ? entries : null;
}

/**
 * Génère le prompt prêt à coller dans ChatGPT pour formater n'importe quel tournoi
 */
export function generateChatGptPrompt(): string {
  return `Voici le classement brut de mon tournoi d'échecs. Formate-le exactement selon ce modèle standard pour le site du Cercle des Rois (une seule ligne par joueur, séparé par des barres | sans en-tête ni fioriture) :

Rang | Nom | Club | Elo | Points | Dep1 | Dep2 | Dep3

Règles de conversion :
1. Conserve chaque joueur sur une seule et même ligne.
2. Si le club est absent ou égal à 0, écris "Indépendant".
3. Si l'Elo est absent ou égal à 0, écris "0".
4. Utilise un point pour les décimales (ex: 6.5 au lieu de 6,5).
5. Conserve les départages dans l'ordre (Dep1, Dep2, Dep3). S'il y a moins de 3 départages, écris uniquement ceux disponibles.

Exemple de sortie attendue :
1 | Saim, Bachir | ASSN | 1966 | 6.5 | 0 | 28.5 | 32
2 | Dorbane, Khaled | ASSN | 2086 | 6 | 0 | 31.5 | 33.5
3 | Mekerba, Sidahmed | AMCHLEF | 0 | 6 | 0 | 29 | 31.5
4 | Touahar, Khireddine | OMB | 1788 | 6 | 0 | 28.5 | 30`;
}

/**
 * MODÈLE 2 : Analyseur de tableau Markdown (| Rg | Nom | ...)
 */
function tryParseMarkdownTable(lines: string[]): StandingEntry[] | null {
  const tableLines = lines.filter(l => l.includes('|') && !l.includes('|-'));
  if (tableLines.length < 3) return null;

  const entries: StandingEntry[] = [];

  for (let i = 0; i < tableLines.length; i++) {
    const line = tableLines[i];
    const cells = line.split('|').map(c => c.trim()).filter(c => c.length > 0);
    if (cells.length < 3) continue;

    // Ignorer la ligne d'en-tête
    if (cells.some(c => c.toLowerCase() === 'rg' || c.toLowerCase() === 'nom')) continue;

    const rankAsNum = parseInt(cells[0].replace(/[^0-9]/g, ''), 10);
    const rank = isNaN(rankAsNum) ? entries.length + 1 : rankAsNum;

    // Nom
    let nameIdx = 1;
    if (cells.length > 2 && /^\d+$/.test(cells[1])) {
      // cells[1] est initialRank
      nameIdx = 2;
    }

    const name = cleanPlayerName(cells[nameIdx] || '');
    if (!name) continue;

    let fed = 'ALG';
    let elo = 0;
    let club = 'Indépendant';
    let points = 0;

    const remaining = cells.slice(nameIdx + 1);

    for (const c of remaining) {
      if (/^[A-Z]{3}$/.test(c)) {
        fed = c;
      } else if (/^\d{3,4}$/.test(c) && elo === 0) {
        elo = parseInt(c, 10);
      } else if (/[a-zA-Z]{3,}/.test(c) && club === 'Indépendant') {
        club = c;
      } else {
        const sc = parseScore(c);
        if (sc !== null && points === 0) {
          points = sc;
        }
      }
    }

    entries.push({ rank, name, fed, elo, club, points });
  }

  return entries.length >= 3 ? entries : null;
}

/**
 * MODÈLE 3 : Analyseur de ligne tabulaire (Chess-Results classique, TSV ou espaces multiples)
 */
function parseTsvOrChessResultsLine(line: string, defaultRank: number): StandingEntry | null {
  const cleanLine = stripMarkdownLinks(line);
  // Supporte tabulations OU 2+ espaces
  const delimiter = cleanLine.includes('\t') ? '\t' : /\s{2,}/;
  const parts = cleanLine.split(delimiter).map(p => p.trim()).filter(p => p.length > 0);
  if (parts.length < 2) return null;

  let rank = defaultRank;
  let name = '';
  let fed = 'ALG';
  let elo = 0;
  let club = 'Indépendant';
  let points = 0;
  let dep1: number | undefined;
  let dep2: number | undefined;
  let dep3: number | undefined;

  const firstColAsNum = parseInt(parts[0].replace(/[^0-9]/g, ''), 10);
  let nameIndex = 0;

  if (!isNaN(firstColAsNum) && firstColAsNum > 0) {
    rank = firstColAsNum;
    nameIndex = 1;
  }

  // Si la 2e colonne est aussi un nombre (ex: initialRank)
  if (parts.length > nameIndex + 1 && /^\d+$/.test(parts[nameIndex]) && isCandidatePlayerName(parts[nameIndex + 1])) {
    nameIndex++;
  }

  if (parts.length > nameIndex) {
    name = cleanPlayerName(parts[nameIndex]);
  }

  const remaining = parts.slice(nameIndex + 1);

  let clubIndex = -1;
  for (let i = 0; i < remaining.length; i++) {
    const col = remaining[i];
    if (col.length === 3 && col.toUpperCase() === col && fed === 'ALG' && !/\d/.test(col)) {
      fed = col;
    } else if (col.length >= 2 && isNaN(Number(col.replace(',', '.'))) && club === 'Indépendant') {
      club = col;
      clubIndex = i;
    }
  }

  for (let i = 0; i < (clubIndex >= 0 ? clubIndex : remaining.length); i++) {
    const col = remaining[i];
    if (/^\d+$/.test(col)) {
      const val = parseInt(col, 10);
      if (val === 0 || (val >= 800 && val <= 2900)) {
        elo = val;
        break;
      }
    }
  }

  const numericValuesAfterClub: number[] = [];
  const searchStart = clubIndex >= 0 ? clubIndex + 1 : 1;

  for (let i = searchStart; i < remaining.length; i++) {
    const score = parseScore(remaining[i]);
    if (score !== null) {
      numericValuesAfterClub.push(score);
    }
  }

  if (numericValuesAfterClub.length > 0) {
    points = numericValuesAfterClub[0];
    if (numericValuesAfterClub.length > 1) dep1 = numericValuesAfterClub[1];
    if (numericValuesAfterClub.length > 2) dep2 = numericValuesAfterClub[2];
    if (numericValuesAfterClub.length > 3) dep3 = numericValuesAfterClub[3];
  } else {
    const allScores = remaining
      .map(c => parseScore(c))
      .filter((s): s is number => s !== null && s < 30);
    if (allScores.length > 0) {
      points = allScores[0];
    }
  }

  if (!name) return null;

  return {
    rank,
    name,
    fed,
    elo,
    club,
    points,
    dep1,
    dep2,
    dep3
  };
}

/**
 * MODÈLE 4 : Analyseur CSV (virgule ou point-virgule)
 */
function parseCsvLine(line: string, defaultRank: number): StandingEntry | null {
  const cleanLine = stripMarkdownLinks(line);
  const delimiter = cleanLine.includes(';') ? ';' : ',';
  const parts = cleanLine.split(delimiter).map(p => p.trim());
  if (parts.length < 2) return null;

  let rank = defaultRank;
  let name = '';
  let elo = 0;
  let club = 'Indépendant';
  let points = 0;

  const firstAsNum = parseInt(parts[0], 10);
  let offset = 0;
  if (!isNaN(firstAsNum)) {
    rank = firstAsNum;
    offset = 1;
  }

  name = cleanPlayerName(parts[offset] || '');
  if (!name) return null;

  for (let i = offset + 1; i < parts.length; i++) {
    const val = parts[i];
    const score = parseScore(val);
    const candidateElo = parseInt(val, 10);

    if (candidateElo >= 1000 && candidateElo <= 2900 && elo === 0) {
      elo = candidateElo;
    } else if (score !== null && points === 0) {
      points = score;
    } else if (val.length > 2 && isNaN(Number(val)) && club === 'Indépendant') {
      club = val;
    }
  }

  return { rank, name, elo, club, points };
}

/**
 * MODÈLE 5 : Analyseur de texte libre / liste WhatsApp (1. Nom 4.5 pts, 🥇 Nom...)
 */
function parseFreeformWhatsAppLine(line: string, defaultRank: number): StandingEntry | null {
  const cleanLine = stripMarkdownLinks(line);
  let rank = defaultRank;
  let workingLine = cleanLine.trim();

  // Détection médailles ou rangs
  if (workingLine.startsWith('🥇')) {
    rank = 1;
    workingLine = workingLine.replace('🥇', '').trim();
  } else if (workingLine.startsWith('🥈')) {
    rank = 2;
    workingLine = workingLine.replace('🥈', '').trim();
  } else if (workingLine.startsWith('🥉')) {
    rank = 3;
    workingLine = workingLine.replace('🥉', '').trim();
  } else {
    const rankMatch = workingLine.match(/^(\d+)[\.\)\-\s\:\/]+/);
    if (rankMatch) {
      rank = parseInt(rankMatch[1], 10);
      workingLine = workingLine.slice(rankMatch[0].length).trim();
    }
  }

  let club = 'Indépendant';
  let elo = 0;
  let points = 0;

  // Extraire tous les blocs entre parenthèses (...) ou crochets [...]
  const bracketRegex = /[\(\[]([^\)\]]+)[\)\]]/g;
  let match: RegExpExecArray | null;
  while ((match = bracketRegex.exec(workingLine)) !== null) {
    const content = match[1].trim();
    const eloInBracket = content.match(/(?:elo\s*[:=]?\s*(\d{3,4}))|(?:^(\d{3,4})$)/i);
    const ptsInBracket = content.match(/(\d+[\.,]?\d*)\s*pts?/i);

    if (eloInBracket) {
      elo = parseInt(eloInBracket[1] || eloInBracket[2], 10);
    } else if (ptsInBracket) {
      const p = parseScore(ptsInBracket[1]);
      if (p !== null) points = p;
    } else if (content.length > 1 && club === 'Indépendant') {
      club = content;
    }
  }
  workingLine = workingLine.replace(/[\(\[][^\)\]]*[\)\]]/g, ' ').trim();

  // Extraction des points hors crochets
  if (points === 0) {
    const pointsMatch = workingLine.match(/(\d+[\.,]?\d*|\d+½|\d+\s*1\/2)\s*(?:pts?|points?)/i) ||
                        workingLine.match(/[:\-–—]\s*(\d+[\.,]?\d*)\s*$/) ||
                        workingLine.match(/\s+(\d+[\.,]?\d*)\s*$/);

    if (pointsMatch) {
      const parsedPts = parseScore(pointsMatch[1]);
      if (parsedPts !== null) {
        points = parsedPts;
        workingLine = workingLine.replace(pointsMatch[0], ' ').trim();
      }
    }
  }

  // Extraction d'un éventuel Elo hors crochets
  if (elo === 0) {
    const eloMatch = workingLine.match(/(?:elo\s*[:=]?\s*(\d{3,4}))|(?:(\d{3,4})\s*elo)/i);
    if (eloMatch) {
      elo = parseInt(eloMatch[1] || eloMatch[2], 10);
      workingLine = workingLine.replace(eloMatch[0], ' ').trim();
    }
  }

  const name = cleanPlayerName(workingLine);
  if (!name) return null;

  return { rank, name, elo, club, points };
}

/**
 * Moteur d'analyse universel multi-formats
 */
export function parseTournamentStandings(rawInput: string): ParseResult {
  const result: ParseResult = {
    success: false,
    standings: [],
    podium: { first: null, second: null, third: null },
    errors: [],
    warnings: [],
    formatDetected: 'unknown',
    totalParticipants: 0
  };

  if (!rawInput || !rawInput.trim()) {
    result.errors.push('Le texte fourni est vide.');
    return result;
  }

  // Prétraitement intelligent : si le texte est collé sur une seule ligne (cas fréquent sur mobile),
  // on insère un retour à la ligne avant chaque nouveau rang suivi du nom
  const preprocessed = rawInput
    .replace(/(?:^|\s+)(\d+)\s*\|\s*([a-zA-Z\u00C0-\u017F\[])/g, '\n$1 | $2')
    .trim();

  const lines = preprocessed
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length === 0) {
    result.errors.push('Aucune ligne valide trouvée.');
    return result;
  }

  // 1. Tenter en priorité absolue le format Standard Officiel (avec séparateur barre |)
  const standardEntries = tryParseStandardPipeFormat(lines);
  if (standardEntries && standardEntries.length >= 1) {
    result.standings = standardEntries;
    result.formatDetected = 'standard-cdr';
    result.totalParticipants = standardEntries.length;
    result.success = standardEntries.length >= 1;
    result.podium = {
      first: standardEntries[0] || null,
      second: standardEntries[1] || null,
      third: standardEntries[2] || null
    };
    return result;
  }

  // 2. Tenter le flux vertical (cellule par ligne, cas Chess-Results Web copié avec retours à la ligne)
  const verticalEntries = tryParseVerticalStream(lines);
  if (verticalEntries && verticalEntries.length >= 3) {
    result.standings = verticalEntries;
    result.formatDetected = 'vertical-stream';
    result.totalParticipants = verticalEntries.length;
    result.success = true;
    result.podium = {
      first: verticalEntries[0] || null,
      second: verticalEntries[1] || null,
      third: verticalEntries[2] || null
    };
    return result;
  }

  // 2. Tenter le format Tableau Markdown (| col1 | col2 |)
  const markdownEntries = tryParseMarkdownTable(lines);
  if (markdownEntries && markdownEntries.length >= 3) {
    result.standings = markdownEntries;
    result.formatDetected = 'markdown-table';
    result.totalParticipants = markdownEntries.length;
    result.success = true;
    result.podium = {
      first: markdownEntries[0] || null,
      second: markdownEntries[1] || null,
      third: markdownEntries[2] || null
    };
    return result;
  }

  // 3. Formats horizontaux ligne par ligne (TSV, CSV, 2+ espaces, WhatsApp)
  const hasTabs = lines.some(l => l.includes('\t'));
  const hasSemicolons = lines.some(l => l.includes(';'));
  const hasCommas = lines.some(l => l.includes(',') && !l.includes('\t') && (l.match(/,/g) || []).length >= 3);
  const hasMultiSpaces = lines.some(l => /\s{2,}/.test(l));

  let detectedFormat: ParseResult['formatDetected'] = 'unknown';

  if (hasTabs) {
    detectedFormat = 'chess-results';
  } else if (hasSemicolons || hasCommas) {
    detectedFormat = 'csv';
  } else if (hasMultiSpaces) {
    detectedFormat = 'tsv';
  } else {
    detectedFormat = 'whatsapp-list';
  }

  result.formatDetected = detectedFormat;

  const entries: StandingEntry[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isHeaderOrNoiseLine(line)) continue;

    let parsedEntry: StandingEntry | null = null;

    if (detectedFormat === 'chess-results' || detectedFormat === 'tsv' || line.includes('\t') || /\s{2,}/.test(line)) {
      parsedEntry = parseTsvOrChessResultsLine(line, entries.length + 1);
    } else if (detectedFormat === 'csv' || line.includes(';')) {
      parsedEntry = parseCsvLine(line, entries.length + 1);
    } else {
      parsedEntry = parseFreeformWhatsAppLine(line, entries.length + 1);
    }

    if (parsedEntry && parsedEntry.name) {
      if (!parsedEntry.rank || parsedEntry.rank <= 0) {
        parsedEntry.rank = entries.length + 1;
      }
      entries.push(parsedEntry);
    }
  }

  if (entries.length === 0) {
    result.errors.push('Impossible d\'extraire des joueurs ou des scores du texte collé. Vérifiez le format.');
    return result;
  }

  entries.sort((a, b) => a.rank - b.rank);
  entries.forEach((e, idx) => {
    e.rank = idx + 1;
  });

  result.standings = entries;
  result.totalParticipants = entries.length;
  result.success = entries.length >= 3;

  if (entries.length < 3) {
    result.warnings.push(`Seulement ${entries.length} participant(s) détecté(s). Le podium nécessite idéalement au moins 3 joueurs.`);
  }

  result.podium = {
    first: entries[0] || null,
    second: entries[1] || null,
    third: entries[2] || null
  };

  return result;
}

/**
 * Génère le message officiel formaté pour WhatsApp avec podium et emojis
 */
export function generateWhatsAppResultsMessage(params: {
  tournamentTitle: string;
  tournamentDate?: string;
  location?: string;
  edition?: number;
  podium: Podium;
  totalParticipants?: number;
  siteUrl?: string;
}): string {
  const {
    tournamentTitle,
    tournamentDate,
    location = 'Café Dardara, Annaba',
    podium,
    totalParticipants = 0,
    siteUrl = 'https://cercledesrois.dz/archives'
  } = params;

  const first = podium.first;
  const second = podium.second;
  const third = podium.third;

  const lines = [
    `👑 *LE CERCLE DES ROIS* — PALMARÈS OFFICIEL 🏆`,
    ``,
    `📍 *${tournamentTitle}*`,
    tournamentDate ? `📅 *Date :* ${tournamentDate}` : null,
    `📌 *Lieu :* ${location}`,
    ``,
    `✨ *LE PODIUM D'HONNEUR* ✨`,
    first ? `🥇 *1ᵉʳ (Champion) :* *${first.name}* (${first.points} pts)${first.club && first.club !== 'Indépendant' ? ` · ${first.club}` : ''}` : null,
    second ? `🥈 *2ᵉ Place :* *${second.name}* (${second.points} pts)${second.club && second.club !== 'Indépendant' ? ` · ${second.club}` : ''}` : null,
    third ? `🥉 *3ᵉ Place :* *${third.name}* (${third.points} pts)${third.club && third.club !== 'Indépendant' ? ` · ${third.club}` : ''}` : null,
    ``,
    totalParticipants > 0 ? `👥 *Total participants :* ${totalParticipants} joueurs` : null,
    ``,
    `📜 *Grille complète & archives officielles :*`,
    `🔗 ${siteUrl}`,
    ``,
    `_Le Cercle des Rois — Tradition, Amitié & Passion du Noble Jeu à Annaba_ ♟️`
  ].filter(l => l !== null);

  return lines.join('\n');
}
