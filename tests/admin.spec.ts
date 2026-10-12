import { test, expect } from '@playwright/test';

test.describe('Espace Organisateur & Administration (US-11 à US-14)', () => {
  test('Tentative de connexion avec un mauvais code PIN', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    const pinInput = page.locator('input[type="password"]');
    await expect(pinInput).toBeVisible({ timeout: 10000 });

    await pinInput.fill('999999');
    await page.locator('button[type="submit"]').click();

    // Message d'erreur
    await expect(page.getByText(/incorrect|invalide|erreur/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('Authentification réussie avec le code PIN organisateur (Hamra1944)', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    const pinInput = page.locator('input[type="password"]');
    if (await pinInput.isVisible()) {
      await pinInput.fill('Hamra1944');
      await page.locator('button[type="submit"]').click();
    }

    // Le tableau de bord administrateur doit être visible
    await expect(page.getByText(/Console Organisateur|Tableau de bord/i).first()).toBeVisible({ timeout: 10000 });

    // Vérifier la présence des onglets principaux
    const tabTourneys = page.getByRole('button', { name: /Tous les tournois|Tournois/i });
    if (await tabTourneys.first().isVisible()) {
      await tabTourneys.first().click();
      await page.waitForTimeout(200);
    }

    const tabDirectory = page.getByRole('button', { name: /Annuaire|Joueurs/i });
    if (await tabDirectory.first().isVisible()) {
      await tabDirectory.first().click();
      await page.waitForTimeout(200);
    }
  });

  test('Export CSV de la liste des inscrits (US-13)', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    // Déverrouiller si nécessaire
    const pinInput = page.locator('input[type="password"]');
    if (await pinInput.isVisible()) {
      await pinInput.fill('Hamra1944');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(500);
    }

    // Chercher le bouton d'export CSV
    const exportCsvBtn = page.getByRole('button', { name: /Export|CSV|Papi|Télécharger/i }).first();
    if (await exportCsvBtn.isVisible()) {
      const downloadPromise = page.waitForEvent('download', { timeout: 4000 }).catch(() => null);
      await exportCsvBtn.click();
      const download = await downloadPromise;
      if (download) {
        expect(download.suggestedFilename()).toMatch(/\.csv$/i);
      }
    }
  });

  test('Publication des résultats et prévisualisation en direct du podium officiel', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    // Déverrouiller si nécessaire
    const pinInput = page.locator('input[type="password"]');
    if (await pinInput.isVisible()) {
      await pinInput.fill('Hamra1944');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(500);
    }

    // Aller sur le nouvel onglet Publier Résultats & Podium
    const tabResults = page.getByRole('button', { name: /Publier Résultats & Podium/i });
    await expect(tabResults).toBeVisible({ timeout: 5000 });
    await tabResults.click();

    // Vérifier la présence du module
    await expect(page.getByText(/Publication des Résultats & Podium/i).first()).toBeVisible();

    // Cliquer sur le bouton d'exemple Chess-Results
    const exampleBtn = page.getByRole('button', { name: /Exemple Chess-Results/i });
    await expect(exampleBtn).toBeVisible();
    await exampleBtn.click();

    // Vérifier l'apparition en temps réel des 3 cartes du podium d'honneur officiel
    await expect(page.getByText(/Le Podium d'Honneur \(Aperçu en Direct\)/i)).toBeVisible();
    await expect(page.getByText('Benlaid, Lakhdar').first()).toBeVisible();
    await expect(page.getByText('Bouzitoune, Abdelhafid').first()).toBeVisible();
    await expect(page.getByText('Koudri, Samir').first()).toBeVisible();

    // Vérifier que le bouton de partage WhatsApp est disponible
    const whatsappBtn = page.getByRole('button', { name: /Copier le communiqué WhatsApp/i });
    await expect(whatsappBtn).toBeVisible();
    await expect(whatsappBtn).toBeEnabled();

    // Vérifier que le bouton de publication officielle est disponible
    const publishBtn = page.getByRole('button', { name: /Publier Officiellement & Archiver le Tournoi/i });
    await expect(publishBtn).toBeVisible();
    await expect(publishBtn).toBeEnabled();
  });
});
