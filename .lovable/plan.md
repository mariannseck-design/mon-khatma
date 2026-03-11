

## Rendre le bouton "Masquer les vides / Voir tous les Juz" plus discret

Transformer le bouton pilule bordé émeraude en un simple lien textuel discret, sans bordure ni fond.

### Modification — `src/pages/HifzSuiviPage.tsx` (lignes 411-419)

Remplacer le style actuel (fond carte, bordure émeraude épaisse, `font-semibold`) par :
- Pas de bordure, pas de fond
- Texte en `var(--p-text-55)` (gris discret) au lieu de `var(--p-primary)`
- Taille `text-[11px]` avec `font-medium` au lieu de `font-semibold`
- Icône plus petite (`w-3 h-3`)
- Garde le `rounded-full` et les animations hover/active subtiles

Résultat : un petit texte cliquable discret en bas de la liste des Juz, qui ne détourne plus l'attention.

