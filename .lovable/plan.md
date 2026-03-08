

## Ajouter le swipe horizontal entre les duas dans DouasSession

### Changement

**`src/components/douas/DouasSession.tsx`** :
- Ajouter `touchStartRef` pour stocker les coordonnées du touch initial
- Ajouter `onTouchStart` / `onTouchEnd` sur le conteneur principal (ligne 63)
- Swipe gauche → dua suivante, swipe droite → dua précédente
- Seuil de 50px, uniquement si le mouvement horizontal est dominant
- Le `key={currentIndex}` sur le DhikrCounter assure déjà le reset automatique du compteur

Même logique que ce qui a été fait pour `SourcesSession.tsx`.

