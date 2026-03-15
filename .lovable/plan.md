

## Plan : Corriger la boucle audio qui s'arrête en quittant le Hifz

### Problème

Dans `HifzStep3Memorisation.tsx`, le cleanup au démontage fait `isPlayingRef.current = false` (ligne 309). Or le handler `audio.onended` vérifie `if (isPlayingRef.current)` avant de chaîner au verset suivant (ligne 291). Résultat : quand tu quittes la page, le verset en cours finit mais le suivant ne démarre jamais.

Les deux autres composants (`HifzStepImpregnationTajweed`, `HifzStepIntentionImpregnation`) n'ont pas ce problème — leur cleanup est déjà un no-op.

### Correction

**`src/components/hifz/HifzStep3Memorisation.tsx`** — une seule ligne à modifier :

- Ligne 309 : remplacer `return () => { isPlayingRef.current = false; };` par `return () => { /* audio persists globally */ };`

Cela permet au chaînage `onended → playNextAyah` de continuer après la navigation, et le MiniPlayer affichera les contrôles correctement.

