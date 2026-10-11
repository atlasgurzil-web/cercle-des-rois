# Design System — Le Cercle des Rois (Charte Officielle Épurée)

## 1. Direction Artistique & Identité
- **Genre** : Épuré, Noble, Atmosphérique.
- **Ambiance** : Salle d'échecs nocturne feutrée et prestigieuse. Noir profond texturé, or laiton impérial chaud, clarté typographique horlogère, élimination de tout apparat visuel superflu ou gadget distrayant.
- **Philosophie** : Priorité à l'expérience joueur, lisibilité optimale sur smartphone et élégance institutionnelle digne du noble jeu.

---

## 2. Palette Chromatique (Noir Profond & Or Impérial)

### Surfaces Nocturnes
- **Fond principal (`--bg-main`)** : `#08090D` (Noir nuit profond sans reflets agressifs).
- **Cartes & Conteneurs (`--bg-card`)** : `#0D0F17` (Surface feutrée contrastée).
- **Surfaces actives / Hover (`--bg-card-hover`)** : `#141824` (Élévation subtile au survol).
- **Séparateurs & Bordures (`--border-royal`)** : `rgba(212, 175, 55, 0.15)` à `rgba(255, 255, 255, 0.08)`.

### Métal & Accents Royaux
- **Or principal (`--gold-primary`)** : `#D4AF37` (Or laiton royal).
- **Or lumineux (`--gold-light`)** : `#F5D061` (Accents vifs, reflets de titre, badges).
- **Dégradé Titres** : Dégradé doux `from-gold-300 via-gold-400 to-amber-200`.

### Typographie & Encre
- **Titres & En-têtes** : `#FFFFFF` (Blanc pur haute lisibilité).
- **Corps de texte** : `#CBD5E1` (Slate-300, contraste supérieur à WCAG AA).
- **Métadonnées & Secondaire** : `#94A3B8` (Slate-400).

### Statuts Fonctionnels
- **Confirmé / Dossard validé** : `#10B981` (Vert émeraude franc, fond `emerald-500/15`).
- **Liste d'attente** : `#F59E0B` (Ambre chaleureux, fond `amber-500/15`).

---

## 3. Typographie

- **Display & Titres d'Honneur** : `Instrument Serif` (font-weight: 400/700). Utilisé pour le nom du Cercle, les titres de tournois et les champions.
- **Corps de texte & Formulaires** : `Geist Sans` (ou `Inter`, font-weight: 400/500/600). Lisibilité maximale sur tous écrans.
- **Monospace & Métadonnées** : `JetBrains Mono`. Utilisé pour les dossards, dates au format technique, pendules et cotes Elo.

---

## 4. Composants Clés

1. **Cartes Royales (`card-royal`)** :
   - Fond sombre uniforme `#0D0F17`, bordure fine en or estompé (`border-gold-500/20`), arrondi `rounded-xl` ou `rounded-2xl`.
   - Transitions fluides au survol (150ms).
2. **Hero Épuré** :
   - Grand titre *Le Cercle des Rois* en majesté, sous-titre contextualisé (1er jeudi du mois, après la prière d'Aïcha), carte d'inscription immédiate avec jauge en direct.
3. **Formulaire d'Inscription Sans Friction** :
   - Saisie libre, aucun champ obligatoire bloquant, validation bienveillante, retour instantané avec dossard ou rang en liste d'attente.
4. **Podium Dynamique des Champions** :
   - Cartes calculées dynamiquement à partir des tournois archivés dans la base de données.
