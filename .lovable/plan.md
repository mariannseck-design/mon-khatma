

## Plan : Ajouter un texte d'aide sur la barre Pomodoro (état idle)

### Fichier : `src/components/hifz/PomodoroTimer.tsx`

Dans l'état idle (lignes 121-124), après le texte "Minuteur Pomodoro", ajouter une ligne supplémentaire avec le texte d'aide demandé.

Transformer le `<span>` idle en un `<div>` contenant deux lignes :
1. "Minuteur Pomodoro" (existant)
2. "Cliquez ici pour activer le minuteur et optimiser votre concentration." en `text-[10px]`, couleur `rgba(212,175,55,0.4)` (doré pâle discret)

Le texte n'apparaît que quand le timer est idle (pas actif), donc aucun impact sur l'affichage en cours de session.

