

## Correction : afficher "Aujourd'hui" au lieu de la date du jour

### Problème
Quand `nextReview` ou `lastReviewed` tombe sur la date du jour (11 mars), afficher "11 mars" n'a pas de sens — il faut afficher **"Aujourd'hui"**.

### Modification — `src/pages/HifzSuiviTestPage.tsx`

1. Importer `isToday` depuis `date-fns`
2. Créer une fonction helper `formatSmartDate(dateStr)` :
   - Si la date est aujourd'hui → retourne `"Aujourd'hui"`
   - Sinon → retourne `format(date, 'd MMM', { locale: fr })`
3. Utiliser `formatSmartDate()` aux deux endroits : "Prochaine révision" (l.351) et "Dernière révision" (l.359)

On peut aussi ajouter `isYesterday` et `isTomorrow` pour afficher "Hier" / "Demain" si pertinent.

