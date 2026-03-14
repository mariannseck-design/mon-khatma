

## Corriger le bouton "Nouvelle session" quand on est en Phase B

### Problème
Quand l'utilisateur arrive via `/hifz?phase=B` et clique "Recommencer une nouvelle session", le système remet tout à zéro et affiche la configuration (étape 0 = Phase A). Or, Phase B devrait rester indépendante de Phase A.

### Solution
Adapter `handleRestart` pour tenir compte du paramètre `phase` :
- Si `phase=B` : au lieu de tout effacer, conserver la session existante (sourate/versets) mais repositionner au step 2 (début Phase B). Le bouton affichera "🔄 Recommencer l'Étape B".
- Si `phase=A` ou pas de phase : comportement actuel inchangé (reset complet vers la config).

### Fichier modifié

**`src/pages/HifzPage.tsx`** :
1. **`handleRestart`** (~ligne 269) : si `phaseParam === 'B'` et qu'une `pendingResume` existe, réutiliser la même session mais forcer `step = 2` au lieu de tout effacer.
2. **Label du bouton** (~ligne 518) : afficher "Recommencer l'Étape B" si `phaseParam === 'B'`, sinon le label actuel.

