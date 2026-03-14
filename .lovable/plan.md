

## Problème

Les tentatives précédentes de corriger la navigation via `popstate` et le resolver centralisé ne fonctionnent pas de manière fiable sur tous les appareils. L'approche indirecte via l'historique du navigateur est instable.

## Solution : bouton explicite et bien visible

Ajouter un **gros bouton clairement libellé** directement dans `HifzConfig.tsx` (page "Étape 1/5 · Choix des versets") qui dit **"📋 Définir mes acquis"** et qui ramène à l'écran diagnostic. Pas de dépendance sur `popstate` ou l'historique — un simple appel `onBack()` qui change l'état interne de `HifzPage`.

## Changements

### 1. `src/components/hifz/HifzConfig.tsx`
- Ajouter sous le bouton "Retour" existant (ou le remplacer) un **bouton bien visible** avec le texte "📋 Définir mes acquis" qui appelle `onBack`.
- Style : fond semi-transparent, bordure dorée, texte lisible, taille suffisante pour le tap mobile.
- Positionné juste sous le titre "Étape 1/5", avant les sélecteurs de sourate/page.

### 2. `src/pages/HifzPage.tsx`
- S'assurer que `onBack` passé à `HifzConfig` appelle bien `setShowDiagnostic(true)` (déjà le cas via `handlePreSessionBack`).
- Pas d'autre changement nécessaire — le resolver existant gère déjà le cas `step === -1 → showDiagnostic`.

```
Flux résultant :
Étape 1/5 (Config) 
  → clic "📋 Définir mes acquis" 
  → affiche l'écran Diagnostic (acquis anciens/récents)
  → pas de navigation URL, juste changement d'état React
```

