

## Diagnostic du bug

Le problème : après avoir cliqué « Valider votre Tikrar », l'utilisateur revient à l'étape 3/5 (Imprégnation) au lieu de voir l'écran de succès.

**Cause racine identifiée** — deux failles dans `completeSession` :

1. **`setStep(4)` est appelé APRÈS toutes les opérations async DB** (ligne 341). Si une requête échoue, est lente, ou si le navigateur recharge pendant ce temps, `step` reste à 3 et le localStorage peut être ré-écrit avec step=3 par l'effet de sauvegarde automatique (lignes 101-105).

2. **Anciennes sessions non complétées en DB** : la requête de restauration (ligne 150-157) cherche la session active la plus récente avec `completed_at: null`. Si la session courante est bien complétée mais qu'une ancienne session (à step=1, étape 3/5) traîne en DB sans `completed_at`, elle est restaurée au prochain chargement.

## Corrections prévues

### Fichier : `src/pages/HifzPage.tsx`

**1. Afficher l'écran de succès immédiatement**
Déplacer `setStep(4)` et `clearLocalSession()` AVANT les opérations DB async. Le succès s'affiche instantanément, les sauvegardes DB se font en arrière-plan sans bloquer l'UX.

```ts
const completeSession = useCallback(async () => {
  // Calculer le temps écoulé
  const elapsedSeconds = Math.floor((Date.now() - stepStartRef.current) / 1000);
  if (step >= 0) {
    stepTimesRef.current[`step_${step}_time`] = elapsedSeconds;
  }

  // IMMÉDIAT : afficher succès + nettoyer localStorage
  clearLocalSession();
  setStep(4); // ← déplacé ICI, avant les await

  // Sauvegardes DB en arrière-plan (non bloquantes)
  if (sessionId && user) {
    // ... toutes les opérations DB existantes (inchangées)
  }
}, [...]);
```

**2. Nettoyer les anciennes sessions orphelines**
Dans la logique d'initialisation (effet `init`), après la requête pour trouver une session active, ajouter un nettoyage des sessions orphelines plus anciennes qui n'ont jamais été complétées :

```ts
// Après avoir trouvé/restauré une session active, 
// marquer toutes les AUTRES sessions non complétées comme abandonnées
if (user) {
  supabase.from('hifz_sessions')
    .update({ completed_at: new Date().toISOString(), step_status: { abandoned: true } })
    .eq('user_id', user.id)
    .is('completed_at', null)
    .neq('id', activeSession?.id ?? '')
    .then(() => {});
}
```

**3. Garde supplémentaire dans l'effet de sauvegarde**
Ajouter un flag `completedRef` pour empêcher toute ré-écriture accidentelle du localStorage après complétion :

```ts
const completedRef = useRef(false);

// Dans completeSession :
completedRef.current = true;

// Dans l'effet de sauvegarde :
if (session && step >= 0 && step <= 3 && !completedRef.current) {
  saveLocalSession(...);
}
```

Ces trois corrections éliminent le bug sous tous les scénarios (page lente, erreur réseau, sessions orphelines).

