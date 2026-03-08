

## Plan : Masquer la section Émotions derrière un clic

Actuellement la section humeur/gratitude/moments est toujours visible en bas de page. Elle doit être cachée par défaut et s'afficher uniquement quand on clique sur la carte "Mes Émotions".

### Modification

**`src/pages/EmotionsPage.tsx`** :
- Ajouter un state `showEmotions` (boolean, default `false`)
- Le bouton "Mes Émotions" dans la grille toggle `showEmotions` au lieu de `scrollIntoView`
- Envelopper toute la section émotions (`ref={moodSectionRef}`, lignes 288-430) dans un `AnimatePresence` + `motion.div` conditionné par `showEmotions`
- Quand `showEmotions` passe à `true`, scroll automatiquement vers la section
- Animation d'entrée (fade + slide down) et de sortie (fade + slide up)

### Résultat
- Par défaut : seule la grille des 10 cartes est visible
- Clic sur "Mes Émotions" : la section apparaît en dessous avec animation
- Re-clic : la section se referme

