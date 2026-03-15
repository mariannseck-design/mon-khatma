

## Rendre le texte Mushaf QCF V2 responsive

### Problème
Le `fontSize: 28px` fixe fait déborder le texte horizontalement sur mobile (390px). Les polices QCF V2 ont des glyphes larges.

### Solution
Utiliser `transform: scale()` sur le conteneur des lignes pour faire tenir le contenu dans la largeur disponible. C'est la méthode la plus fiable car les polices QCF V2 sont des glyphes fixes — `clamp()` sur font-size risque de casser le rendu calligraphique.

### Modifications — `src/components/quran/QuranMushafView.tsx`

1. **Conteneur principal** : ajouter `overflow-x: hidden` et un padding horizontal de `px-3` (12px de chaque côté)

2. **Chaque ligne de texte** : mesurer la largeur naturelle du contenu et appliquer un `transform: scaleX()` si elle dépasse la largeur du conteneur. Concrètement :
   - Wrapper div autour de toutes les lignes avec `ref` pour mesurer la largeur disponible
   - Chaque ligne utilise un `ref` callback + `ResizeObserver` ou `useEffect` pour calculer `scale = min(1, containerWidth / lineNaturalWidth)`
   - Appliquer `transform: scale(${scale})` avec `transform-origin: center top`

3. **Approche simplifiée** (plus performante) : au lieu de mesurer chaque ligne individuellement, utiliser une seule mesure du conteneur et un `fontSize` responsive via `clamp(18px, 5.5vw, 28px)` — les glyphes QCF V2 s'adaptent bien au scaling proportionnel car chaque mot est un glyphe unique.

**Approche retenue** : `fontSize: clamp(18px, 5.8vw, 28px)` sur tous les mots. Simple, performant, pas de JS supplémentaire. Le `5.8vw` sur un écran de 390px donne ~22.6px, ce qui devrait tenir en largeur.

### Changements concrets

- Ligne 218 : ajouter `overflow-x-hidden` à la className du conteneur
- Ligne 223 : changer `px-2` en `px-3`
- Ligne 308 : remplacer `fontSize: isEnd ? '28px' : '28px'` par `fontSize: 'clamp(18px, 5.8vw, 28px)'`

