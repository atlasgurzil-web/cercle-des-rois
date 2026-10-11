/**
 * Validation utilities for player registration and tournament inputs.
 */

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: Record<string, string>;
}

export interface RegistrationInput {
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  fideId?: string;
  dateNaissance?: string;
  club?: string;
  notes?: string;
}

/**
 * Normalizes an Algerian phone number into standard 10-digit format (05xx, 06xx, 07xx)
 */
export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  // Remove spaces, dots, dashes, parentheses
  let cleaned = rawPhone.replace(/[\s.\-()]/g, '');

  // Convert international Algerian prefix +213 or 00213 to 0
  if (cleaned.startsWith('+213')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('00213')) {
    cleaned = '0' + cleaned.slice(5);
  } else if (cleaned.startsWith('213')) {
    cleaned = '0' + cleaned.slice(3);
  }

  return cleaned;
}

/**
 * Validates registration input - All fields are optional and flexible as requested
 */
export function validateRegistrationInput(input: unknown): ValidationResult<RegistrationInput> {
  const payload = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;

  // 1. Nom & Prénom (Entièrement optionnels, avec valeur par défaut amicale si vide)
  const rawNom = String(payload.nom || '').trim();
  const rawPrenom = String(payload.prenom || '').trim();

  const nom = rawNom || (rawPrenom ? '' : 'JOUEUR');
  const prenom = rawPrenom || (rawNom ? '' : 'Participant');

  // 2. Téléphone (Optionnel, normalisé si présent sans bloquer)
  const rawPhone = String(payload.telephone || '').trim();
  const normalizedPhone = rawPhone ? normalizePhoneNumber(rawPhone) : '';

  // 3. Email (Optionnel)
  const email = String(payload.email || '').trim().toLowerCase();

  // 4. FIDE ID (Optionnel)
  const fideId = String(payload.fideId || '').trim();

  // 5. Club (Saisie texte libre, non imposée)
  const club = String(payload.club || '').trim() || 'Indépendant';

  // 6. Notes / Commentaires (max 200 chars)
  const notes = String(payload.notes || '').trim().slice(0, 200);

  // 7. Date de naissance (Optionnel)
  const dateNaissance = String(payload.dateNaissance || '').trim();

  return {
    isValid: true,
    errors: {},
    data: {
      nom: (nom || 'JOUEUR').toUpperCase(),
      prenom: prenom ? (prenom.charAt(0).toUpperCase() + prenom.slice(1)) : '',
      telephone: normalizedPhone || rawPhone,
      email,
      fideId,
      dateNaissance,
      club,
      notes
    }
  };
}
