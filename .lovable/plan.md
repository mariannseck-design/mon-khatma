

## Plan : Adapter le coeur aux couleurs de la page d'accueil

Remplacer les teintes rouges/roses du coeur par des teintes dorées (gold) cohérentes avec la palette émeraude/or de la page.

### Modification dans `FavoriteVersesSection.tsx`

**Icône conteneur (lignes 62-65)** : remplacer `rgba(239,68,68,...)` par des teintes dorées :
- background : `rgba(212,175,55,0.12)` → `rgba(212,175,55,0.06)`
- border : `rgba(212,175,55,0.25)`

**Icône Heart (ligne 67)** : remplacer `text-red-400` et `fill` rouge par du doré :
- couleur : `#d4af37`
- fill : `rgba(212,175,55,0.25)`

