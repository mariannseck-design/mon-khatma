

## Corriger la page Mushaf inexacte dans les étapes Hifz

### Problème
Les étapes 2 (Imprégnation) et 3 (Tikrar) calculent la page Mushaf avec une **interpolation linéaire approximative** (`getApproxVersePage`). Cette approximation peut être décalée de 1-2 pages, ce qui affiche le mauvais verset sur l'image (ex: verset 115 au lieu de 116).

### Solution
Utiliser les données **exactes** du fichier `quran-uthmani.json` qui contient le champ `page` pour chaque verset.

### Modifications

**1. `src/lib/quranData.ts`** — Ajouter une fonction `getExactVersePage(surahNumber, verseNumber)` :
- Cherche le verset dans le `surahIndex` (déjà en cache)
- Retourne la page exacte depuis les données JSON
- Nécessite d'ajouter le champ `page` à l'interface `LocalAyah` (actuellement omis lors du mapping)

**2. `src/lib/quranData.ts`** — Modifier `buildIndexes()` :
- Inclure `page` dans l'objet `LocalAyah` mappé (ligne 41-45) : ajouter `page: ayah.page`

**3. `src/components/hifz/HifzStep2Impregnation.tsx`** (ligne 74) :
- Remplacer `getApproxVersePage(surahNumber, startVerse)` par un appel à `getExactVersePage(surahNumber, startVerse)` 
- Gérer l'aspect asynchrone (la fonction doit charger le JSON si pas encore en cache)

**4. `src/components/hifz/HifzStep3Memorisation.tsx`** (lignes 144-152) :
- Remplacer le calcul approximatif `mushafPage` par `getExactVersePage`
- Même adaptation asynchrone

### Détail technique
L'interface `LocalAyah` sera étendue avec un champ `page: number` optionnel. La nouvelle fonction :
```typescript
export async function getExactVersePage(surahNumber: number, verseNumber: number): Promise<number> {
  await ensureLoaded();
  const ayah = surahIndex!.get(surahNumber)?.get(verseNumber);
  return ayah?.page ?? getApproxVersePage(surahNumber, verseNumber); // fallback
}
```

