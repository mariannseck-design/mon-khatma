

## Correction du compteur sur les jours futurs

**Problème** : `checkedIds` stocke les IDs cochés aujourd'hui dans localStorage. Comme les items Ar-Rabt sont les mêmes chaque jour, quand on regarde un jour futur, le compteur affiche "9/10" car les mêmes IDs sont trouvés dans `checkedIds`.

**Solution** : Sur les jours futurs (`isFutureDay`), forcer `totalDone = 0` car aucune révision ne peut être faite à l'avance.

**Fichier** : `src/pages/MurjaCalendarPage.tsx`, ligne 108

Remplacer :
```tsx
const totalDone = doneRabt.length + doneTour.length;
```
Par :
```tsx
const totalDone = isFutureDay ? 0 : doneRabt.length + doneTour.length;
```

Cela garantit que le compteur affiche "0/X terminés" pour les jours à venir.

