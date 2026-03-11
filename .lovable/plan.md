

## Fusionner Al-Fatiha avec la portion suivante

### Problème
Al-Fatiha (sourate 1, versets 1-7) est trop courte pour apparaître seule dans la checklist Muraja'a. Elle doit toujours être groupée avec la portion suivante (page 2 du Mushaf).

### Approche
Fusionner Al-Fatiha au niveau de la **liste triée** dans `MurajaChecklist.tsx`, de sorte qu'elle ne forme qu'un seul item visuel combiné avec le bloc suivant.

### Modifications — `src/components/muraja/MurajaChecklist.tsx`

1. **Après le tri par page** (ligne ~122), ajouter une logique de fusion :
   - Si un item a `surah_number === 1` et `verse_start === 1` et `verse_end === 7`, le fusionner visuellement avec l'item suivant dans la liste triée.
   - L'item fusionné affiche les deux sourates (ex: "Al-Fatiha + Al-Baqara") avec les versets de chaque.
   - Le check valide les deux items d'un coup (`onCheck` appelé pour les deux IDs).

2. **Implémentation concrète** :
   - Créer un type `DisplayItem` qui peut contenir un `mergedWith?: ChecklistItem` optionnel.
   - Transformer `sortedItems` → `displayItems` en détectant Al-Fatiha seule et l'attachant au suivant.
   - Dans le rendu, afficher le nom combiné et les deux lignes de versets.
   - Le bouton de validation déclenche `onCheck` / `onRate` pour les deux IDs.
   - La barre de progression utilise les données de l'item principal (celui qui n'est pas Al-Fatiha).

### Résultat
Al-Fatiha n'apparaît jamais seule — elle est toujours présentée comme une portion combinée avec le bloc adjacent.

