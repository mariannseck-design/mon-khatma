

## Plan : Persister le minuteur Pomodoro entre les changements de page

### Probleme
Le `PomodoroTimer` est un composant local avec un state React interne. Quand on change d'etape/page, le composant est demonte et l'etat (temps restant, statut) est perdu. Au retour, il repart de zero.

### Solution
Persister l'etat du timer dans `sessionStorage` (survit aux navigations mais pas a la fermeture d'onglet).

### Fichier : `src/components/hifz/PomodoroTimer.tsx`

1. **Initialiser l'etat depuis sessionStorage** : Au montage, lire `pomodoro_status`, `pomodoro_timeLeft`, `pomodoro_endTimestamp` et `pomodoro_focusDuration` depuis sessionStorage. Utiliser un timestamp de fin (`endTimestamp = Date.now() + timeLeft * 1000`) plutot que de stocker `timeLeft`, pour calculer le temps restant reel meme apres un remontage.

2. **Sauvegarder a chaque changement** : Un `useEffect` synchronise `status`, `focusDuration` et `endTimestamp` dans sessionStorage a chaque tick/changement de statut.

3. **Au montage, recalculer le temps restant** : `timeLeft = Math.max(0, Math.ceil((endTimestamp - Date.now()) / 1000))`. Si le timer a expire pendant l'absence, declencher la notification appropriee.

4. **Au reset/idle** : Nettoyer les cles sessionStorage.

### Logique cle

```text
Montage:
  lire sessionStorage -> endTimestamp, status, focusDuration
  si status === 'focus' ou 'break':
    remaining = ceil((endTimestamp - now) / 1000)
    si remaining > 0 -> reprendre avec timeLeft = remaining
    sinon -> declencher fin (notification)
  si status === 'paused':
    reprendre avec timeLeft stocke tel quel

startFocus(seconds):
  endTimestamp = Date.now() + seconds * 1000
  sauver dans sessionStorage

togglePause:
  pause -> sauver timeLeft brut (pas de endTimestamp)
  resume -> recalculer endTimestamp = now + timeLeft * 1000

reset:
  sessionStorage.removeItem(...)
```

Aucun autre fichier ne change. Le composant reste identique visuellement.

