import { NextResponse } from 'next/server';
import { validateAdminPin, createAdminToken, verifyAdminRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { pin } = body;

    if (!pin) {
      return NextResponse.json({ error: 'Code PIN requis' }, { status: 400 });
    }

    if (!validateAdminPin(pin)) {
      return NextResponse.json({ error: 'Code PIN incorrect' }, { status: 401 });
    }

    const token = createAdminToken();

    const response = NextResponse.json({
      success: true,
      message: 'Authentification réussie',
      token
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: 'cdr_admin_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur lors de la vérification' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const isAuth = verifyAdminRequest(request);
  return NextResponse.json({ authenticated: isAuth });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Déconnexion effectuée' });
  response.cookies.delete('cdr_admin_token');
  return response;
}
