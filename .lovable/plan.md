

## Problème identifié

Quand tu quittes la page et reviens, le compteur "Temps restant" repart à 24h car le `tikrar_started_at` n'est **jamais restauré** depuis la base de données.

**Cause** : dans `handleResume` (ligne 178), la session est restaurée mais `stepTimesRef.current` reste `{}`. Du coup `tikrar_started_at` vaut `undefined` et le timer utilise `Date.now()` par défaut — il repart à zéro.

## Correction

**Fichier : `src/pages/HifzPage.tsx`**

1. **Restaurer `stepTimesRef` lors du resume** : dans `handleResume`, récupérer `step_status` depuis la session active en BDD et l'injecter dans `stepTimesRef.current`.

2. **Charger `step_status` dans `pendingResume`** : lors de la détection d'une session active (lignes 159-171), inclure `stepStatus: activeSession.step_status` dans l'objet `restored`.

3. **Appliquer dans `handleResume`** :
```typescript
const handleResume = () => {
  if (pendingResume) {
    setSession(pendingResume.session);
    setStep(pendingResume.step);
    setSessionId(pendingResume.sessionId);
    // Restaurer le step_status (contient tikrar_started_at, tikrar_count, etc.)
    if (pendingResume.stepStatus) {
      stepTimesRef.current = pendingResume.stepStatus;
    }
  }
  setShowResumePrompt(false);
  setPendingResume(null);
};
```

4. **Même chose pour la session locale** : vérifier que `loadLocalSession` sauvegarde/restore aussi le `stepStatus`.

Un seul fichier modifié. Le timer sera correct au retour car `tikrar_started_at` sera l'horodatage d'origine.

