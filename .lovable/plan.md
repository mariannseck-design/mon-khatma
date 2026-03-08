

## Plan : Afficher le vrai nombre de versets mémorisés

### Problème
`periodProgress` est calculé en divisant les versets par 15 (pour avoir des pages), puis l'affichage re-multiplie par 15 pour retrouver les versets → l'arrondi fausse le résultat.

### Solution
Stocker le nombre exact de versets dans un state séparé `periodVerses`, et l'utiliser directement dans l'affichage.

### Changements dans `src/pages/HifzSuiviPage.tsx`

1. Ajouter un state `periodVerses` (nombre exact de versets complétés dans la période)
2. Dans `loadData`, après le calcul de `versesCompleted`, faire `setPeriodVerses(versesCompleted)` 
3. Dans le JSX ligne 272-274, remplacer `Math.round(periodProgress * 15)` par `periodVerses`

