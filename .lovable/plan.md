

## Plan : Empêcher deux audios simultanés

### Problème
Quand l'utilisateur revient sur la page Hifz avec un audio en arrière-plan et clique "Écouter", un nouvel audio démarre sans stopper l'ancien. Les deux jouent en même temps.

### Solution
Modifier `registerAudio` dans `AudioContext.tsx` pour **stopper et vider l'ancien `HTMLAudioElement`** avant d'enregistrer le nouveau. Actuellement, `registerAudio` ne fait que retirer les listeners — il ne pause ni ne détruit l'ancien audio.

### Modification unique : `src/contexts/AudioContext.tsx`

Dans `registerAudio`, après le cleanup des listeners et avant d'assigner le nouveau `audioRef.current`, ajouter :

```ts
// Stop previous audio to prevent overlap
if (audioRef.current && audioRef.current !== audio) {
  audioRef.current.pause();
  try { audioRef.current.src = ''; } catch {}
}
```

C'est la correction minimale : tout nouveau `registerAudio` tue l'ancien. Aucun autre fichier à modifier.

