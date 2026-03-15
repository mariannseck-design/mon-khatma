

## Plan : Éliminer le double audio avec un compteur de génération

### Cause racine

Le problème n'est pas dans `AudioContext.registerAudio` (qui fonctionne correctement). Le problème est dans `HifzStep3Memorisation` :

- Quand l'utilisateur quitte la page, la chaîne audio en arrière-plan continue via `setTimeout` → `playNextAyah(0)`, car `isPlayingRef.current` reste `true`.
- Quand l'utilisateur revient et clique "Écouter", `toggleAudioHelp` met `isPlayingRef.current = true` et lance `playNextAyah(0)`.
- **Mais l'ancienne chaîne tourne toujours** et voit aussi `isPlayingRef.current === true`. Les deux chaînes créent chacune des `new Audio()` → double audio.

`isPlayingRef` est un simple booléen : il ne distingue pas l'ancienne chaîne de la nouvelle.

### Solution : compteur de génération

Ajouter un `generationRef = useRef(0)`. À chaque nouveau lancement audio, incrémenter la génération. Chaque appel de `playNextAyah` capture la génération courante et vérifie qu'elle n'a pas changé avant de continuer.

### Modification unique : `src/components/hifz/HifzStep3Memorisation.tsx`

1. **Ajouter** `const generationRef = useRef(0);` à côté des autres refs

2. **Dans `toggleAudioHelp`** : avant de lancer `playNextAyah(0)`, incrémenter `generationRef.current++` et aussi appeler `stop()` du contexte global pour tuer l'audio en arrière-plan proprement

3. **Dans `playNextAyah`** : capturer `const gen = generationRef.current` au début, et à chaque point de continuation (les `onended`, `setTimeout`), vérifier `if (generationRef.current !== gen) return;`

```ts
// Ligne ~271
const playNextAyah = useCallback((idx: number, gen: number) => {
  if (generationRef.current !== gen) return;  // ancienne chaîne → stop
  if (!isPlayingRef.current && idx > 0) return;
  if (idx >= ayahAudiosRef.current.length) {
    // ... compteur logic inchangée ...
    setTimeout(() => {
      if (isPlayingRef.current && generationRef.current === gen) playNextAyah(0, gen);
    }, 600);
    return;
  }
  const audio = new Audio(ayahAudiosRef.current[idx].audio);
  audioRef.current = audio;
  registerRef.current(audio, { ... });
  audio.onended = () => {
    if (isPlayingRef.current && generationRef.current === gen) playNextAyah(idx + 1, gen);
  };
  audio.onerror = () => {
    if (isPlayingRef.current && generationRef.current === gen) playNextAyah(idx + 1, gen);
  };
  audio.play().catch(() => { ... });
}, [tikrarTarget, storageKey]);

// Ligne ~302
const toggleAudioHelp = () => {
  if (isPlayingRef.current) {
    isPlayingRef.current = false;
    audioRef.current?.pause();
    setIsPlaying(false);
  } else if (ayahAudiosRef.current.length > 0) {
    generationRef.current++;           // invalide l'ancienne chaîne
    stopGlobal();                       // tue l'audio du contexte global
    isPlayingRef.current = true;
    setIsPlaying(true);
    playNextAyah(0, generationRef.current);
  }
};
```

4. **Import** : ajouter `stop` depuis `useGlobalAudio()` (renommé en `stopGlobal` pour éviter confusion)

Aucun autre fichier à modifier. La génération garantit qu'une seule chaîne audio est active à la fois.

