

## Ajouter les versets mémorisés à la heatmap (visible uniquement au clic)

### Approche

Les données de `hifz_memorized_verses.memorized_at` seront chargées en parallèle des sessions existantes, mais ne seront **pas comptées dans le `total`** qui détermine la couleur des carrés. Elles ne seront visibles que dans le tooltip quand on clique/survole un carré.

### Modifications — `src/components/hifz/HifzActivityHeatmap.tsx`

1. **Interface `DayActivity`** : Ajouter un champ `versesAdded: number` pour stocker le nombre de blocs de versets ajoutés ce jour-là.

2. **Requête** : Ajouter une 3e requête en parallèle sur `hifz_memorized_verses` pour récupérer `memorized_at` (groupé par date). Ne pas l'ajouter au `total` — juste stocker le compte dans `versesAdded`.

3. **Tooltip** : Afficher `versesAdded` dans le tooltip existant quand > 0, ex: `« 5 versets ajoutés »`, après les infos mémo/révision existantes.

4. **Couleur des carrés** : Inchangée — toujours basée sur `total` (sessions uniquement). Les versets ajoutés sont une info bonus visible au tap/hover.

Un seul fichier modifié, aucun impact visuel sur la grille elle-même.

