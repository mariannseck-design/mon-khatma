

## Changer le mot de confirmation en "REINITIALISER" (sans accents)

### Modification dans `src/pages/ParametresPage.tsx`
- Remplacer toutes les occurrences de `RÉINITIALISER` par `REINITIALISER` :
  - Le texte d'instruction ("tape **REINITIALISER**")
  - La comparaison `confirmText !== 'REINITIALISER'`
  - Le placeholder de l'input

