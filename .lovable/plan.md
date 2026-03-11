

## Problème : les anciennes mémorisations apparaissent dans Ar-Rabt au lieu de Consolidation

### Cause racine

Dans `injectMemorizedVerses` (hifzUtils.ts), les items **solides** (`category === 'solid'`) reçoivent `memorized_at: now.toISOString()` (ligne 158). Avec la nouvelle règle des 30 jours (`memorized_at >= cutoff` → Rabt), ces anciens acquis sont traités comme récents et apparaissent dans Ar-Rabt pendant 30 jours — ce qui est incorrect.

### Correction

**Fichier : `src/lib/hifzUtils.ts`** — Dans la branche `solid` de `injectMemorizedVerses` (lignes 167-183) :

Remplacer `memorized_at: now.toISOString()` par une date antérieure de 31 jours ou plus, pour que ces items atterrissent directement dans la zone Consolidation :

```ts
// Pour les acquis solides, dater memorized_at à 31 jours dans le passé
const solidDate = new Date(now);
solidDate.setDate(solidDate.getDate() - 31);
// ...
memorized_at: solidDate.toISOString(),
```

Pour les items `recent`, ajuster `memorized_at` en fonction de `daysAlreadyDone` (au lieu de `now`) afin que la barre de maturité Ar-Rabt reflète les jours déjà faits :

```ts
// memorized_at = aujourd'hui - daysAlreadyDone
const recentDate = new Date(now);
recentDate.setDate(recentDate.getDate() - daysAlreadyDone);
memorized_at: recentDate.toISOString(),
```

### Résultat
- Anciennes mémorisations → `memorized_at` vieux de 31+ jours → directement dans Consolidation (SM-2)
- Nouvelles mémorisations → `memorized_at` = aujourd'hui - jours déjà faits → dans Ar-Rabt avec la bonne progression

