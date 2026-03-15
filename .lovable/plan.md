

## Plan : Supprimer le Mushaf flottant dans Validation et Tikrar

### Problème
Le bouton flottant Mushaf (FAB vert en bas à gauche) apparaît encore dans les étapes Validation et Tikrar malgré le `disableMushafOverlay` déjà en place.

### Diagnostic
Deux `HifzStepWrapper` sont rendus simultanément :
1. Le **wrapper externe** dans `IstiqamahEngine.tsx` (ligne 125) — il a `disableMushafOverlay` conditionnel mais reçoit toujours `surahNumber`/`startVerse`/`endVerse`, ce qui génère `mushafPage`
2. Le **wrapper interne** dans `StepValidation.tsx` — a `disableMushafOverlay` activé

Le wrapper externe pourrait garder le FAB visible si la condition `effectiveStep` ne se résout pas correctement au moment du rendu.

### Solution — 2 fichiers

**`src/components/hifz/istiqamah/IstiqamahEngine.tsx`** (ligne 125)
- Forcer `surahNumber`, `startVerse`, `endVerse` à `undefined` sur le wrapper externe quand l'étape est validation ou tikrar, pour empêcher tout calcul de `mushafPage` et garantir qu'aucun élément Mushaf ne s'affiche.

**`src/components/hifz/istiqamah/StepValidation.tsx`** (ligne 35-46)
- Retirer `surahNumber`, `startVerse`, `endVerse` du wrapper interne pour être certain qu'aucun mushafPage n'est calculé (le `disableMushafOverlay` seul ne suffit pas si le badge verse info est toujours généré).

Résultat : aucun FAB flottant, aucun bouton Mushaf, dans Validation et Tikrar.

