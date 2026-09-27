# Design System — Le Cercle des Rois (Lumen-01 DNA Locked)

/* Hallmark · macrostructure: Marquee Hero with Apparatus · theme: Lumen (catalog)
 * drop: Night Foundry · paper: oklch(13% 0.014 265) · accent: oklch(76% 0.17 50) + oklch(68% 0.16 18)
 * display: Instrument Serif 400 (italic pivot) · body: Geist Sans · labels: JetBrains Mono all-caps
 * axes: dark / classical-serif / warm-brass
 * nav: N5 floating pill · footer: Ft5 statement
 * reference: https://www.usehallmark.com/examples/lumen-01/
 */

## 1. Direction Artistique & Genre
- **Genre** : `atmospheric` / `editorial` (Lumen Drop: Night Foundry).
- **Ambiance** : Salle d'échecs nocturne, feutrée et prestigieuse. Noir violet profond, filament d'or chaud en lévitation, typographie d'art classique et précision technique horlogère.
- **Référence verrouillée** : `Lumen-01` (`usehallmark.com/examples/lumen-01/`).

---

## 2. Palette & Jetons OKLCH (Night Foundry)
```css
:root, [data-theme="lumen"] {
  color-scheme: dark;

  /* Paper / Fond nocturne */
  --color-paper:      oklch(13% 0.014 265); /* Fond principal nuit violette */
  --color-paper-2:    oklch(17% 0.016 265); /* Surface des cartes et panneaux */
  --color-paper-3:    oklch(22% 0.018 263); /* Surface active / hover */
  --color-rule:       oklch(30% 0.018 265); /* Filets et séparateurs fins */
  --color-rule-2:     oklch(42% 0.020 263); /* Filets secondaires / bordures */
  
  /* Textes / Encre */
  --color-muted:      oklch(60% 0.016 263); /* Légendes et métadonnées */
  --color-neutral:    oklch(72% 0.014 263); /* Corps secondaire */
  --color-ink-2:      oklch(82% 0.010 262); /* Texte courant haute lisibilité */
  --color-ink:        oklch(96% 0.006 262); /* Titres et éléments principaux */

  /* Accents / Métal en fusion */
  --color-accent:     oklch(76% 0.17 50);    /* Or laiton incandescent (#F5D061) */
  --color-accent-2:   oklch(68% 0.16 18);    /* Vermillon incandescent pour pivot em */
  --color-accent-ink: oklch(13% 0.014 265);  /* Contraste texte sur or */
  --color-focus:      oklch(76% 0.17 50);    /* Anneau de focus clavier */

  /* Effets de rayonnement */
  --color-glow:       oklch(80% 0.16 50 / 0.42); /* Halo intense */
  --color-glow-2:     oklch(80% 0.16 50 / 0.12); /* Halo diffus */
  --color-paper-emit: oklch(76% 0.17 50 / 0.05); /* Rayonnement de fond */
  --rule-blueprint:   oklch(96% 0.006 262 / 0.04); /* Grille millimétrée */
}
```

---

## 3. Typographie (Trio 2+1 Lumen)
- **Display** : `Instrument Serif` (`font-weight: 400`), tracking `-0.032em`, taille clamp `clamp(3rem, 6.5vw + 0.75rem, 6.5rem)`.
  - Mot pivot avec `em` : `color: var(--color-accent-2)`, non italique, avec soulignement animé en filet (`em::after`).
- **Body** : `Geist Sans` (ou `Inter`), font-weight 400/500/600, line-height 1.55.
- **Labels & Monospace** : `JetBrains Mono`, tracking `0.10em` à `0.16em`, tout en majuscules pour les badges et ordonnances (`00 · `, `01 · `).

---

## 4. Signatures Visuelles Lumen-01 Verrouillées
1. **N5 Floating Pill Nav** : Pilule centrale fixe en verre dépoli (`backdrop-filter: blur(22px)`), pastille d'or battant au cœur avec halo (`.nav__mark`), liens discrets et bouton d'action pilule.
2. **Hero Marquee avec Chambre Filament (Apparatus)** : Tube en verre scellé avec filament vertical d'or pur battant doucement, électrodes horizontales, halo et 4 lignes de repérage techniques (Callouts : Édition, Jauge, Cadence, Lieu).
3. **Grille Millimétrée (Blueprint Grid)** : Trame technique 48px × 48px estompée en masque radial sous le hero et le footer.
4. **Meter Strip (Signature Move 5)** : Bandeau de fréquence en direct avec voyant vert pulsant et 80 barres verticales suivant une onde sinusoïdale en or laiton.
5. **Stats Row avec Chiffres Instrument Serif** : Chiffres géants avec filet doré inférieur (`.stat__num::after`) et étiquettes techniques en JetBrains Mono.
6. **Cartes à Émission Interne** : Cartes avec filet doré de 32px au coin supérieur gauche (`.card::before`), dégradé radial subtil à 5% d'opacité, et surélévation douce au survol.
7. **Ft5 Statement Footer** : Grande phrase d'honneur gravée en Instrument Serif avec pivot `em`, grille blueprint en fond, pastille d'or et métadonnées en colonnes.
