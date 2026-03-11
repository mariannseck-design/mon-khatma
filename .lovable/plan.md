

## Deux améliorations pour la section Ar-Rabt

### 1. Tri par numéro de page (ordre croissant)
**`src/components/muraja/MurajaChecklist.tsx`** :
- Trier les `items` par page Mushaf via `pageMap` avant le rendu. Une fois les pages résolues, créer une copie triée : les items avec page connue sont triés par page croissante, les autres restent à la fin.
- Cela permet de réciter page 11, 12, 13 avant page 16, quel que soit le jour de liaison.

### 2. Couleur distincte pour les toutes dernières mémorisations (Jour 1-7/30)
**`src/components/muraja/MurajaChecklist.tsx`** :
- Pour les items rabt dont `daysPassed <= 7` (premiere semaine de liaison), utiliser une bordure gauche et un bouton d'une couleur différente : un bleu-violet doux (`#7C3AED`) au lieu du doré, signalant visuellement "memorisation de cette semaine".
- Les items plus anciens (jour 8-30) gardent le doré moutarde habituel.
- Le badge page et l'icone BookOpen suivent la meme logique de couleur.

### Fichier modifie
- `src/components/muraja/MurajaChecklist.tsx` uniquement

