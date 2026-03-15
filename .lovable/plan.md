

## Problème

Deux bugs liés au cycle de vie audio dans `StepImpregnation` :

1. **Pas de cleanup au démontage** : quand on passe à l'étape B, le composant StepImpregnation se démonte mais l'audio n'est jamais arrêtée → l'audio de l'étape A continue de jouer par-dessus l'étape B.
2. **État UI désynchronisé au retour d'onglet** : quand le navigateur met l'onglet en arrière-plan (ouverture Mushaf), `audio.play()` peut échouer silencieusement dans `playLoop`, ce qui met `isPlaying = false`. Au retour, le bouton audio apparaît éteint alors que l'audio a pu reprendre ou est encore en cours.

## Plan

### 1) Ajouter un `useEffect` cleanup dans `StepImpregnation.tsx`

Quand le composant se démonte, arrêter proprement l'audio :

```tsx
useEffect(() => {
  return () => {
    generationRef.current++;
    isPlayingRef.current = false;
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      try { audioRef.current.src = ''; } catch {}
      audioRef.current = null;
    }
  };
}, []);
```

Cela garantit que passer de l'étape A à l'étape B coupe l'audio de A.

### 2) Synchroniser l'état du bouton au retour d'onglet

Ajouter un listener `visibilitychange` qui, au retour de l'onglet, vérifie si l'audio est réellement en train de jouer et met à jour `isPlaying` en conséquence :

```tsx
useEffect(() => {
  const handler = () => {
    if (document.visibilityState === 'visible') {
      const audio = audioRef.current;
      const actuallyPlaying = audio && !audio.paused && !audio.ended;
      if (actuallyPlaying && !isPlayingRef.current) {
        isPlayingRef.current = true;
        setIsPlaying(true);
      } else if (!actuallyPlaying && isPlayingRef.current) {
        isPlayingRef.current = false;
        setIsPlaying(false);
      }
    }
  };
  document.addEventListener('visibilitychange', handler);
  return () => document.removeEventListener('visibilitychange', handler);
}, []);
```

### 3) Appeler `stopGlobal()` dans le cleanup aussi

Pour que le contexte audio global soit aussi nettoyé au démontage, appeler `stopGlobal()` dans le cleanup du `useEffect`.

### Fichier modifié

- `src/components/hifz/istiqamah/StepImpregnation.tsx` — ajout de 2 `useEffect` (cleanup + visibilitychange)

