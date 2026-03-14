

## Rendre le Pomodoro visible et gérer la pause automatique

### Problème
1. Le Pomodoro est un petit bouton discret en haut à droite, facilement ignoré
2. Quand l'utilisateur quitte (pause/retour accueil), le Pomodoro continue de tourner au lieu de se mettre en pause
3. Au retour, le timer ne reprend pas correctement

### Plan

#### 1. Rendre le Pomodoro proéminent à l'ouverture (`PomodoroTimer.tsx`)
- Quand le timer est en état `idle`, afficher une **bannière pleine largeur** bien visible (pas un petit bouton aligné à droite) avec un fond doré semi-transparent et un CTA clair "Activer le Pomodoro avant de commencer"
- Ajouter une animation pulse/glow pour attirer l'attention
- Une fois activé, revenir au format compact actuel (timer + pause/reset)

#### 2. Pause automatique quand l'utilisateur quitte (`HifzPage.tsx` + `PomodoroTimer.tsx`)
- Exporter une fonction `pausePomodoro()` depuis `PomodoroTimer` (ou simplement écrire dans sessionStorage) qui met le timer en pause
- Dans `handlePause` de `HifzPage.tsx`, appeler cette fonction avant de naviguer vers `/accueil`
- Concrètement : lire le `sessionStorage`, si status = `focus`, calculer le timeLeft restant, sauvegarder en status `paused` avec ce timeLeft

#### 3. Reprise au retour (`PomodoroTimer.tsx`)
- La logique de restauration existante gère déjà le cas `paused` avec `timeLeft` → au retour sur la page Hifz, le timer reprendra là où il s'est arrêté (pas depuis le début)
- Aucun changement nécessaire ici, c'est déjà fonctionnel grâce à `readStorage()`

### Fichiers modifiés
- **`src/components/hifz/PomodoroTimer.tsx`** — bannière visible + export fonction `pausePomodoro`
- **`src/pages/HifzPage.tsx`** — appeler `pausePomodoro()` dans `handlePause`

