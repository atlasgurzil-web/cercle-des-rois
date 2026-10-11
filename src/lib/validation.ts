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
 * Validates registration input with localized Algerian rules
 */
export function validateRegistrationInput(input: any): ValidationResult<RegistrationInput> {
  const errors: Record<string, string> = {};

  // 1. Nom
  const nom = (input?.nom || '').trim();
  if (!nom) {
    errors.nom = 'Le nom de famille est obligatoire.';
  } else if (nom.length < 2) {
    errors.nom = 'Le nom doit comporter au moins 2 caractères.';
  } else if (nom.length > 50) {
    errors.nom = 'Le nom ne peut pas dépasser 50 caractères.';
  }

  // 2. Prénom
  const prenom = (input?.prenom || '').trim();
  if (!prenom) {
    errors.prenom = 'Le prénom est obligatoire.';
  } else if (prenom.length < 2) {
    errors.prenom = 'Le prénom doit comporter au moins 2 caractères.';
  } else if (prenom.length > 50) {
    errors.prenom = 'Le prénom ne peut pas dépasser 50 caractères.';
  }

  // 3. Téléphone (Algérie: 05, 06 ou 07 suivi de 8 chiffres = 10 chiffres au total)
  const rawPhone = (input?.telephone || '').trim();
  const normalizedPhone = normalizePhoneNumber(rawPhone);
  
  if (!normalizedPhone) {
    errors.telephone = 'Le numéro de téléphone est obligatoire pour le pointage.';
  } else {
    const algerianPhoneRegex = /^0(5|6|7)[0-9]{8}$/;
    if (!algerianPhoneRegex.test(normalizedPhone)) {
      errors.telephone = 'Numéro de téléphone algérien invalide (ex: 0551056785, 06xx, 07xx).';
    }
  }

  // 4. Email (optionnel, mais si fourni doit être valide)
  const email = (input?.email || '').trim().toLowerCase();
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Adresse e-mail invalide.';
    }
  }

  // 5. FIDE ID (optionnel, doit être composé de chiffres uniquement)
  const fideId = (input?.fideId || '').trim();
  if (fideId) {
    const fideRegex = /^[0-9]{4,10}$/;
    if (!fideRegex.test(fideId)) {
      errors.fideId = 'Le FIDE ID doit être un identifiant numérique (ex: 7981600).';
    }
  }

  // 6. Club
  const club = (input?.club || 'Indépendant').trim();

  // 7. Notes / Commentaires (max 200 chars)
  const notes = (input?.notes || '').trim().slice(0, 200);

  // 8. Date de naissance (optionnel, YYYY-MM-DD)
  const dateNaissance = (input?.dateNaissance || '').trim();

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    data: isValid
      ? {
          nom: nom.toUpperCase(),
          prenom: prenom.charAt(0).toUpperCase() + prenom.slice(1),
          telephone: normalizedPhone,
          email,
          fideId,
          dateNaissance,
          club,
          notes
        }
      : undefined
  };
}
