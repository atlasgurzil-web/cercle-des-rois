import { test, expect } from '@playwright/test';

test.describe('Annuaire des Joueurs (US-10)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/annuaire', { waitUntil: 'domcontentloaded' });
  });

  test('Affichage des joueurs de l\'annuaire', async ({ page }) => {
    // Vérifier la présence du titre et de la grille de joueurs
    await expect(page.locator('h1')).toContainText(/Annuaire/i);
    // Au moins une carte ou ligne de joueur doit être visible
    const playerCards = page.locator('article, div.rounded-xl, div.rounded-2xl').filter({ hasText: /Hamra|Elo|Club/i });
    await expect(playerCards.first()).toBeVisible();
  });

  test('Recherche interactive par nom de joueur', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Rechercher" i]');
    await expect(searchInput).toBeVisible();

    // Taper une recherche
    await searchInput.fill('Hamza');
    await page.waitForTimeout(300);

    // Vérifier que les résultats contiennent Hamza
    const results = page.getByText(/Hamza/i);
    await expect(results.first()).toBeVisible();

    // Effacer la recherche
    await searchInput.clear();
    await page.waitForTimeout(300);
  });

  test('Filtrage par club', async ({ page }) => {
    // Vérifier s'il y a un select ou des boutons de filtre de club
    const clubSelect = page.locator('select').first();
    if (await clubSelect.isVisible()) {
      await clubSelect.selectOption({ index: 1 });
      await page.waitForTimeout(200);
    }
  });

  test('Déverrouillage des coordonnées avec le code secret PIN (Hamra1944)', async ({ page }) => {
    // Trouver le bouton pour déverrouiller les contacts
    const unlockBtn = page.getByRole('button', { name: /PIN|Déverrouiller|Admin/i }).first();
    if (await unlockBtn.isVisible()) {
      await unlockBtn.click();

      // La modale PIN s'ouvre
      const pinInput = page.locator('input[type="password"], input[placeholder*="PIN" i]').first();
      await expect(pinInput).toBeVisible();

      // Taper le bon PIN
      await pinInput.fill('Hamra1944');
      const submitPinBtn = page.getByRole('button', { name: /Valider|Déverrouiller|Accéder/i }).first();
      await submitPinBtn.click();

      // Vérifier que le mode organisateur est actif
      await expect(page.getByRole('button', { name: /Mode Organisateur/i })).toBeVisible({ timeout: 5000 });
    }
  });
});
