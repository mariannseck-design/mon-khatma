

## Analyse du problème

J'ai vérifié le code en profondeur. Voici ce que j'ai trouvé :

**Les composants utilisés par HifzPage passent déjà les props correctement** :
- `HifzStepIntentionComprehension` (étape 0) → ✅ props transmises
- `HifzStepImpregnationTajweed` (étape 1) → ✅ props transmises  
- `HifzStepMemorisation` (étape 2) → ✅ props transmises
- `HifzStep5Tikrar` (étape 4) → ✅ props transmises

**Le vrai problème** : La modification précédente a édité les **mauvais fichiers** — des composants legacy (`HifzStep0Intention`, `HifzStep2Impregnation`, `HifzStep4Validation`) qui **ne sont plus utilisés** par HifzPage. Les composants actifs avaient déjà les bonnes props.

**Composant manquant** : `StepValidation` (étape 3 — la validation par récitation) n'utilise pas du tout `HifzStepWrapper`. Il a son propre layout sans badge de versets ni bouton Mushaf.

### Plan

1. **`StepValidation.tsx`** — Intégrer `HifzStepWrapper` avec les props `surahNumber`, `startVerse`, `endVerse` pour afficher le badge doré et le bouton Mushaf sur cette étape aussi. Ajouter les props `onPause` et `phaseLabel` depuis HifzPage.

2. **`HifzPage.tsx`** (ligne 664) — Passer `onPause={handlePause}` à `StepValidation` pour que le bouton "Retourner à l'accueil" apparaisse aussi.

3. **Vérification du cache** — Le bouton Mushaf devrait déjà apparaître sur les étapes 0, 1, 2 et 4. Si tu ne le vois pas, il faut forcer un rechargement (Ctrl+Shift+R). Le seul vrai ajout est sur l'étape 3 (Validation).

