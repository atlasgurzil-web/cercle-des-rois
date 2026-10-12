import { test, expect } from '@playwright/test';

const PAGES_TO_TEST = [
  { path: '/', name: 'Accueil' },
  { path: '/tournois', name: 'Liste des tournois' },
  { path: '/tournoi/le-cercle-des-rois-4', name: 'Détail tournoi actif' },
  { path: '/archives', name: 'Palmarès & Archives' },
  { path: '/annuaire', name: 'Annuaire des joueurs' },
  { path: '/histoire', name: 'Histoire & Mémoire' },
  { path: '/admin', name: 'Console Organisateur (PIN)' },
];

test.describe('Crawler & Intégrité Globale (Click-All & Smoke Test)', () => {

  for (const pageInfo of PAGES_TO_TEST) {
    test(`Visite ${pageInfo.name} (${pageInfo.path}) sans erreur console ni crash HTTP`, async ({ page }) => {
      const pageErrors: Error[] = [];
      page.on('pageerror', (err) => {
        pageErrors.push(err);
      });

      const response = await page.goto(pageInfo.path, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), `La page ${pageInfo.path} doit retourner un statut < 400`).toBeLessThan(400);

      // Vérifie que le titre ou corps de page est présent
      await expect(page.locator('body')).toBeVisible();

      // Vérifie l'absence d'erreurs fatales d'exécution JavaScript
      expect(pageErrors, `Erreurs JS détectées sur ${pageInfo.path}: ${pageErrors.map(e => e.message).join(' | ')}`).toHaveLength(0);
    });
  }

  test('Test du menu de navigation mobile et desktop sur l\'Accueil', async ({ page }) => {
    await page.goto('/');

    // Vérifier les liens principaux dans la navbar
    const nav = page.locator('header[role="banner"]');
    await expect(nav).toBeVisible();

    // Tester la bascule du menu mobile si visible
    const mobileMenuBtn = page.locator('button[aria-label*="menu" i]');
    if (await mobileMenuBtn.isVisible()) {
      await mobileMenuBtn.click();
      await expect(page.locator('#mobile-navigation')).toBeVisible();
      // Refermer
      await mobileMenuBtn.click();
      await expect(page.locator('#mobile-navigation')).not.toBeVisible();
    }
  });

  test('Exploration et clic automatique sur les boutons interactifs sécurisés', async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (err) => pageErrors.push(err));

    await page.goto('/tournois');
    await page.waitForLoadState('networkidle');

    // Cliquer sur le premier tournoi disponible
    const tourneyCardLink = page.locator('main a[href*="/tournoi/"]').first();
    if (await tourneyCardLink.isVisible()) {
      await tourneyCardLink.click();
      await page.waitForURL(/\/tournoi\/.+/, { timeout: 7000 });
      expect(page.url()).toContain('/tournoi/');
    }

    // Sur la page détail du tournoi, cliquer sur les onglets de roster (Dossards confirmés / Liste d'attente)
    const tabs = page.locator('button:has-text("Confirmés"), button:has-text("attente")');
    const tabCount = await tabs.count();
    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(100);
      }
    }

    expect(pageErrors).toHaveLength(0);
  });
});
