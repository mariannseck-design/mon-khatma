

## Problème

Quand l'utilisateur ouvre le Mushaf (nouvel onglet), l'onglet Hifz passe en arrière-plan. Le navigateur suspend parfois l'audio, et le `visibilitychange` handler détecte `audio.paused` → il met `isPlaying = false`, ce qui tue l'état de lecture. Au retour, l'audio est coupé.

## Solution

### Fichier : `src/components/hifz/HifzStepImpregnationTajweed.tsx`

**Modifier le `visibilitychange` handler (lignes 130-143)** pour ne plus couper automatiquement l'audio au retour. Au lieu de ça, resynchroniser l'UI avec l'état réel :

- Si l'audio joue encore → garder `isPlaying = true` (ne rien casser)
- Si l'audio est vraiment arrêté (ended) → mettre à jour l'UI
- Si l'audio est juste en pause (suspension navigateur) → tenter de reprendre la lecture (`audio.play()`)

```tsx
useEffect(() => {
  const handler = () => {
    if (document.visibilityState === 'visible') {
      const audio = audioRef.current;
      const actuallyPlaying = audio && !audio.paused && !audio.ended;
      if (actuallyPlaying) {
        // Audio still playing — sync UI
        isPlayingRef.current = true;
        setIsPlaying(true);
      } else if (audio && audio.paused && !audio.ended && isPlayingRef.current) {
        // Browser suspended audio — try to resume
        audio.play().catch(() => {
          isPlayingRef.current = false;
          setIsPlaying(false);
          setCurrentAyahIndex(-1);
        });
      } else if (!audio || audio.ended) {
        isPlayingRef.current = false;
        setIsPlaying(false);
        setCurrentAyahIndex(-1);
      }
    }
  };
  document.addEventListener('visibilitychange', handler);
  return () => document.removeEventListener('visibilitychange', handler);
}, []);
```

Un seul fichier modifié, ~15 lignes changées.

