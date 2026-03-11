

## Test A/B — Deux variantes de la page Suivi Hifz

### Objectif
Creer deux pages independantes `SuiviHifz_PageA.tsx` et `SuiviHifz_PageB.tsx` pour comparer le placement du calendrier hebdomadaire (haut vs bas flottant).

### Composant partagé : `WeeklyCalendarBar`
Nouveau composant `src/components/hifz/WeeklyCalendarBar.tsx` :
- Barre de 7 jours (LUN-DIM) centrée sur la semaine en cours
- Jour sélectionné = cercle émeraude plein, autres = fond crème
- Affiche le jour (L, M, M...) + numéro (9, 10, 11...)
- Props : `selectedDate`, `onSelectDate`, `variant: 'header' | 'floating'`
- En mode `floating` : style `fixed bottom-20`, fond blanc/crème `rounded-3xl`, ombre légère, très fin (h-14)

### Statistiques globales partagées
Les deux pages affichent 4 stats au centre dans des cartes blanches `rounded-3xl` :
- **Versets** (total ayats mémorisées)
- **Pages** (pages uniques couvertes)
- **Juz** (juz commencés)
- **Hizb** (approximation : juz × 2)

### Page A — `src/pages/SuiviHifz_PageA.tsx`
Structure de haut en bas :
1. Header : `← Mon Suivi Hifz`
2. **WeeklyCalendarBar** (variant `header`, inline)
3. Grille 4 stats (cartes blanches `rounded-3xl`)
4. Heatmap d'activité
5. Parcours par Juz (cartes existantes)
6. Bouton "Voir tous les Juz"

### Page B — `src/pages/SuiviHifz_PageB.tsx`
Structure de haut en bas :
1. Header : `← Mon Suivi Hifz` (espace libéré, plus aéré)
2. Grille 4 stats (cartes blanches `rounded-3xl`)
3. Heatmap d'activité
4. Parcours par Juz
5. Bouton "Voir tous les Juz"
6. **WeeklyCalendarBar** (variant `floating`, `fixed bottom-20`, flottant au-dessus de la nav)

### Routing
Ajouter dans `App.tsx` :
- `/hifz-suivi-a` → `SuiviHifz_PageA`
- `/hifz-suivi-b` → `SuiviHifz_PageB`

### Design System
- Fond crème : `bg-[var(--p-bg)]`
- Cartes blanches : `background: var(--p-card)`, `rounded-3xl`, `border: 1px solid var(--p-border)`
- Vert émeraude : `var(--p-primary)`
- Texte : `var(--p-text)`, `var(--p-text-55)`

### Fichiers créés/modifiés
| Fichier | Action |
|---|---|
| `src/components/hifz/WeeklyCalendarBar.tsx` | Nouveau |
| `src/pages/SuiviHifz_PageA.tsx` | Nouveau |
| `src/pages/SuiviHifz_PageB.tsx` | Nouveau |
| `src/App.tsx` | Ajouter 2 routes |

La logique métier (fetch memorized verses, juzData, etc.) sera extraite dans un hook partagé `useHifzSuiviData` inline dans chaque page (copié depuis `HifzSuiviPage`) pour garder les pages autonomes et comparables.

