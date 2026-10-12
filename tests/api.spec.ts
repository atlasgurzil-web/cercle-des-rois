import { test, expect } from '@playwright/test';

test.describe('API Endpoints (Intégrité Backend & Sécurité)', () => {

  test('GET /api/tournaments renvoie la liste des tournois en JSON', async ({ request }) => {
    const response = await request.get('/api/tournaments');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    // Vérifier les champs obligatoires du tournoi
    expect(data[0]).toHaveProperty('id');
    expect(data[0]).toHaveProperty('title');
    expect(data[0]).toHaveProperty('slug');
  });

  test('GET /api/tournaments/le-cercle-des-rois-4 renvoie le tournoi actif', async ({ request }) => {
    const response = await request.get('/api/tournaments/le-cercle-des-rois-4');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.slug).toBe('le-cercle-des-rois-4');
    expect(data).toHaveProperty('maxParticipants');
  });

  test('GET /api/players renvoie les joueurs sans fuite de PII en public', async ({ request }) => {
    const response = await request.get('/api/players');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    if (data.length > 0) {
      const first = data[0];
      // L'email doit être vide ou absent en mode public non-authentifié
      expect(first.email || '').toBe('');
      // Si un numéro est présent, il doit être masqué avec des points
      if (first.telephone) {
        expect(first.telephone).toContain('••');
      }
    }
  });

  test('POST /api/auth rejette un code PIN erroné', async ({ request }) => {
    const response = await request.post('/api/auth', {
      data: { pin: '0000_FAUX' }
    });
    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('POST /api/auth accepte le code PIN légitime (Hamra1944) et retourne un token', async ({ request }) => {
    const response = await request.post('/api/auth', {
      data: { pin: 'Hamra1944' }
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data).toHaveProperty('token');
  });

  test('POST /api/tournaments/le-cercle-des-rois-4/register enregistre un joueur', async ({ request }) => {
    const randomId = Math.floor(Math.random() * 9000) + 1000;
    const response = await request.post('/api/tournaments/le-cercle-des-rois-4/register', {
      data: {
        nom: `TesteurAPI_${randomId}`,
        prenom: 'Robot',
        club: 'Hamra Annaba',
        fideId: `99${randomId}`,
        telephone: `0555${randomId}99`
      }
    });

    expect([200, 201]).toContain(response.status());
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data).toHaveProperty('registration');
    expect(data.registration.nom.toUpperCase()).toBe(`TESTEURAPI_${randomId}`);

    // Nettoyage automatique post-test pour garantir zéro résidu en base
    if (data.registration?.id) {
      const authRes = await request.post('/api/auth', { data: { pin: 'Hamra1944' } });
      const authData = await authRes.json();
      await request.post('/api/tournaments/le-cercle-des-rois-4/checkin', {
        headers: { Authorization: `Bearer ${authData.token}` },
        data: { action: 'remove', registrationId: data.registration.id }
      });
    }
  });
});
