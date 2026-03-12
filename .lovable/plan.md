

# Corriger la suggestion de reprise de mémorisation

## Problème

`findNextStartingPoint()` dans `hifzUtils.ts` ne consulte que la table `hifz_memorized_verses`. Si aucun verset n'est trouvé (sessions non terminées, données non sauvegardées), il retombe sur le verset 1 de Al-Fatiha.

Il faut aussi considérer les **sessions terminées** (`hifz_sessions` avec `completed_at` non null) comme source de progression.

## Plan

**Fichier : `src/lib/hifzUtils.ts` — fonction `findNextStartingPoint`**

1. Après la requête sur `hifz_memorized_verses`, ajouter une requête de fallback sur `hifz_sessions` :
   - Chercher les sessions complétées (`completed_at IS NOT NULL`) pour cet utilisateur
   - En extraire le `surah_number`, `start_verse`, `end_verse` les plus récents
   - Intégrer ces données dans la map `surahCoverage` (prendre le max de `verse_end` par sourate)

2. Cela garantit que même si l'upsert dans `hifz_memorized_verses` a échoué, la progression est prise en compte via les sessions terminées.

3. Le fallback final (sourate 1, verset 1) ne sera atteint que si l'utilisateur n'a réellement aucune donnée.

```text
findNextStartingPoint(userId)
  ├── Query hifz_memorized_verses → surahCoverage
  ├── Query hifz_sessions (completed) → merge into surahCoverage
  ├── Find first gap in SURAHS order
  └── Return { surahNumber, startVerse, endVerse }
```

Aucun autre fichier à modifier — `HifzConfig.tsx` appelle déjà `findNextStartingPoint` et applique le résultat.

