

## Bug : Les révisions en retard ne s'affichent pas

### Cause
Dans `getItemsForDay`, le filtre utilise `next_review_date === dayKey` (correspondance exacte). Les items en retard (dont la `next_review_date` est antérieure à aujourd'hui) ne correspondent à aucun jour du calendrier et sont donc invisibles.

Le hook `useMurajaData` utilise `next_review_date <= today` pour inclure les items en retard, mais la page calendrier ne le fait pas.

### Correction — `src/pages/MurjaCalendarPage.tsx`

1. **`getItemsForDay`** : Pour le jour "aujourd'hui", inclure tous les items de consolidation dont `next_review_date <= todayKey` (en retard + du jour). Pour les autres jours, garder le filtre exact `=== dayKey`.

2. **`dayIndicators`** : Même logique — le point vert pour aujourd'hui doit aussi refléter les items en retard.

### Changement concret

```typescript
// Ligne 67-71, remplacer :
const getItemsForDay = (dayKey: string) => {
  const rabt = rabtVerses;
  const tour = dayKey === todayKey
    ? allConsolidation.filter(v => v.next_review_date <= dayKey)
    : allConsolidation.filter(v => v.next_review_date === dayKey);
  return { rabt, tour };
};
```

Et dans `dayIndicators` :
```typescript
hasTour: day.key === todayKey
  ? allConsolidation.some(v => v.next_review_date <= day.key)
  : allConsolidation.some(v => v.next_review_date === day.key),
```

