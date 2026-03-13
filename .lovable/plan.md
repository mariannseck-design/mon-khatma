

## Problème identifié

Le badge verset ("Al-Baqara · v.70–76 · p. 11") ne s'affiche **pas du tout** sur l'étape Mémorisation car les composants `HifzStepMemorisation` et `IstiqamahEngine` ne transmettent pas `surahNumber`, `startVerse`, `endVerse` au `HifzStepWrapper`.

Le badge est déjà positionné en haut du wrapper (au-dessus de `{children}`, donc au-dessus des barres rondes). Il suffit de passer les props manquantes.

## Corrections

### 1. `src/components/hifz/HifzStepMemorisation.tsx`
Ajouter `surahNumber`, `startVerse`, `endVerse` au `HifzStepWrapper` :
```tsx
<HifzStepWrapper stepNumber={4} stepTitle="Mémorisation" onBack={onBack} onPause={onPause} totalSteps={5}
  surahNumber={surahNumber} startVerse={startVerse} endVerse={endVerse}>
```

### 2. `src/components/hifz/istiqamah/IstiqamahEngine.tsx`
Passer les props vers les deux usages de `HifzStepWrapper` (lignes 44 et 115) :
```tsx
<HifzStepWrapper stepNumber={3} stepTitle="Istiqâmah" onBack={onBack} onPause={onPause}
  surahNumber={surahNumber} startVerse={startVerse} endVerse={endVerse}>
```

### 3. `src/components/hifz/HifzStep3Memorisation.tsx`
Même correction — ajouter les props manquantes au `HifzStepWrapper` (ligne 422). Ce composant reçoit déjà `surahNumber`, `startVerse`, `endVerse` en props.

Aucun changement de layout nécessaire dans `HifzStepWrapper` lui-même — le badge est déjà positionné avant `{children}`.

