

## Plan : Découpage automatique des portions au chargement

### Probleme

Le bouton "Recalculer mes portions" oblige l'utilisateur a agir manuellement. Les portions devraient etre automatiquement decoupees par page du Mushaf sans intervention.

### Solution

Au chargement des donnees dans `fetchVerses`, detecter automatiquement les blocs qui couvrent plus d'une page du Mushaf et les redecouper en base. Supprimer ensuite le bouton "Recalculer mes portions" devenu inutile.

### Changements

**`src/pages/MurjaPage.tsx`**

1. Dans le `useEffect` / `fetchVerses` (lignes 155-173), apres avoir charge les versets, ajouter une verification automatique :
   - Pour chaque verset, appeler `splitBlockByPages` et comparer le resultat
   - Si un bloc produit plus d'un sous-bloc, supprimer l'ancien et inserer les nouveaux (en preservant les parametres SM-2)
   - Ne faire cette operation que si des blocs multi-pages sont detectes (pas de requete inutile)

2. Supprimer la fonction `handleRecalculate` (lignes 91-153) et le state `recalculating` (ligne 89)

3. Supprimer le bouton "Recalculer mes portions" du JSX

4. Supprimer l'import de `RotateCcw` si plus utilise

