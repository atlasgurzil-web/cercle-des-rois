import { test, expect } from '@playwright/test';

test.describe('Tournois & Inscriptions (US-2 à US-7)', () => {
  const activeSlug = 'le-cercle-des-rois-4';

  test('Consulter la fiche complète du tournoi et ses détails (US-2)', async ({ page }) => {
    await page.goto(`/tournoi/${activeSlug}`, { waitUntil: 'domcontentloaded' });

    // Vérifier les informations essentielles
    await expect(page.locator('h1')).toContainText('Le Cercle des Rois');
    await expect(page.getByText(/Café Dardara|Annaba/i).first()).toBeVisible();
    await expect(page.getByText(/Blitz|5m/i).first()).toBeVisible();
  });

  test('Ouverture et fermeture de la modale QR Code (US-7)', async ({ page }) => {
    await page.goto(`/tournoi/${activeSlug}`, { waitUntil: 'domcontentloaded' });

    // Cliquer sur le bouton QR Code
    const qrBtn = page.getByRole('button', { name: /QR Code/i });
    await expect(qrBtn).toBeVisible();
    await qrBtn.click();

    // La modale QR code doit s'afficher
    const modal = page.locator('.fixed').filter({ hasText: /QR Code d'Inscription|QR Code Tournoi/i });
    await expect(modal).toBeVisible();

    // Une image ou un canvas de QR code doit être présent
    const qrImg = modal.locator('img[alt*="QR" i], img');
    await expect(qrImg.first()).toBeVisible();

    // Fermer la modale
    const closeBtn = modal.locator('button').first();
    await closeBtn.click();
    await expect(modal).not.toBeVisible();
  });

  test('Formulaire d\'inscription sans friction et soumission réussie (US-3 & US-4)', async ({ page }) => {
    await page.goto(`/tournoi/${activeSlug}#inscription`, { waitUntil: 'domcontentloaded' });

    const formSection = page.locator('#inscription');
    await expect(formSection).toBeVisible();

    // Générer un nom unique pour éviter les collisions
    const uniqueId = Date.now().toString().slice(-4);
    const testNom = `Testeur_${uniqueId}`;
    const testPrenom = 'Automatisé';

    // Remplir les champs
    const nomInput = page.locator('input[placeholder*="Nom" i], input[name="nom"], input#nom').first();
    const prenomInput = page.locator('input[placeholder*="Prénom" i], input[name="prenom"], input#prenom').first();

    if (await nomInput.isVisible()) {
      await nomInput.fill(testNom);
    }
    if (await prenomInput.isVisible()) {
      await prenomInput.fill(testPrenom);
    }

    // Soumettre le formulaire
    const submitBtn = formSection.getByRole('button', { name: /Confirmer|Valider|S'inscrire/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Attendre le retour de confirmation
    await expect(page.getByText(/Inscription confirmée|Dossard|Liste d'attente/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('Vérification de la confidentialité des données (US-5)', async ({ page }) => {
    await page.goto(`/tournoi/${activeSlug}`, { waitUntil: 'domcontentloaded' });

    // Sur la liste publique des inscrits, aucun numéro de téléphone ni email ne doit apparaître en clair
    const rosterSection = page.locator('#joueurs-inscrits, section').filter({ hasText: /Inscrits|Participants/i }).first();
    if (await rosterSection.isVisible()) {
      const text = await rosterSection.innerText();
      // Pas d'adresses email visibles
      expect(text).not.toMatch(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      // Pas de numéros de téléphone algériens en clair (05, 06, 07 suivis de 8 chiffres sans masquage)
      expect(text).not.toMatch(/0[567]\d{8}/);
    }
  });
});
