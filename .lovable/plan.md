
# Ajouter le rapport hebdomadaire sur l'accueil et l'etendre a 48h

## Ce qui sera fait

1. **Ajouter le rapport hebdomadaire sur la page Accueil** entre la carte "pages lues aujourd'hui" et la carte "Ma Tillawah"
2. **Le garder aussi sur la page Ramadan** (aucun changement la-bas)
3. **Etendre la visibilite a 48h** : le rapport s'affichera le **lundi ET le mardi** au lieu du lundi uniquement

## Details techniques

### Fichier `src/components/ramadan/RamadanWeeklyReport.tsx`

- Remplacer la condition `isMonday` par `isMondayOrTuesday` : verifier si `getDay() === 1` (lundi) OU `getDay() === 2` (mardi)
- Mettre a jour les conditions de rendu (lignes 109-110) pour utiliser cette nouvelle variable

### Fichier `src/pages/AccueilPage.tsx`

- Importer `RamadanWeeklyReport` depuis `@/components/ramadan/RamadanWeeklyReport`
- Ajouter un state `readingGoal` et une fonction `fetchReadingGoal` (comme dans RamadanPage) pour recuperer `first_name` et `daily_pages` depuis la table `ramadan_reading_goals`
- Inserer le composant `RamadanWeeklyReport` entre la carte de progression quotidienne (ligne 172) et la section "Ma Tillawah" (ligne 174), conditionne a l'existence du readingGoal
