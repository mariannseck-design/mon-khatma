

## Corriger le compteur "Révision espacée"

### Problème
Le badge affiche `tourVerses.length` = nombre de portions dues aujourd'hui **non encore révisées**. Après validation, ce nombre tombe à 0, ce qui est trompeur. L'utilisateur s'attend à voir le nombre total de portions en phase de consolidation (ou au minimum dues + révisées aujourd'hui).

### Correction — `src/pages/MurjaPage.tsx`

Remplacer `{tourVerses.length}` (ligne 607) par un compteur qui reflète le **total des portions en consolidation aujourd'hui** : portions dues non révisées + portions révisées aujourd'hui.

```
tourVerses.length + todayReviewedTourItems.length
```

`todayReviewedTourItems` existe déjà (ligne 161) et contient exactement les items tour révisés aujourd'hui. La somme des deux donne le nombre total de portions de consolidation traitées ou à traiter dans la journée.

### Fichier modifié
- `src/pages/MurjaPage.tsx` — ligne 607, remplacer `{tourVerses.length}` par `{tourVerses.length + todayReviewedTourItems.length}`

