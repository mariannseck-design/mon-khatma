

## Afficher le nombre de pages au lieu des versets dans le cercle

### Changement
Dans le grand cercle de progression globale, remplacer `totalVerses` (ex: 126) par `pageCount` (nombre de pages estimé).

### Modifications dans `src/pages/HifzSuiviPage.tsx`

1. **Ligne 217** — Recalculer `globalPct` sur 604 pages : `Math.min(pageCount / 604, 1)`
2. **Ligne 272** — Afficher `pageCount` au lieu de `totalVerses`
3. Optionnel : ajouter un petit label "pages" sous le chiffre pour clarifier

