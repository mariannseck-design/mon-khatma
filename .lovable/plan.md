

## Plan : Activer la persistance audio globale sur les 3 composants manquants

### Problème identifié

L'architecture audio globale (`AudioContext` + `MiniPlayer`) est bien en place, mais **3 composants Hifz** n'ont jamais été intégrés. Ils utilisent un audio local et **forcent la pause au démontage**, ce qui coupe le son quand tu quittes la page.

Composants concernés :
- `HifzStep3Memorisation.tsx`
- `HifzStepIntentionImpregnation.tsx`
- `HifzStepImpregnationTajweed.tsx`

Les autres composants (StepImpregnation, StepImmersion, StepFusion, MouradPhase2, QuranReader) sont déjà intégrés et fonctionnent.

### Modifications par fichier

**Pour chacun des 3 fichiers :**

1. Ajouter `import { useGlobalAudio } from '@/contexts/AudioContext'`
2. Appeler `const { registerAudio: registerGlobalAudio } = useGlobalAudio()` + `registerRef`
3. Après chaque `new Audio(url)`, appeler `registerRef.current(audio, { label, returnPath })` pour enregistrer l'audio dans le contexte global
4. Remplacer le cleanup `return () => { audioRef.current?.pause(); }` par `return () => { isPlayingRef.current = false; }` (sans pause, le contexte global gère la persistance)

Le label sera du type `"Sourate An-Naba · v.1-10"` et le `returnPath` sera le chemin courant (`window.location.pathname + window.location.search`).

### Résultat attendu

- L'audio continue de jouer en arrière-plan lors de la navigation
- Le MiniPlayer apparaît avec les contrôles pause/play et le lien retour
- Aucun changement de comportement au sein des étapes elles-mêmes

