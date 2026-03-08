

## Plan : Diagramme d'activité plus précis

### Problème
Le diagramme compte uniquement le **nombre de sessions** par jour (1 session = 1 barre). Ce n'est pas précis : une session de 3 versets et une de 20 versets ont le même poids.

### Solution
Compter le **nombre de versets** travaillés par jour (mémorisation + révision) au lieu du nombre de sessions.

### Modification : `src/pages/HifzSuiviPage.tsx`

1. **Requêtes enrichies** (lignes 112-113) : récupérer `start_verse, end_verse, created_at` pour `hifz_sessions` et `surah_number, verse_start, verse_end, created_at` pour `muraja_sessions` (au lieu de juste `created_at`)

2. **Calcul par versets** (lignes 149-167) : au lieu d'incrémenter `+1` par session, additionner `(end_verse - start_verse + 1)` pour chaque session du jour

3. **Axe Y visible** : afficher l'axe Y avec le nombre de versets pour plus de lisibilité

4. **Tooltip** : ajouter un Tooltip Recharts pour afficher "X versets" au survol/tap

5. **Label** : mettre à jour le titre ou ajouter un sous-titre "versets travaillés" pour clarifier l'unité

### Fichier modifié
- `src/pages/HifzSuiviPage.tsx`

