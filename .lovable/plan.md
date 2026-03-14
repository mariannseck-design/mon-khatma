

## Corriger la reprise audio après pause dans les étapes Hifz

### Problème
Quand l'utilisateur met pause puis relance la lecture, l'audio reprend depuis le début du verset au lieu de continuer là où il s'était arrêté. Cela affecte 3 composants :

1. **StepImpregnation** — `toggleAudio()` appelle `playLoop(0)` à la reprise → redémarre au verset 1
2. **StepImmersion** — `stopAudio()` détruit l'élément audio (`audioRef.current = null`), donc `playSingleVerse`/`playSequence` recréent un nouvel `Audio` depuis le début
3. **MouradPhase2** — `playAudio()` crée systématiquement de nouveaux objets `Audio`

### Solution
Pour chaque composant, au lieu de détruire l'audio au pause, **conserver l'élément `HTMLAudioElement` et sa position** :

- **Pause** : appeler `audio.pause()` sans nullifier `audioRef.current`
- **Reprise** : si `audioRef.current` existe et n'est pas terminé, appeler `audio.play()` pour reprendre ; sinon démarrer normalement

### Fichiers modifiés

1. **`src/components/hifz/istiqamah/StepImpregnation.tsx`**
   - `toggleAudio()` : sur reprise, vérifier si `audioRef.current` a un `src` et `currentTime > 0`, et reprendre avec `audio.play()` au lieu de `playLoop(0)`. Conserver `currentAyahIndex` au pause au lieu de le remettre à -1.

2. **`src/components/hifz/istiqamah/StepImmersion.tsx`**
   - `stopAudio()` : ne plus nullifier `audioRef.current`, seulement `audio.pause()` et `isPlayingRef = false`
   - `handlePlay()` : si `audioRef.current` existe et est pausé (pas ended), reprendre avec `audio.play()` ; sinon lancer `playSingleVerse`/`playSequence` normalement
   - `playSingleVerse` / `playSequence` : vérifier que l'audio n'est pas déjà chargé avant de créer un nouvel objet

3. **`src/components/mourad/MouradPhase2.tsx`**
   - Même pattern : sur pause garder l'audio, sur reprise appeler `audio.play()` si l'élément existe encore

### Détail technique
Ajouter un ref `pausedRef` (boolean) pour distinguer "pause utilisateur" de "fin naturelle". Quand `pausedRef.current === true` et `audioRef.current` existe :
- Reprendre avec `audioRef.current.play()`
- Remettre `pausedRef.current = false`

Quand l'audio se termine naturellement (`onended`), passer au verset suivant comme avant.

