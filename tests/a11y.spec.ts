import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Audit d\'Accessibilité (WCAG 2.1 AA Standards)', () => {
  const pages = [
    { name: 'Accueil', path: '/' },
    { name: 'Tournois', path: '/tournois' },
    { name: 'Annuaire', path: '/annuaire' },
    { name: 'Histoire', path: '/histoire' },
  ];

  for (const pageInfo of pages) {
    test(`Page ${pageInfo.name} respecte les standards sémantiques et d'accessibilité`, async ({ page }) => {
      await page.goto(pageInfo.path, { waitUntil: 'domcontentloaded' });

      // Analyse Axe Core ciblée sur les règles critiques d'accessibilité (landmarks, labels, rôles, alt)
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag21a'])
        .analyze();

      expect(
        results.violations,
        `Violations d'accessibilité détectées sur ${pageInfo.path}: ${JSON.stringify(
          results.violations.map(v => ({ id: v.id, help: v.help, nodes: v.nodes.length })),
          null,
          2
        )}`
      ).toEqual([]);
    });
  }
});
