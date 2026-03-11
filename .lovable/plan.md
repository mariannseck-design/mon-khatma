

## Plan : Remplacer "versets/ayats" par "pages" sur toute la page Suivi Hifz

### Changements

**1. `src/pages/HifzSuiviPage.tsx`**
- Ligne 209 : `totalAyats` → `totalPages` = `Math.max(1, Math.round(totalAyats / 15))` (≈15 versets/page)
- Ligne 244 : Label `'Ayats mémorisées'` → `'Pages mémorisées'`
- Ligne 357 : `{juz.memorizedVerses} ayats mémorisées` → convertir en pages : `{Math.max(1, Math.round(juz.memorizedVerses / 15))} page(s) mémorisée(s)`
- Passer `totalPages` au lieu de `totalAyats` au composant `HifzMilestoneCelebration`

**2. `src/components/hifz/HifzMilestoneCelebration.tsx`**
- Renommer le prop `totalAyats` → `totalPages`
- Adapter les seuils des milestones (10 ayats → 1 page, 50 → 3, 100 → 7, 250 → 17, 500 → 33, 1000 → 67)
- Changer tous les labels : `"X ayats mémorisées"` → `"X pages mémorisées"`

**3. `src/components/hifz/HifzActivitySummary.tsx`** — déjà fait (pages), rien à changer.

### Fichiers hors scope (non visibles sur cette page)
Les composants `HifzStep5Liaison`, `HifzStep6Tour`, `HifzDiagnostic`, `HifzConfig` contiennent aussi "verset" mais sont dans le tunnel de mémorisation, pas sur la page Suivi. Je les laisse intacts sauf demande contraire — "verset" reste le terme technique correct dans le contexte d'un exercice de mémorisation.

