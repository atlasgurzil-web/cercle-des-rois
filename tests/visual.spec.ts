import { test, expect } from '@playwright/test';

test.describe('Qualité Visuelle & Ergonomie Responsive (Mobile & Desktop)', () => {

  const viewports = [
    { name: 'Desktop (1280x800)', width: 1280, height: 800, isMobile: false },
    { name: 'Mobile (375x667)', width: 375, height: 667, isMobile: true },
  ];

  for (const vp of viewports) {
    test.describe(`Affichage sur ${vp.name}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      test('Accueil — Absence de débordement horizontal et intégrité du Hero', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        // Vérifier aucun débordement horizontal parasite
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        expect(hasHorizontalScroll, 'Aucun scroll horizontal indésirable ne doit exister').toBe(false);

        // Vérifier les éléments visuels phares
        await expect(page.locator('header[role="banner"]')).toBeVisible();
        await expect(page.locator('h1, h2').first()).toBeVisible();

        if (vp.isMobile) {
          // Sur mobile, le bouton menu hamburger doit être disponible
          const mobileMenuBtn = page.locator('button[aria-label*="menu" i]');
          await expect(mobileMenuBtn).toBeVisible();
        } else {
          // Sur desktop, les liens textuels complets doivent être affichés
          await expect(page.getByRole('link', { name: 'Tournois' }).first()).toBeVisible();
          await expect(page.getByRole('link', { name: 'Annuaire' }).first()).toBeVisible();
        }
      });

      test('Tournois — Cartes et jauges de remplissage', async ({ page }) => {
        await page.goto('/tournois', { waitUntil: 'domcontentloaded' });

        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        expect(hasHorizontalScroll).toBe(false);

        // Vérifier la présence du badge d'inscription
        await expect(page.getByText(/Inscriptions Ouvertes|Édition/i).first()).toBeVisible();
      });

      test('Annuaire — Rendu responsive de la grille des joueurs', async ({ page }) => {
        await page.goto('/annuaire', { waitUntil: 'domcontentloaded' });

        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        expect(hasHorizontalScroll).toBe(false);

        // Les contrôles (recherche et filtre) doivent être bien agencés
        await expect(page.locator('input[placeholder*="Rechercher" i]')).toBeVisible();
        await expect(page.locator('select[aria-label*="Filtrer" i]')).toBeVisible();
      });
    });
  }
});
