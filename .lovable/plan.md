

## Ajout d'un mini-graphique sur la page Tilawah (Planificateur)

### Ce qui existe
La page a deja `allProgress` (tableau de `{ date, pages_read }`) et `weekProgress` (7 derniers jours). Les donnees sont disponibles, il manque juste la visualisation.

### Proposition
Ajouter un **mini bar chart des 7 derniers jours** entre le marque-page (ReadingSlider) et l'historique (ReadingHistory). Pas de librairie externe — barres CSS pures pour rester leger.

### Design
- Carte arrondie style existant (`rounded-[2rem]`, `border-none`, `bg-card`)
- Titre discret "Cette semaine" avec total de pages
- 7 barres verticales (L M M J V S D), hauteur proportionnelle au max de la semaine
- Barres emeraude (`var(--p-primary)`), barre du jour en or (`var(--p-accent)`)
- Si objectif quotidien defini, ligne horizontale pointillee pour le seuil
- Masque si aucune donnee cette semaine

### Fichiers

| Fichier | Action |
|---|---|
| `src/components/planificateur/WeeklyMiniChart.tsx` | Creer — graphique 7 jours en barres CSS |
| `src/pages/PlanificateurPage.tsx` | Modifier — inserer `<WeeklyMiniChart>` entre ReadingSlider et ReadingHistory |

### Donnees passees au composant
```tsx
<WeeklyMiniChart
  weekProgress={weekProgress}
  targetPages={activeGoal?.target_value || 0}
/>
```

Le composant genere les 7 jours de la semaine, mappe les entrees `weekProgress` par date, et affiche les barres proportionnelles.

