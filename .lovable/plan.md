

# Afficher les versets Ar-Rabt pour les jours futurs

## Problème

`rabtVerses` dans `useMurajaData` filtre avec `< today`, donc les versets mémorisés aujourd'hui sont exclus. C'est correct pour aujourd'hui (J+1), mais quand on sélectionne un jour futur dans le calendrier, ces versets devraient apparaître car `liaison_start_date < jour_futur`.

Le code `getItemsForDay` utilise toujours `rabtVerses` (filtré pour aujourd'hui) quel que soit le jour sélectionné.

## Solution

**Fichier** : `src/pages/MurjaCalendarPage.tsx`

Dans `getItemsForDay`, calculer les versets rabt dynamiquement en fonction du `dayKey` sélectionné au lieu d'utiliser le `rabtVerses` pré-filtré :

```ts
const getItemsForDay = (dayKey: string) => {
  // Compute rabt for the specific day: memorized in last 30 days AND liaison_start_date < dayKey
  const rabt = allVerses
    .filter(v => v.memorized_at >= thirtyDaysCutoff && (v.liaison_start_date || v.memorized_at.split('T')[0]) < dayKey)
    .sort((a, b) => a.surah_number - b.surah_number || a.verse_start - b.verse_start);
  // ... rest unchanged
};
```

Même correction pour `dayIndicators` : remplacer `rabtVerses.length > 0` par un calcul par jour.

