

## Plan : Retirer l'intégration Ar-Rabt de HifzPage.tsx

Modifications dans `src/pages/HifzPage.tsx` :

1. **Retirer l'import** de `HifzStep5Liaison` (ligne 16)
2. **Restaurer `STEP_NAMES`** à 5 éléments (retirer "Liaison")
3. **Restaurer `PHASE_LABELS`** : Étape B redevient 1/3, 2/3, 3/3
4. **Tikrâr (step 4)** → `onNext` appelle `completeSession` directement au lieu de `updateStep(5)`
5. **Supprimer le rendu step 5 Liaison** (lignes 681-692)
6. **Succès redevient step 5** au lieu de step 6
7. **Ajuster les gardes** : `step <= 5` → `step <= 4`, `setStep(6)` → `setStep(5)`, etc.
8. **DevSkipButton** : retirer le cas step 5, step 4 appelle `completeSession()`

Le fichier `HifzStep5Liaison.tsx` reste intact (il existe mais n'est plus utilisé).

