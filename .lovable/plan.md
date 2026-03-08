

## Plan : Skip admin fiable + écoute minimum réduite à 1

### Problème identifié
Le `DevSkipButton` existe déjà (ligne 408-412 de `HifzPage.tsx`) et appelle `updateStep(step + 1)`. Il devrait fonctionner si `isDevMode` est actif. Deux problèmes possibles :
1. Le bouton est positionné en `fixed bottom-20 right-4` — il peut être masqué par d'autres éléments ou le conteneur avec `overflow: hidden`
2. L'utilisateur n'a peut-être pas activé le "Mode Testeur" dans la page Profil

### Modifications prévues

**`src/components/hifz/DevSkipButton.tsx`** :
- Augmenter le `z-index` à `z-[9999]` pour garantir la visibilité
- Positionner en `bottom-4` au lieu de `bottom-20` pour éviter les conflits avec la navigation

**`src/components/hifz/HifzStep2Impregnation.tsx`** :
- Changer le seuil recommandé de 3 à 1 écoute (le bouton "Passer" apparaît déjà à 1, mais le texte et le style suggèrent 3 comme minimum)
- Afficher le bouton "Passer à la mémorisation" dès la 1ère écoute avec le style plein (gold)
- Garder un compteur visuel de 3 écoutes comme objectif recommandé (pas obligatoire)
- Supprimer le message "L'écoute c'est 3 fois minimum" qui bloque psychologiquement

**`src/pages/HifzPage.tsx`** :
- S'assurer que le `DevSkipButton` est rendu en dehors du conteneur avec le style `GRADIENT_STYLE` pour éviter les problèmes de clipping

