import { test, expect } from '@playwright/test';
import { 
  parseTournamentStandings, 
  generateWhatsAppResultsMessage, 
  parseScore 
} from '../src/lib/standings-parser';

test.describe('Standings Parser Engine (Intelligence d\'Analyse & Formats)', () => {

  test('parseScore convertit correctement tous les formats de points', () => {
    expect(parseScore('4.5')).toBe(4.5);
    expect(parseScore('4,5')).toBe(4.5);
    expect(parseScore('4.5 pts')).toBe(4.5);
    expect(parseScore('4,5 points')).toBe(4.5);
    expect(parseScore('5')).toBe(5);
    expect(parseScore('5.0')).toBe(5);
    expect(parseScore('4½')).toBe(4.5);
    expect(parseScore('4 1/2')).toBe(4.5);
  });

  test('Analyse avec succès un copier-coller tabulaire Chess-Results', () => {
    const rawTsv = `1\tBenlaid, Lakhdar\tALG\t1851\tMACOMADES\t4,5\t0\t13,5\t14,75
2\tBouzitoune, Abdelhafid\tALG\t0\tHAMRA ANNABA\t4,0\t0\t13,0\t10,50
3\tKoudri, Samir\tALG\t0\tHAMRA ANNABA\t3,5\t0\t13,5\t8,25
4\tAssoul, Abdelaziz\tALG\t1794\tHAMRA ANNABA\t3,0\t0\t13,5\t7,00`;

    const result = parseTournamentStandings(rawTsv);

    expect(result.success).toBe(true);
    expect(result.formatDetected).toBe('chess-results');
    expect(result.totalParticipants).toBe(4);

    // Vérification Podium
    expect(result.podium.first).not.toBeNull();
    expect(result.podium.first?.name).toContain('Benlaid');
    expect(result.podium.first?.points).toBe(4.5);
    expect(result.podium.first?.club).toBe('MACOMADES');
    expect(result.podium.first?.elo).toBe(1851);

    expect(result.podium.second).not.toBeNull();
    expect(result.podium.second?.name).toContain('Bouzitoune');
    expect(result.podium.second?.points).toBe(4);

    expect(result.podium.third).not.toBeNull();
    expect(result.podium.third?.name).toContain('Koudri');
    expect(result.podium.third?.points).toBe(3.5);
  });

  test('Analyse avec succès une liste WhatsApp simplifiée', () => {
    const rawWhatsApp = `1. Benlaid Lakhdar (MACOMADES) - 4.5 pts [Elo 1851]
2. Bouzitoune Abdelhafid (HAMRA ANNABA) - 4 pts
3. Koudri Samir (HAMRA ANNABA) - 3.5 pts
4. Assoul Abdelaziz (HAMRA ANNABA) - 3 pts`;

    const result = parseTournamentStandings(rawWhatsApp);

    expect(result.success).toBe(true);
    expect(result.formatDetected).toBe('whatsapp-list');
    expect(result.totalParticipants).toBe(4);

    expect(result.podium.first?.name).toBe('Benlaid Lakhdar');
    expect(result.podium.first?.points).toBe(4.5);
    expect(result.podium.first?.club).toBe('MACOMADES');
    expect(result.podium.first?.elo).toBe(1851);

    expect(result.podium.second?.name).toBe('Bouzitoune Abdelhafid');
    expect(result.podium.second?.points).toBe(4);
    expect(result.podium.second?.club).toBe('HAMRA ANNABA');

    expect(result.podium.third?.name).toBe('Koudri Samir');
    expect(result.podium.third?.points).toBe(3.5);
  });

  test('Génère le message WhatsApp officiel avec emojis et liens', () => {
    const podium = {
      first: { rank: 1, name: 'Benlaid Lakhdar', points: 4.5, elo: 1851, club: 'MACOMADES' },
      second: { rank: 2, name: 'Bouzitoune Abdelhafid', points: 4, elo: 0, club: 'HAMRA ANNABA' },
      third: { rank: 3, name: 'Koudri Samir', points: 3.5, elo: 0, club: 'HAMRA ANNABA' },
    };

    const message = generateWhatsAppResultsMessage({
      tournamentTitle: 'Le Cercle des Rois IV – Édition Annaba',
      tournamentDate: 'Jeudi 1er Octobre 2026',
      podium,
      totalParticipants: 32,
      siteUrl: 'https://cercledesrois.dz/archives'
    });

    expect(message).toContain('LE CERCLE DES ROIS');
    expect(message).toContain('🥇 *1ᵉʳ (Champion) :* *Benlaid Lakhdar* (4.5 pts)');
    expect(message).toContain('🥈 *2ᵉ Place :* *Bouzitoune Abdelhafid* (4 pts)');
    expect(message).toContain('🥉 *3ᵉ Place :* *Koudri Samir* (3.5 pts)');
    expect(message).toContain('https://cercledesrois.dz/archives');
  });

  test('Analyse avec succès le modèle vertical cellule-par-cellule avec liens Markdown (modèle utilisateur)', () => {
    const rawVertical = `Classement final après 7 rondes
Rg
Rg initial
Nom
FED
Elo
Club/Ville
Pts
Dep.1
Dep.2
Dep.3
1
2
[Saim, Bachir](https://chess-results.com/tnr1458819.aspx?lan=20&art=9&fed=ALG&turdet=YES&snr=2)
ALG
1966
ASSN
6,5
0
28,5
32
2
1
[Dorbane, Khaled](https://chess-results.com/tnr1458819.aspx?lan=20&art=9&fed=ALG&turdet=YES&snr=1)
ALG
2086
ASSN
6
0
31,5
33,5
3
65
[Mekerba, Sidahmed](https://chess-results.com/tnr1458819.aspx?lan=20&art=9&fed=ALG&turdet=YES&snr=65)
ALG
0
AMCHLEF
6
0
29
31,5
4
10
[Touahar, Khireddine](https://chess-results.com/tnr1458819.aspx?lan=20&art=9&fed=ALG&turdet=YES&snr=10)
ALG
1788
OMB
6
0
28,5
30
Annotation:
Départage 1: Direct Encounter
mais c pas le seul modele`;

    const result = parseTournamentStandings(rawVertical);

    expect(result.success).toBe(true);
    expect(result.formatDetected).toBe('vertical-stream');
    expect(result.totalParticipants).toBe(4);

    // Podium 1er
    expect(result.podium.first).not.toBeNull();
    expect(result.podium.first?.name).toBe('Saim, Bachir');
    expect(result.podium.first?.elo).toBe(1966);
    expect(result.podium.first?.club).toBe('ASSN');
    expect(result.podium.first?.points).toBe(6.5);

    // Podium 2e
    expect(result.podium.second).not.toBeNull();
    expect(result.podium.second?.name).toBe('Dorbane, Khaled');
    expect(result.podium.second?.elo).toBe(2086);
    expect(result.podium.second?.club).toBe('ASSN');
    expect(result.podium.second?.points).toBe(6);

    // Podium 3e
    expect(result.podium.third).not.toBeNull();
    expect(result.podium.third?.name).toBe('Mekerba, Sidahmed');
    expect(result.podium.third?.club).toBe('AMCHLEF');
    expect(result.podium.third?.points).toBe(6);
  });

  test('Analyse le format Standard Cercle des Rois (Pipe |)', () => {
    const rawStandard = `1 | Saim, Bachir | ASSN | 1966 | 6.5 | 0 | 28.5 | 32
2 | Dorbane, Khaled | ASSN | 2086 | 6 | 0 | 31.5 | 33.5
3 | Mekerba, Sidahmed | AMCHLEF | 0 | 6 | 0 | 29 | 31.5
4 | Touahar, Khireddine | OMB | 1788 | 6 | 0 | 28.5 | 30`;

    const result = parseTournamentStandings(rawStandard);
    expect(result.success).toBe(true);
    expect(result.formatDetected).toBe('standard-cdr');
    expect(result.totalParticipants).toBe(4);

    expect(result.podium.first?.name).toBe('Saim, Bachir');
    expect(result.podium.first?.points).toBe(6.5);
    expect(result.podium.first?.dep1).toBe(0);
    expect(result.podium.first?.dep2).toBe(28.5);
    expect(result.podium.first?.dep3).toBe(32);

    expect(result.podium.second?.name).toBe('Dorbane, Khaled');
    expect(result.podium.second?.points).toBe(6);
    expect(result.podium.second?.dep1).toBe(0);
    expect(result.podium.second?.dep2).toBe(31.5);
    expect(result.podium.second?.dep3).toBe(33.5);

    expect(result.podium.third?.name).toBe('Mekerba, Sidahmed');
    expect(result.podium.third?.points).toBe(6);
    expect(result.podium.third?.dep1).toBe(0);
    expect(result.podium.third?.dep2).toBe(29);
    expect(result.podium.third?.dep3).toBe(31.5);
  });

  test('Analyse avec succès les 150 joueurs collés en un seul bloc continu sans sauts de ligne (cas mobile réel)', () => {
    const rawSingleLine = `1 | Hammadi, Rayane | Rdeaokas | 1537 | 7 | 0 | 28 | 29 2 | Derrar, Mohamed Amine | El Hidhab Tiaret | 1512 | 7 | 0 | 27 | 29.5 3 | Mokhnache, Redda | Cnf | 1437 | 6 | 0 | 30.5 | 31.5 4 | Guenfoud, Mohamed Dhiya Elhaq | El Hilal M Sila | 1574 | 6 | 0 | 30.5 | 28.5 5 | Bouzid, Salah | Elbaydek Kolea | 1596 | 6 | 0 | 29.5 | 33.5 6 | Renak, Samir | Chabet | 1473 | 6 | 0 | 27.5 | 29 7 | Brag, Zineddine | Acck | 1497 | 6 | 0 | 27 | 29.5 8 | Telli, Younes | Indépendant | 1502 | 6 | 0 | 26.5 | 28.5 9 | Zaidi, Arezki | Indépendant | 1564 | 6 | 0 | 26 | 29 10 | Zettal, Abderaouf | Indépendant | 1485 | 6 | 0 | 25.5 | 29`;

    const result = parseTournamentStandings(rawSingleLine);
    expect(result.success).toBe(true);
    expect(result.formatDetected).toBe('standard-cdr');
    expect(result.totalParticipants).toBe(10);

    expect(result.podium.first?.name).toBe('Hammadi, Rayane');
    expect(result.podium.first?.club).toBe('Rdeaokas');
    expect(result.podium.first?.elo).toBe(1537);
    expect(result.podium.first?.points).toBe(7);
    expect(result.podium.first?.dep1).toBe(0);
    expect(result.podium.first?.dep2).toBe(28);
    expect(result.podium.first?.dep3).toBe(29);

    expect(result.podium.second?.name).toBe('Derrar, Mohamed Amine');
    expect(result.podium.second?.club).toBe('El Hidhab Tiaret');
    expect(result.podium.second?.elo).toBe(1512);
    expect(result.podium.second?.points).toBe(7);
    expect(result.podium.second?.dep1).toBe(0);
    expect(result.podium.second?.dep2).toBe(27);
    expect(result.podium.second?.dep3).toBe(29.5);

    expect(result.podium.third?.name).toBe('Mokhnache, Redda');
    expect(result.podium.third?.club).toBe('Cnf');
    expect(result.podium.third?.elo).toBe(1437);
    expect(result.podium.third?.points).toBe(6);
    expect(result.podium.third?.dep1).toBe(0);
    expect(result.podium.third?.dep2).toBe(30.5);
    expect(result.podium.third?.dep3).toBe(31.5);
  });

});

test.describe('E2E Interface Admin - Module Résultats & Podium', () => {

  test('Vérifie le déverrouillage Admin, l\'onglet Résultats et l\'aperçu des départages', async ({ page }) => {
    await page.goto('/admin');

    const pinInput = page.locator('input[type="password"]');
    if (await pinInput.isVisible()) {
      await pinInput.focus();
      await pinInput.pressSequentially('Hamra1944', { delay: 30 });
      await page.getByRole('button', { name: 'Déverrouiller la Console' }).click();
    }

    // Attendre que le tableau de bord soit chargé
    await expect(page.getByText(/Tableau de Bord du/i)).toBeVisible({ timeout: 15000 });

    // Ouvrir l'onglet "Publier Résultats & Podium"
    const resultsTab = page.getByRole('button', { name: 'Publier Résultats & Podium' });
    await expect(resultsTab).toBeVisible({ timeout: 10000 });
    await resultsTab.click();

    // Vérifier la présence du bouton pour charger l'exemple officiel
    const loadSampleBtn = page.getByRole('button', { name: /Tester avec l'exemple officiel/i });
    await expect(loadSampleBtn).toBeVisible({ timeout: 10000 });
    await loadSampleBtn.click();

    // Vérifier la détection du format
    await expect(page.getByText(/Standard Officiel Cercle des Rois/i)).toBeVisible();

    // Vérifier l'affichage du champion sur le podium
    await expect(page.getByRole('heading', { name: 'Saim, Bachir' })).toBeVisible();
    await expect(page.getByText(/D1: 0 • D2: 28.5 • D3: 32/i)).toBeVisible();

    // Vérifier l'affichage du dauphin
    await expect(page.getByRole('heading', { name: 'Dorbane, Khaled' })).toBeVisible();
    await expect(page.getByText(/D1: 0 • D2: 31.5 • D3: 33.5/i)).toBeVisible();

    // Vérifier le 3e
    await expect(page.getByRole('heading', { name: 'Mekerba, Sidahmed' })).toBeVisible();
    await expect(page.getByText(/D1: 0 • D2: 29 • D3: 31.5/i)).toBeVisible();

    // Tester avec la saisie continue collée (cas mobile réel avec départages)
    const textarea = page.locator('textarea');
    await textarea.fill('1 | Hammadi, Rayane | Rdeaokas | 1537 | 7 | 0 | 28 | 29 2 | Derrar, Mohamed Amine | El Hidhab Tiaret | 1512 | 7 | 0 | 27 | 29.5 3 | Mokhnache, Redda | Cnf | 1437 | 6 | 0 | 30.5 | 31.5');

    // Vérifier le nouveau podium
    await expect(page.getByRole('heading', { name: 'Hammadi, Rayane' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Derrar, Mohamed Amine' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Mokhnache, Redda' })).toBeVisible();
    await expect(page.getByText(/D1: 0 • D2: 28 • D3: 29/i)).toBeVisible();
  });

});

