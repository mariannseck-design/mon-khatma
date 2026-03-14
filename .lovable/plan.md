
## Intégrer l'étape Validation dans le flux réel de HifzPage

### Problème identifié
L'`IstiqamahEngine` (qui contient le flux à 4 sous-étapes avec Validation) n'est **jamais importé ni utilisé** dans `HifzPage.tsx`. Le parcours réel utilise directement :
- step 0 → `HifzStepIntentionComprehension`
- step 1 → `HifzStepImpregnationTajweed`
- step 2 → `HifzStepMemorisation`
- step 3 → `HifzStep5Tikrar`
- step 4 → `HifzSuccess`

L'étape `StepValidation` existe mais ne s'affiche jamais car elle vit uniquement dans l'IstiqamahEngine inutilisé.

### Solution
Insérer `StepValidation` comme **step 3** dans `HifzPage.tsx`, en décalant Tikrar au step 4 et Success au step 5.

### Changement unique : `src/pages/HifzPage.tsx`

1. Importer `StepValidation` depuis `@/components/hifz/istiqamah/StepValidation`
2. Ajouter un bloc `step === 3` qui rend `StepValidation` avec `onNext={() => updateStep(4)}`
3. Décaler Tikrar au `step === 4` avec `onBack={() => setStep(3)}`
4. Décaler Success au `step === 5`
5. Mettre à jour le DevSkipButton pour gérer les 5 steps
6. Mettre à jour les commentaires d'étape (Étape 4/5 → Validation, Étape 5/5 → Tikrar, Step 5 → Succès)
7. Mettre à jour le `completeSession` et toute référence à step 4 → step 5

### Impact
- Aucun changement aux composants existants
- Le flux visible sera : Intention → Imprégnation → Mémorisation → **Validation** → Tikrar → Succès
