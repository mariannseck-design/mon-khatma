

## Affiner le graphique hebdomadaire — style blanc/vert/or discret

Le graphique actuel utilise les bonnes couleurs mais manque de subtilité. Voici les ajustements pour un rendu épuré cohérent avec le tableau de bord (carte Ma Khatma en image).

### Changements dans `WeeklyMiniChart.tsx`

| Élément | Avant | Après |
|---|---|---|
| Fond carte | `var(--p-card)` | `white` |
| Ombre | `var(--p-card-shadow)` | Ombre très légère `0 2px 12px rgba(6,95,70,0.06)` |
| Barres normales | emerald opacité 0.5 | emerald opacité **0.2** |
| Barres objectif atteint | emerald opacité 1 | emerald opacité **0.5** |
| Barre du jour | or opacité 1 | or opacité **0.6** |
| Ligne objectif | or opacité 0.5 | or opacité **0.25**, trait plus fin |
| Badge total pages | `var(--p-track)` | `rgba(6,95,70,0.06)` |
| Hauteur chart | 120px | **90px** |
| Coins barres | 4px | **6px** |
| Largeur max barres | 28px | 24px |

Résultat : un graphique aéré sur fond blanc, barres vert très pâle, jour courant en doré léger — discret et cohérent avec la charte premium.

### Fichier modifié
- `src/components/planificateur/WeeklyMiniChart.tsx`

