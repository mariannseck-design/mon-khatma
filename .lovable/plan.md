

## Ajouter le double-tap zoom sur l'image du Mushaf

### Fonctionnement

- **Double-tap** sur l'image : zoom a 2x centre sur le point tape
- **Double-tap quand zoome** : retour a 1x (reset)
- Detection via delai entre deux taps successifs (< 300ms)

### Fichier modifie : `src/components/hifz/HifzMushafImage.tsx`

1. Ajouter un `lastTapRef` pour stocker le timestamp du dernier tap
2. Dans `handleTouchEnd`, detecter si 2 taps rapides (< 300ms) avec 1 seul doigt
3. Si double-tap detecte :
   - Si `scale <= 1` : zoomer a 2x en centrant sur le point tape
   - Si `scale > 1` : reset a 1x
4. Stocker la position du dernier touch dans `lastTapPosRef` pour centrer le zoom

