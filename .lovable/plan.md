

## Plan révisé : Mushaf Image par défaut + Lecteur Audio Global

### Volet 1 : Mushaf Image comme mode par défaut

Le composant `HifzMushafImage` est **déjà intégré** dans toutes les étapes (StepImmersion, StepImpregnation, StepFusion, HifzStep2Impregnation, MouradPhase1, MouradPhase2). Il suffit de changer le mode par défaut.

**Fichiers modifiés :**
- `src/components/hifz/HifzMushafToggle.tsx` — changer le fallback de `'physical'` à `'image'`
- `src/components/mourad/MouradMushafToggle.tsx` — idem, fallback `'image'`

C'est tout pour le volet 1 — pas besoin de QCF V2 ni de nouveau composant.

---

### Volet 2 : Lecteur Audio Global Persistant + Mini-Player

**Nouveau `src/contexts/AudioContext.tsx`** :
- State global : `isPlaying`, `currentTrack` (sourate, versets, reciter, label), `audioElement`, `returnPath`
- Méthodes : `playAyah()`, `playSequence()`, `pause()`, `resume()`, `stop()`
- L'`HTMLAudioElement` vit dans le contexte → survit aux changements de route

**Nouveau `src/components/layout/MiniPlayer.tsx`** :
- Barre flottante fixe en bas (~48px), au-dessus de la navigation
- Affiche : label sourate/versets, bouton play/pause, bouton X (stop)
- Clic sur la barre → `navigate(returnPath)` pour revenir à la session
- Style discret cohérent avec le thème (fond semi-transparent, texte doré)
- N'apparaît que quand un audio est actif ou en pause

**Fichiers modifiés :**
- `src/App.tsx` — wrapper `<AudioProvider>`, inclure `<MiniPlayer />`
- `src/components/layout/AppLayout.tsx` — padding bottom quand mini-player visible
- `src/components/hifz/istiqamah/StepImmersion.tsx` — migrer audio local → `useAudio()`
- `src/components/hifz/istiqamah/StepImpregnation.tsx` — idem
- `src/components/hifz/istiqamah/StepFusion.tsx` — idem
- `src/components/hifz/HifzStep2Impregnation.tsx` — idem
- `src/components/mourad/MouradPhase2.tsx` — idem
- `src/hooks/useQuranAudio.ts` — migrer vers le contexte global

