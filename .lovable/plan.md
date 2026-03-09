

## Plan : Corriger le calcul des jours (604 ÷ 20 = 30 jours + 4 pages)

### Problème
`Math.ceil(604 / 20)` donne 31 jours, mais en réalité c'est **30 jours** de 20 pages (= 600 pages) + **4 pages restantes** le dernier jour. L'utilisateur veut voir "30 jours" et non "31 jours".

### Solution
Utiliser `Math.floor` au lieu de `Math.ceil` pour le nombre de jours, et calculer les pages restantes (`604 % target`). Adapter les messages pour mentionner les pages supplémentaires quand il y en a.

### Modifications

**1. `src/components/planificateur/PlannerCalculator.tsx`** (ligne 34)
- `Math.ceil(604 / pages)` → `Math.floor(604 / pages)`
- Ajouter sous le résultat une mention des pages restantes si `604 % pages !== 0` : ex. "+ 4 pages le dernier jour"

**2. `src/pages/PlanificateurPage.tsx`** (lignes 308, 313, 324)
- `initialTargetDays` : `Math.floor` au lieu de `Math.ceil`
- `estimatedDaysLeft` : `Math.floor` au lieu de `Math.ceil`
- Dans les messages, ajouter la mention des pages supplémentaires quand `remainingPages % target !== 0`

### Exemple concret
- 20 pages/jour → "30 jours (+ 4 pages le dernier jour)" au lieu de "31 jours"
- 4 pages/jour → "151 jours" (604/4 = 151 exactement, pas de reste)

