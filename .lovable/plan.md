

## Aligner le compteur "Jour X/30" sur `memorized_at`

### Problème
Le compteur "Jour X/30" et la barre de progression dans la section Ar-Rabt utilisent `liaison_start_date` via `getLiaisonDaysPassed()`. Or, la logique de tri Rabt vs Consolidation repose désormais sur `memorized_at`. Pour les items récents injectés via le diagnostic, `liaison_start_date` et `memorized_at` sont identiques (today - daysAlreadyDone), donc ça fonctionne. Mais si `liaison_start_date` est null (cas d'items ajoutés autrement), le jour affiche 0/30.

### Correction — `src/components/muraja/MurajaChecklist.tsx`

1. **Modifier `getLiaisonDaysPassed`** pour accepter `memorized_at` en priorité, avec fallback sur `liaison_start_date` :
   ```ts
   function getLiaisonDaysPassed(memorizedAt?: string | null, startDate?: string | null): number {
     const dateStr = memorizedAt || startDate;
     if (!dateStr) return 0;
     const start = new Date(dateStr);
     const now = new Date();
     return Math.min(30, Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000)));
   }
   ```

2. **Mettre à jour les appels** (lignes 124, 327) pour passer `item.memorized_at` :
   ```ts
   const daysPassed = getLiaisonDaysPassed(item.memorized_at, item.liaison_start_date);
   ```

3. **Condition de la barre de progression** (ligne 398) : remplacer `item.liaison_start_date` par `item.memorized_at || item.liaison_start_date` pour qu'elle s'affiche même si `liaison_start_date` est null.

### Résultat
Le "Jour X/30" reflète correctement les jours déjà passés depuis la mémorisation, y compris les jours déclarés lors du diagnostic d'inscription.

