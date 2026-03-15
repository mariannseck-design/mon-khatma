

## Problème

Le bouton Stop a été ajouté dans `StepImpregnation.tsx` (Istiqâmah), mais l'utilisateur est sur `HifzStepImpregnationTajweed.tsx` (Phase A classique) qui n'a ni le bouton Stop, ni le cleanup unmount, ni le visibilitychange handler.

## Plan

### Fichier : `src/components/hifz/HifzStepImpregnationTajweed.tsx`

#### 1) Import `Square` depuis lucide-react (ligne 2)

#### 2) Ajouter cleanup useEffect (après les refs, ~ligne 112)
Même logique que StepImpregnation : au démontage, incrémenter generation, pause audio, stopGlobal.

#### 3) Ajouter visibilitychange useEffect
Synchroniser `isPlaying` avec l'état réel de l'audio au retour d'onglet.

#### 4) Hard-stop dans togglePlay branche "start" (ligne 303-337)
Avant de reprendre ou démarrer, tuer explicitement `audioRef.current` s'il existe encore, puis `stopGlobal()`, puis démarrer proprement.

#### 5) Ajouter bouton Stop dans le JSX (~ligne 439, après le bouton Play/Pause)
Un bouton carré rouge qui apparaît uniquement quand `isPlaying === true`, avec la même logique de hard-stop complète.

