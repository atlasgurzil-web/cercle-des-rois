import { NextResponse } from 'next/server';

const ADMIN_PIN = process.env.ADMIN_PIN || '12081988';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pin } = body;

    if (pin === ADMIN_PIN) {
      return NextResponse.json({ success: true, token: 'cdr-admin-auth-session-valid' });
    }

    return NextResponse.json({ success: false, error: 'Code secret incorrect' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
