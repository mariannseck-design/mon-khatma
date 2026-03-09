

## Plan : Message d'estimation dynamique sur la carte Ma Khatma

### Problème
Le message "🌟 À ce rythme, tu finiras en X jours..." utilise `getPrecisionMessage()` qui calcule uniquement à partir de l'objectif initial (target_value), sans tenir compte de la progression réelle.

### Solution
Remplacer `getPrecisionMessage()` par une fonction `getDynamicEstimationMessage()` qui calcule le rythme réel et affiche 4 messages conditionnels.

### Modifications dans `src/pages/PlanificateurPage.tsx`

**Remplacer `getPrecisionMessage`** (lignes 304-314) par `getDynamicEstimationMessage` :

- **Calcul dynamique** :
  - `daysElapsed` = jours écoulés depuis `activeGoal.start_date`
  - `averagePacePerDay` = `totalPagesRead / daysElapsed`
  - `remainingPages` = `604 - totalPagesRead`
  - `estimatedDaysLeft` = `Math.ceil(remainingPages / averagePacePerDay)`
  - `initialTargetDays` = `Math.ceil(604 / activeGoal.target_value)`

- **4 conditions d'affichage** :
  - **A (0 pages lues ou jour 1)** : "Bismillah ! À ce rythme d'objectif, tu termineras ta lecture dans [initialTargetDays] jours."
  - **B (très en avance : estimatedDaysLeft < initialTargetDays * 0.7)** : "Ma sha Allah ! Ton ardeur fait chaud au cœur. À ce rythme exceptionnel, tu termineras ta lecture dans seulement [X] jours. Qu'Allah (عز وجل) bénisse ton temps !"
  - **C (dans les temps : entre 0.7x et 1.15x)** : "Excellente régularité ! À ton rythme actuel, tu termineras ta lecture dans environ [X] jours."
  - **D (en retard : estimatedDaysLeft > initialTargetDays * 1.15)** : "Chaque lettre lue est une immense récompense. Tu as pris un peu de retard, mais l'essentiel est l'Istiqamah (constance). À ce rythme, tu finiras dans [X] jours. On s'accroche !"

**Mettre à jour l'appel** (lignes 373-378) pour utiliser `getDynamicEstimationMessage()`.

### Fichier modifié
- `src/pages/PlanificateurPage.tsx` uniquement

