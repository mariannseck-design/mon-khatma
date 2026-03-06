

# Correction de la transition de page du Mushaf

## Problème
La transition actuelle utilise une animation de glissement horizontal (`x: '100%'` → `x: 0`) avec `AnimatePresence` et `drag="x"`, ce qui donne un effet de mouvement perturbant — la page "bouge" visuellement pendant la navigation.

## Solution
Remplacer l'animation de glissement horizontal par un simple fondu enchaîné (fade), sans mouvement latéral. Cela donne une transition douce et stable, comme si on tournait une page sans que rien ne glisse.

## Modifications dans `src/pages/QuranReaderPage.tsx`

1. **`slideVariants`** : remplacer le déplacement `x` par un simple changement d'opacité :
   - `enter` → `{ opacity: 0 }` (pas de `x`)
   - `center` → `{ opacity: 1 }`
   - `exit` → `{ opacity: 0 }`

2. **Supprimer le drag horizontal** sur les deux `motion.div` (mode texte et mode image) :
   - Retirer `drag="x"`, `dragConstraints`, `dragElastic`, `onDragEnd`
   - Garder le swipe via `useSwipeNavigation` ou ajouter un gestionnaire touch simple pour détecter les swipes sans déplacer visuellement le contenu

3. **Gestion du swipe sans drag visuel** : remplacer le `drag` de framer-motion par un détecteur tactile (`onTouchStart`/`onTouchEnd`) qui déclenche `goNext`/`goPrev` sans bouger la page.

4. **Transition** : réduire la durée à `0.2s` pour un fondu rapide et naturel.

## Fichier impacté
- `src/pages/QuranReaderPage.tsx`

