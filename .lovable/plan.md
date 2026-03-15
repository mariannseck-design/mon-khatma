

## Plan : Corriger le compteur infini dans Imprégnation

### Cause racine

Dans `HifzStepIntentionImpregnation.tsx`, ligne 251-255 :

```ts
if (idx >= ayahsRef.current.length) {
  setListenCount(prev => prev + 1);
  indexRef.current = 0;
  playNextAyah(0);  // ← boucle récursive synchrone !
  return;
}
```

Si `ayahsRef.current` est vide (URLs audio pas encore chargées au moment du clic), `playNextAyah(0)` → `idx (0) >= length (0)` → incrémente le compteur → `playNextAyah(0)` → boucle infinie synchrone. Le compteur monte à des milliers en quelques millisecondes.

### Solution — fichier unique : `src/components/hifz/HifzStepIntentionImpregnation.tsx`

1. **Garde contre tableau vide** : ajouter `if (ayahsRef.current.length === 0) return;` au début de `playNextAyah`

2. **Compteur de génération** (même pattern que HifzStep3) : ajouter `generationRef` pour invalider les boucles obsolètes quand l'utilisateur relance l'audio

3. **Vérification à chaque continuation** : `onended` et `onerror` vérifient `generationRef.current === gen` avant de continuer

```ts
const generationRef = useRef(0);

const playNextAyah = useCallback((idx: number, gen: number) => {
  if (generationRef.current !== gen) return;
  if (ayahsRef.current.length === 0) return;  // guard
  if (idx >= ayahsRef.current.length) {
    setListenCount(prev => prev + 1);
    indexRef.current = 0;
    playNextAyah(0, gen);  // safe: array is non-empty
    return;
  }
  // ... rest unchanged, but onended/onerror pass gen
  audio.onended = () => { if (generationRef.current === gen) playNextAyah(idx + 1, gen); };
  audio.onerror = () => { if (generationRef.current === gen) playNextAyah(idx + 1, gen); };
}, []);

const togglePlay = () => {
  if (isPlaying) {
    audioRef.current?.pause();
    setIsPlaying(false);
  } else {
    generationRef.current++;
    setIsPlaying(true);
    playNextAyah(indexRef.current, generationRef.current);
  }
};
```

