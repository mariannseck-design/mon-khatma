

## Plan : Remplacer le Mushaf toggle par le Mushaf Image pleine largeur dans StepImmersion

### Objectif
Dans l'étape Mémorisation (StepImmersion), supprimer le sélecteur 3 modes (Image/Texte/Mon Mushaf) et le texte "Lis le verset depuis ton Mushaf physique". Le remplacer par le même `HifzMushafImage` pleine largeur avec scrollbar, comme dans l'étape Imprégnation. Réduire la taille du compteur circulaire.

### Changements

1. **`src/components/hifz/istiqamah/StepImmersion.tsx`**
   - Supprimer l'import de `HifzMushafToggle` et les états `mushafMode`/`setMushafModeState`
   - Remplacer la fonction `renderMushaf()` : au lieu des 3 modes (image/texte/physical), rendre uniquement un `HifzMushafImage` en pleine largeur avec `maxHeight="none"` et `fullWidth`, enveloppé dans un `div className="-mx-4"` (comme dans Imprégnation)
   - Supprimer tous les blocs `<HifzMushafToggle>` dans les phases listen, read et error
   - Réduire le `CircularCounter` de `w-28 h-28` à `w-20 h-20`, et le texte de `text-2xl` à `text-lg`

2. **`src/components/hifz/HifzStepMemorisation.tsx`**
   - Passer `disableMushafOverlay` au `HifzStepWrapper` pour éviter le FAB Mushaf redondant (le Mushaf est déjà inline)

