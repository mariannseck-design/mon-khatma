

## Plan : Nouvelle disposition en 2 cercles pour Programme & Révision + masquer le 6236

### Concept

Remplacer les deux cartes rectangulaires (Programme du jour + Révision du jour) par **deux cercles côte à côte** dans un `grid-cols-2`. Chaque cercle est cliquable et redirige vers la page correspondante.

### Changements dans `src/pages/HifzSuiviPage.tsx`

**1. Remplacer la section "SPLIT DASHBOARD" (lignes 296-398)** par deux cercles côte à côte :

```text
┌─────────────────────────────────┐
│  [🟢 Cercle]    [🟡 Cercle]    │
│  Programme       Révision       │
│  du jour         du jour        │
│                                 │
│  Sourate X       3 portions     │
│  v. 1→5          à réviser      │
│  ───────>        ───────>       │
└─────────────────────────────────┘
```

- Cercle gauche (vert, lien `/hifz`) : icone BookOpen, nom de sourate + versets
- Cercle droit (doré, lien `/muraja`) : icone RefreshCw, nombre de portions à réviser ou "Aucune"
- Chaque cercle = `div` rond avec border, gradient subtil, contenu centré

**2. Masquer le "/6236" dans CircularGauge (ligne 51-53)** :

Modifier le composant `CircularGauge` pour accepter un prop `hideMax` optionnel. Quand `hideMax` est true, ne pas afficher la ligne `/ {max}`. Passer `hideMax={true}` pour la jauge "Versets ancrés".

Alternativement, simplement retirer le texte `/ {max}` de la jauge des versets et afficher juste le nombre de versets ancrés.

### Détails techniques

- Les deux cercles utilisent `w-36 h-36 rounded-full` avec un fond card + border
- Contenu centré avec `flex flex-col items-center justify-center`
- Animation framer-motion identique (fade + slide up)
- Les liens restent les mêmes (`/hifz` et `/muraja`)

