

## Plan : Fix du play qui boucle sur une syllabe

### Cause racine

Dans `togglePlay()` ligne 288, `stopGlobal()` est appelé avant de lancer la lecture. Cela met `globalStatus` à `'idle'`, ce qui déclenche le `useEffect` ligne 269-277 qui :
- incrémente `generationRef` (invalide la session qui vient de démarrer)
- remet `isPlaying = false`

Résultat : le 1er ayah joue, mais à la fin, le callback `onended` voit une génération obsolète → ne continue pas. L'audio est "orphelin" et peut boucler sur un fragment. Le bouton pause ne fonctionne plus car l'état local est déjà à `false`.

### Solution — fichier unique : `HifzStepImpregnationTajweed.tsx`

**1. Supprimer `stopGlobal()` de `togglePlay`** (ligne 288)
- `registerAudio` dans AudioContext stoppe déjà l'audio précédent automatiquement (il fait `pause()` + `src = ''` sur l'ancien élément). L'appel à `stopGlobal` est redondant et toxique.

**2. Protéger le `useEffect` de sync externe** avec un flag `selfInitiatedRef`
- Avant de lancer la lecture, mettre `selfInitiatedRef.current = true`
- Dans le `useEffect(globalStatus === 'idle')`, ignorer si `selfInitiatedRef` est `true`, puis le remettre à `false`
- Cela empêche le sync externe de tuer une session qu'on vient nous-même de lancer

**3. Même fix dans le `onChange` du sélecteur de récitateur** (ligne 401)
- Ne pas appeler `stopGlobal`, juste incrémenter la génération et pauser l'audio local

### Changements concrets

```ts
// Ajouter
const selfInitiatedRef = useRef(false);

// togglePlay — section "resume/start"
selfInitiatedRef.current = true;
// SUPPRIMER: stopGlobal();
const gen = ++generationRef.current;
// ... reste identique

// useEffect sync
useEffect(() => {
  if (globalStatus === 'idle' && isPlayingRef.current) {
    if (selfInitiatedRef.current) {
      selfInitiatedRef.current = false;
      return; // ignore — on a lancé nous-même
    }
    generationRef.current++;
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentAyahIndex(-1);
    pausedRef.current = null;
  }
}, [globalStatus]);
```

