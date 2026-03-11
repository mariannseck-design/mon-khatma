

## Rendre le bouton Skip visible dans tous les écrans Hifz

### Probleme
`HifzPage.tsx` a 4 blocs `return` distincts. Le `DevSkipButton` n'est rendu que dans le dernier (session active, steps 0-4). Il est absent sur :
- L'ecran "Session en cours / Reprendre" (pendingResume)
- L'ecran Goal Onboarding
- L'ecran de pause respiratoire (showBreathingPause)
- L'ecran de succes (step 5)

`MethodeMouradPage.tsx` semble correct (le bouton couvre toutes les phases actives).

### Modifications sur `src/pages/HifzPage.tsx`

**1. Ecran pendingResume (ligne ~370-411)**
- Ajouter `<DevSkipButton>` avec `onSkip` = `handleResume()` (reprend directement la session)

**2. Ecran Goal Onboarding (ligne ~414-424)**
- Ajouter `<DevSkipButton>` avec `onSkip` = `{ setHasGoal(true); setShowGoalOnboarding(false); }` (bypass l'onboarding)

**3. Session active — elargir la condition (ligne ~449)**
- Retirer `!showBreathingPause` de la condition du DevSkipButton
- Changer `step >= 0 && step <= 4` en `step >= 0 && step <= 5`
- Si breathing pause : `onSkip` appelle `handleBreathingComplete()`
- Si step 5 (succes) : `onSkip` navigue vers `/muraja`

### Logique du Skip mise a jour

```text
pendingResume     → handleResume()
goalOnboarding    → setHasGoal + dismiss
breathingPause    → handleBreathingComplete()
step 0-3          → updateStep(step + 1)
step 4            → completeSession()
step 5 (succes)   → navigate('/muraja')
```

### Fichier modifie
- `src/pages/HifzPage.tsx`

