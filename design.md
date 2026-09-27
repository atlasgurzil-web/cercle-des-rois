# Design — Le Cercle des Rois (Annaba)

A locked design system for this application. Every page redesign reads this file before emitting code. Do not regenerate per page — extend or amend this file when the system needs to grow.

## Genre
`editorial` — High visual craft, historical dignity, typographic precision, and anti-AI-slop restraint.

## Macrostructure Family
- **Vitrine & Accueil (Marketing)** : *Split Studio* (Diptych layout: positioning & history on left, live action & proof on right). Never centred-everything.
- **Tournoi & Inscription** : *Workbench* (Tool-grade responsive form, live capacity progress, quick sharing & QR modal).
- **Archives & Palmarès** : *Ledger* (Historical tabular records, podium honor displays, Buchholz tie-breaks).
- **Annuaire des Joueurs** : *Directory Specimen* (53 verified players, club affiliations, CDR stats, PIN-protected privacy).
- **Notre Histoire** : *Editorial Broadside* (Drop caps, narrative rhythm, authentic quotes, zero generic 3-card grids).
- **Administration** : *Console* (Fast PIN verification, real-time check-in, 1-click Papi/Swiss-Manager export).

## Theme Tokens
- `--color-paper`     : `oklch(0.12 0.012 260)` (#090B10 — Deep Obsidian)
- `--color-paper-2`   : `oklch(0.16 0.016 260)` (#111520 — Surface card)
- `--color-paper-3`   : `oklch(0.22 0.020 260)` (#19202E — Hover surface)
- `--color-ink`       : `oklch(0.96 0.008 85)`  (#F8FAFC — Pure Ivory)
- `--color-ink-2`     : `oklch(0.72 0.022 85)`  (#A6B4C9 — Legible Muted)
- `--color-rule`      : `oklch(0.35 0.045 85 / 0.35)` (Hairline Gold Rule)
- `--color-accent`    : `oklch(0.78 0.160 85)`  (#D4AF37 — Royal Gold)
- `--color-accent-ink`: `oklch(0.10 0.020 85)`  (#0D0B05 — Contrast on Gold)
- `--color-focus`     : `oklch(0.85 0.180 85)`  (Instant Focus Ring)

## Typography
- **Display** : `Cinzel`, roman only (`font-style: normal`). No italic headers anywhere (Gate 38a).
- **Body** : `Plus Jakarta Sans`, 400/500/600.
- **Mono** : `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`.
- **Display Tracking** : `tracking-wider` on uppercase tags, `tracking-tight` on large titles.
- **Type Scale Anchor** : `clamp(2rem, 5vw, 3.75rem)` for primary display headers.

## Anti-Pattern Elimination (Slop-Test Strict Compliance)
1. **No gradient text** : `background-clip: text` gradient headlines are strictly banned (Gate 2). Use solid white or solid gold.
2. **No centred-everything heroes** : Eyebrow and CTA must break off-axis (Gate 6). Use Split Studio layout.
3. **No 3-equal-column icon-above-heading cards** : Banned by Gate 3. Use asymmetrical modules and editorial text.
4. **No `transition-all`** : Always specify target properties: `transition-colors`, `transition-transform` (Gate 10).
5. **No uniform `hover:scale-105`** : Banned by Gate 11. Use subtle border-color and surface shifts.
6. **No `overflow-x: hidden`** : Must use `overflow-x: clip` on both `html` and `body` (Gate 34).
7. **No two-line clickable buttons** : Must declare `whitespace-nowrap` on CTAs (Gate 49).
8. **Navigation** : N5 Floating Pill or N6 Masthead (Gate 42).
9. **Footer** : Ft5 Statement Footer (Gate 43).

## CTA Voice
- **Primary CTA** : Solid Gold fill (`bg-gold-500 text-noir-950 font-bold px-6 py-3.5 rounded-xl hover:bg-gold-400 active:translate-y-0.5`).
- **Secondary CTA** : Hairline Gold outline (`bg-noir-850 text-slate-200 border border-gold-500/30 hover:border-gold-400 px-6 py-3.5 rounded-xl`).

## What Pages MUST Share
- The official royal seal logotype (`public/logo.png`).
- The accent color and restrained footprint (≤ 5% per viewport).
- The `Cinzel` + `Plus Jakarta Sans` pairing.
- Roman-only headlines.
- Instant keyboard focus rings (`outline: 2px solid var(--color-focus)`).
