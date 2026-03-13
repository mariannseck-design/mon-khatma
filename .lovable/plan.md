

## Plan : Afficher un message d'aide Pomodoro à chaque début de session

### Constat
Le bouton Pomodoro est discret (opacité 50%) et le message d'aide n'existe plus que dans l'attribut `title` du bouton (invisible sur mobile). Il faut ajouter un texte visible invitant l'utilisateur à activer le Pomodoro.

### Changement

**`src/components/hifz/PomodoroTimer.tsx`** :
- Quand le timer est en état `idle`, afficher sous le bouton un petit texte doré discret : *"⏱ Cliquez ici pour activer le minuteur Pomodoro"*
- Ce texte disparaît dès que le timer est activé (état `focus`, `paused` ou `break`)
- Style : `text-[10px]`, couleur dorée à 45% d'opacité, centré à droite sous le bouton

