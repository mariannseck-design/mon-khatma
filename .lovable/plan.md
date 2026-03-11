

## Compacter la section Consolidation et harmoniser les tailles

### Problème
1. Les items de tour validés restent affichés en taille pleine (contrairement au rabt qui les regroupe en badges compacts)
2. Dans le MurajaChecklist (section tour vide), les "Prochaine révision" sont affichées en texte `11px` minimaliste, alors que dans le MurajaCountdown les prochaines révisions sont des cartes stylisées — pas de cohérence de taille

### Corrections — `src/components/muraja/MurajaChecklist.tsx`

1. **Appliquer le même regroupement compact aux items tour validés** (lignes 204-206) : Étendre la logique `checkedItems` / `uncheckedItems` à la section `tour` aussi. Les items validés seront affichés comme des badges compacts (sourate + page) dans un bloc résumé vert (même pattern que le rabt doré, mais en émeraude).

2. **Harmoniser l'affichage des "Prochaine révision"** (lignes 142-159 et 405-430) : Remplacer le texte compact par des mini-cartes avec la même structure que le MurajaCountdown — icône + sourate + versets + page + date, dans un layout flex horizontal avec fond coloré léger. Utiliser le même style pour les deux occurrences (section vide et section après validation complète).

### Fichier modifié
- `src/components/muraja/MurajaChecklist.tsx`

