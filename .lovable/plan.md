

## Changer le mode Mushaf par défaut à "Mon Mushaf" (physique)

### Changement unique

**`src/components/hifz/HifzMushafToggle.tsx`** ligne 8 : changer le fallback de `'text'` à `'physical'`.

```typescript
// Avant
return (localStorage.getItem(STORAGE_KEY) as MushafMode) || 'text';

// Après
return (localStorage.getItem(STORAGE_KEY) as MushafMode) || 'physical';
```

C'est le seul fichier à modifier. Tous les composants Hifz (StepImmersion, StepImpregnation, StepAutonomie, StepFusion, HifzStep1Revision, HifzStep2Impregnation, etc.) appellent `getMushafMode()` depuis ce fichier. Le mode "Mon Mushaf" sera affiché par défaut pour les nouveaux utilisateurs. Ceux qui ont déjà choisi un autre mode garderont leur préférence (stockée dans localStorage).

