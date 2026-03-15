

## Plan : Fix de la boucle audio qui s'arrête après 1-2 cycles

### Cause racine

`selfInitiatedRef` n'est mis à `true` qu'une seule fois dans `togglePlay()`. Quand le cycle recommence (ayah 0 du cycle suivant), `playNextAyah` appelle `registerAudio` sur un nouveau `Audio` — le `AudioContext` stoppe l'ancien audio, ce qui peut brièvement passer `globalStatus` à `'idle'`. Le `useEffect` de synchronisation voit `idle` + `isPlayingRef === true`, mais `selfInitiatedRef` est déjà à `false` → il tue la session. Résultat : l'audio s'arrête après 1-2 tours.

### Solution — `HifzStepImpregnationTajweed.tsx`

Ajouter `selfInitiatedRef.current = true` dans `playNextAyah` juste avant chaque appel à `registerRef.current(...)` (ligne ~244). Ainsi, toute transition `idle` transitoire provoquée par le remplacement d'audio interne sera ignorée par le sync `useEffect`.

Changement : 1 ligne ajoutée dans `playNextAyah`, avant `registerRef.current(audio, ...)`.

