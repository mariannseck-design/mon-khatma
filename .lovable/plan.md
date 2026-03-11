

## Corriger le blocage du scroll sur les pages Hifz

### Probleme

Le composant `HifzMushafImage` utilise la classe CSS `touch-none` sur son conteneur d'image. Cette classe desactive **tous** les gestes tactiles (scroll, zoom natif, etc.) sur toute la zone de l'image. Comme l'image occupe une grande partie de l'ecran, l'utilisateur ne peut plus scroller la page du tout.

De plus, les handlers `handleTouchStart` et `handleTouchMove` appellent `e.preventDefault()` meme pour des gestes a un seul doigt quand le zoom est actif, ce qui bloque aussi le scroll.

### Solution

1. **Remplacer `touch-none` par `touch-pan-y`** quand le zoom n'est pas actif (scale <= 1). Cela permet le scroll vertical normal tout en capturant le pinch-to-zoom a 2 doigts.
2. **Appliquer `touch-none` uniquement quand le zoom est actif** (scale > 1), car dans ce cas le pan interne est necessaire.
3. **Ne pas appeler `e.preventDefault()` sur les gestes a 1 doigt quand le zoom n'est pas actif**, pour laisser le scroll natif fonctionner.

### Fichier modifie : `src/components/hifz/HifzMushafImage.tsx`

- Ligne 202 : classe dynamique `touch-none` vs `touch-pan-y` selon `scale > 1`
- Ligne 88-94 : ne capturer le pan a 1 doigt que si `scale > 1` (deja fait mais le `touch-none` bloquait quand meme)

