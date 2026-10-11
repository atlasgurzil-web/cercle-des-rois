import crypto from 'crypto';
import { DirectoryPlayer, PlayerRegistration } from '@/types';

// Admin PIN configuration (configurable via environment variable, fallback to default)
const ADMIN_PIN = process.env.ADMIN_PIN || 'Hamra1944';
const SECRET_SALT = process.env.AUTH_SECRET || 'cercle-des-rois-annaba-secret-salt-2026';

/**
 * Creates a signed, time-limited token for authenticated admin sessions (valid 24h)
 */
export function createAdminToken(): string {
  const expiry = Date.now() + 24 * 60 * 60 * 1000;
  const payload = `${ADMIN_PIN}:${expiry}`;
  const signature = crypto.createHmac('sha256', SECRET_SALT).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

/**
 * Verifies a given session token
 */
export function verifyAdminToken(token: string | null | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [pin, expiryStr, signature] = decoded.split(':');
    if (!pin || !expiryStr || !signature) return false;

    // Check PIN match (case-insensitive)
    if (pin.trim().toLowerCase() !== ADMIN_PIN.toLowerCase()) return false;

    // Check expiry
    const expiry = parseInt(expiryStr, 10);
    if (isNaN(expiry) || Date.now() > expiry) return false;

    // Check signature
    const expectedPayload = `${pin}:${expiryStr}`;
    const expectedSignature = crypto.createHmac('sha256', SECRET_SALT).update(expectedPayload).digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

/**
 * Validates a direct PIN attempt
 */
export function validateAdminPin(pin: string | null | undefined): boolean {
  if (!pin) return false;
  const clean = pin.trim();
  return clean.toLowerCase() === ADMIN_PIN.toLowerCase();
}

/**
 * Verifies if an incoming Next.js Request has admin privileges:
 * - Checks 'Authorization: Bearer <token>'
 * - Checks 'x-admin-token: <token>'
 * - Checks 'x-admin-pin: <pin>' (direct pin header)
 * - Checks 'cdr_admin_token' cookie
 */
export function verifyAdminRequest(request: Request): boolean {
  // 1. Check direct PIN header
  const pinHeader = request.headers.get('x-admin-pin');
  if (pinHeader && validateAdminPin(pinHeader)) {
    return true;
  }

  // 2. Check Authorization Bearer header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (verifyAdminToken(token)) return true;
  }

  // 3. Check custom token header
  const tokenHeader = request.headers.get('x-admin-token');
  if (tokenHeader && verifyAdminToken(tokenHeader)) {
    return true;
  }

  // 4. Check cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/cdr_admin_token=([^;]+)/);
  if (match && match[1] && verifyAdminToken(match[1])) {
    return true;
  }

  return false;
}

/**
 * Sanitizes a directory player for public display (masks PII: phone, email, birthdate)
 */
export function sanitizePlayerForPublic(player: DirectoryPlayer): DirectoryPlayer {
  return {
    ...player,
    telephone: player.telephone ? `${player.telephone.slice(0, 4)}••••••` : '',
    email: '',
    dateNaissance: player.dateNaissance ? `${player.dateNaissance.slice(0, 4)}` : ''
  };
}

/**
 * Sanitizes a player registration for public display
 */
export function sanitizeRegistrationForPublic(reg: PlayerRegistration): PlayerRegistration {
  return {
    ...reg,
    telephone: '',
    email: '',
    dateNaissance: '',
    notes: ''
  };
}
