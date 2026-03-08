

## Plan : Encapsuler "Mes Versets Favoris" dans une carte scrollable

Le composant `FavoriteVersesSection` est déjà stylé avec un fond et une bordure, mais il manque une structure de carte avec hauteur limitée et scroll interne pour gérer plusieurs versets proprement.

### Modification

**`src/components/favoris/FavoriteVersesSection.tsx`** :
- Ajouter un `ScrollArea` (de shadcn) autour de la liste des versets avec une hauteur max (~300px)
- Garder le header (titre + compteur) toujours visible en haut
- La liste de versets scrolle à l'intérieur de la carte sans que la carte elle-même ne grossisse indéfiniment
- Le bouton "Voir tout / Voir moins" est remplacé par le scroll natif dans la ScrollArea

### Résultat visuel

```text
┌─────────────────────────────┐
│ ❤️ Mes Versets Favoris      │
│    3 versets sauvegardés    │
├─────────────────────────────┤
│ ┌─────────────────────┐  ▲ │
│ │ Al-Baqara : 255     │  │ │
│ │ آية الكرسي...       │  │ │
│ └─────────────────────┘  │ │
│ ┌─────────────────────┐  │ │
│ │ Al-Mulk : 1         │  ░ │
│ │ تبارك الذي...       │  │ │
│ └─────────────────────┘  │ │
│                          ▼ │
└─────────────────────────────┘
```

### Fichier modifié
- `src/components/favoris/FavoriteVersesSection.tsx` — ajouter `ScrollArea` avec `max-h-[350px]`, retirer le système expanded/collapsed

