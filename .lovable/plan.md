

## Plan : Corriger le calcul d'estimation dynamique

### Problème
Le calcul actuel divise les pages restantes par le **rythme moyen réel** (`totalPagesRead / daysElapsed`). Si l'utilisatrice lit 40 pages le jour 1 avec un objectif de 20/jour, le système calcule un rythme de 40/jour et affiche "15 jours" au lieu de ~29 jours.

### Solution
Changer la logique pour :
1. **Jours restants** = `Math.ceil(remainingPages / target)` → toujours basé sur le rythme cible (20 pages/jour)
2. **Détection avance/retard** = comparer `totalPagesRead` vs `daysElapsed * target` (pages attendues à ce stade)

### Exemple corrigé
- Objectif : 20 pages/jour → 31 jours initial
- Jour 1, 40 pages lues → restant = 564 → `ceil(564/20)` = **29 jours restants**
- Avance : 40 lues vs 20 attendues → en avance mais pas "exceptionnelle" → Condition C

### Modification dans `src/pages/PlanificateurPage.tsx`

Remplacer lignes 316-337 :

```typescript
// Calculate progress vs expected
const startDate = new Date(activeGoal.start_date);
const now = new Date();
const daysElapsed = Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

// Days left based on TARGET pace (not actual)
const estimatedDaysLeft = Math.ceil(remainingPages / target);

// Compare actual vs expected progress
const expectedPages = daysElapsed * target;
const progressRatio = totalPagesRead / expectedPages; // >1 = ahead, <1 = behind

// Condition B: well ahead (read 50%+ more than expected)
if (progressRatio > 1.5) { ... seulement ${estimatedDaysLeft} jours ... }

// Condition D: behind (read less than 85% of expected)
if (progressRatio < 0.85) { ... ${estimatedDaysLeft} jours ... }

// Condition C: on track
return ... environ ${estimatedDaysLeft} jours ...
```

### Fichier modifié
- `src/pages/PlanificateurPage.tsx` uniquement

