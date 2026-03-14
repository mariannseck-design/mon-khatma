

## Ajouter une étape Validation (5/5) entre Mémorisation et Tikrâr

### Vue d'ensemble
- Insérer une étape **validation** dans le flux : `comprehension → immersion → validation → tikrar`
- **Validation** : réciter 5 fois sans faute, sans mushaf ni audio, avec possibilité de s'enregistrer (MiniRecorder existant)
- Renommer **Tikrâr** en **Grande Mémorisation** dans les libellés

### Changements

**1. `src/components/hifz/istiqamah/useIstiqamahState.ts`**
- Ajouter `'validation'` au type `StepName`
- Ajouter un nœud `{ type: 'validation', partIndex: -1 }` dans `FLOW` entre `immersion` et `tikrar`
- Mettre à jour `ALLOWED_NEXT` : `immersion → validation`, `validation → tikrar`
- La garde `immersionCompleted` s'applique à `validation` au lieu de `tikrar`

**2. Créer `src/components/hifz/istiqamah/StepValidation.tsx`**
- UI sobre : titre "Validation", consigne "Récitez 5 fois sans faute, sans mushaf ni audio"
- Compteur circulaire 0→5 avec bouton "J'ai récité sans faute ✓" pour incrémenter
- Intégrer le composant `MiniRecorder` existant pour s'enregistrer/réécouter
- Bouton "Valider" actif quand compteur = 5

**3. `src/components/hifz/istiqamah/IstiqamahEngine.tsx`**
- Importer `StepValidation`
- Ajouter le cas `'validation'` dans `renderStep()`
- Mettre à jour le breadcrumb : 4 étapes au lieu de 3 (`Compréhension › Mémorisation › Validation › Grande Mémorisation`)
- Renommer le label `tikrar` en `Grande Mémorisation`

