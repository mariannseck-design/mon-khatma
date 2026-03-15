

## Plan : Corriger le bouton play externe (StepImpregnation)

### Cause racine

`StepImpregnation.tsx` (istiqamah) a exactement les mêmes bugs que les fichiers déjà corrigés :

1. **Pas de compteur de génération** : quand le MiniPlayer appelle `stop()`, le `AudioContext` met `status = idle` et vide `trackInfo`, mais `isPlayingRef.current` dans StepImpregnation reste `true`. La chaîne `playLoop` via `setTimeout` continue à tourner, crée un nouveau `Audio`, appelle `registerGlobalAudio` → le MiniPlayer réapparaît immédiatement. C'est pourquoi il « refuse de se fermer ».

2. **Pas de garde tableau vide** : si `audiosRef.current` est vide (URLs pas encore chargées), `playLoop(0)` → `idx >= length` → `setTimeout → playLoop(0)` en boucle, sans jamais jouer de son.

### Solution — fichier unique : `src/components/hifz/istiqamah/StepImpregnation.tsx`

Appliquer le même pattern que les fichiers déjà corrigés :

1. **Ajouter `generationRef = useRef(0)`**

2. **`playLoop(idx, gen)`** : ajouter le paramètre `gen`, vérifier `generationRef.current === gen` au début et dans chaque callback (`onended`, `onerror`, `setTimeout`)

3. **Garde tableau vide** : `if (audiosRef.current.length === 0) return;`

4. **`toggleAudio`** : quand on lance la lecture, incrémenter `generationRef.current++` et appeler `stopGlobal()` pour tuer l'audio précédent proprement

5. **Import `stop` depuis `useGlobalAudio()`** renommé en `stopGlobal`

6. **Bouton Continuer** : incrémenter aussi la génération pour tuer la chaîne

