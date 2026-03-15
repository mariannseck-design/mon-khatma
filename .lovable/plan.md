

## Plan: Corriger le bug d'arrêt externe (MiniPlayer Stop)

### Cause racine

Quand le MiniPlayer appelle `stop()`, l'AudioContext tue l'élément audio (pause + clear src). Mais le **composant** ne le sait pas — son `isPlayingRef` reste `true`, son `generationRef` n'a pas changé. Le `onerror` déclenché par le clear src passe les 3 gardes et relance un nouvel audio.

### Solution

Ajouter un **signal de stop** dans l'AudioContext que les composants peuvent écouter.

### Fichiers à modifier

#### 1. `src/contexts/AudioContext.tsx`
- Ajouter `stopSignal` (compteur incrémenté à chaque `stop()`) au contexte
- Exposer `stopSignal` dans le provider

#### 2. Les 5 composants audio — ajouter un `useEffect` sur `stopSignal`
Chaque composant écoute `stopSignal` et, quand il change, tue sa boucle interne :
- `generationRef++`
- `isPlayingRef = false`
- `hardStopAudio()` / clear handlers + pause
- `setIsPlaying(false)`

Composants concernés :
- `src/components/hifz/HifzStep2Impregnation.tsx`
- `src/components/hifz/HifzStepIntentionImpregnation.tsx`
- `src/components/hifz/HifzStepImpregnationTajweed.tsx`
- `src/components/hifz/istiqamah/StepImpregnation.tsx`
- `src/components/hifz/istiqamah/StepImmersion.tsx`

### Ce qui ne change PAS
- Le MiniPlayer reste identique
- Le pattern triple-garde existant reste en place (protection supplémentaire)
- Aucune logique de lecture/pause/reprise n'est modifiée

