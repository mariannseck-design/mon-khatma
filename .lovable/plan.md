

## Problème

Deux bugs après l'ouverture du Mushaf dans un nouvel onglet :

1. **Double audio** : quand l'utilisateur revient sur l'onglet et clique le bouton audio, `toggleAudio` entre dans la branche "start" (car `isPlayingRef` est devenu `false` en arrière-plan suite à un `play().catch()`), mais l'ancien élément audio continue de jouer en réalité. `stopGlobal()` tue la ref du contexte global, mais si le `onEnded` timeout (2s) l'a déjà nettoyée, `stopGlobal()` ne fait rien. `playLoop` tue `audioRef.current` local, mais si celui-ci a été écrasé par un appel intermédiaire, l'ancien élément orphelin continue de jouer.

2. **Pas de bouton stop visible** : `isPlaying` est `false` au retour alors que l'audio joue toujours → le bouton apparaît éteint, l'utilisateur pense qu'il n'y a pas d'audio.

## Solution

### Fichier : `src/components/hifz/istiqamah/StepImpregnation.tsx`

#### 1) Hard-stop systématique dans `toggleAudio` avant de démarrer

Dans la branche "start" du `toggleAudio`, **avant** `stopGlobal()` et avant toute logique de reprise, tuer explicitement le local `audioRef.current` s'il existe et joue encore :

```tsx
} else {
  const gen = ++generationRef.current;
  // Hard-stop any existing local audio first
  if (audioRef.current) {
    audioRef.current.onended = null;
    audioRef.current.onerror = null;
    audioRef.current.pause();
    try { audioRef.current.src = ''; } catch {}
    audioRef.current = null;
  }
  stopGlobal();
  pausedRef.current = false;  // Always reset — don't try to resume stale audio
  isPlayingRef.current = true;
  setIsPlaying(true);
  playLoop(0, gen);
}
```

Cela supprime la logique de reprise (`pausedRef` + resume) dans la branche start après un retour d'onglet, car l'état est trop incertain. On redémarre toujours proprement depuis le début.

#### 2) Améliorer le `visibilitychange` handler

Ajouter la mise à jour de `currentAyahIndex` et s'assurer que le bouton reflète correctement l'état :

```tsx
useEffect(() => {
  const handler = () => {
    if (document.visibilityState === 'visible') {
      const audio = audioRef.current;
      const actuallyPlaying = audio && !audio.paused && !audio.ended;
      // Force sync local state with reality
      isPlayingRef.current = !!actuallyPlaying;
      setIsPlaying(!!actuallyPlaying);
      if (!actuallyPlaying) {
        setCurrentAyahIndex(-1);
      }
    }
  };
  document.addEventListener('visibilitychange', handler);
  return () => document.removeEventListener('visibilitychange', handler);
}, []);
```

Pas de condition sur `isPlayingRef.current` — on force toujours la synchronisation au retour.

### Résumé des changements

- `StepImpregnation.tsx` : modifier `toggleAudio` (hard-stop + reset pausedRef + toujours relancer depuis le début) et simplifier le `visibilitychange` handler.

