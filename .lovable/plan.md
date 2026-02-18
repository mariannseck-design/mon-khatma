

# Correction : Cohérence entre la carte de progression et l'objectif

## Probleme identifie

La carte verte (TotalProgressBar) calcule ses propres valeurs "Pages par jour" et "Objectif de jours" en se basant sur un compte a rebours vers le Ramadan. Elle ignore completement l'objectif reel de l'utilisateur (20 pages/jour).

Resultat : la carte affiche "5 pages/jour, 120 jours" alors que l'objectif est "20 pages/jour, 30 jours".

## Solution

Passer l'objectif actif de l'utilisateur en prop a la carte verte, et afficher ses vraies valeurs au lieu de calculs independants.

## Details techniques

### Fichier modifie : `src/components/planificateur/TotalProgressBar.tsx`

- Ajouter une prop optionnelle `targetPagesPerDay` (nombre de pages/jour de l'objectif actif)
- Remplacer le calcul `pagesPerDayForRamadan` par la vraie valeur de l'objectif
- Calculer "Objectif de jours" a partir de `Math.ceil(remainingPages / targetPagesPerDay)` au lieu du compte a rebours Ramadan
- Supprimer la logique du compte a rebours Ramadan (la date du Ramadan etant passee dans l'interface, les references au "jours avant Ramadan" n'ont plus de sens dans cette carte)

### Fichier modifie : `src/pages/PlanificateurPage.tsx`

- Passer `activeGoal?.target_value` comme prop `targetPagesPerDay` au composant `TotalProgressBar`

### Resultat attendu

Avec un objectif de 20 pages/jour et 604 pages restantes :
- "Pages par jour" affichera **20**
- "Objectif de jours" affichera **31** (ceil(604/20) = 31, soit 30 jours + 4 pages le dernier jour)
- Le message de precision en dessous restera inchange et correct

