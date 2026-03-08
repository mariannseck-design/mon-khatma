

## Plan : Compléter les titres des cercles et afficher les versets de révision

### Changements dans `src/pages/HifzSuiviPage.tsx`

**1. Cercle gauche — titre complet**
- "Programme" → "Programme de mémorisation"
- Réduire l'icône de `w-11 h-11` à `w-9 h-9` et l'icône interne de `22px` à `18px` pour gagner de la place

**2. Cercle droit — titre + versets**
- "Révision" → "À réviser"
- Réduire l'icône de `w-11 h-11` à `w-9 h-9`
- Au lieu d'afficher juste le nombre de portions, afficher les détails des versets : le nom de la première sourate à réviser + la plage de versets (comme le cercle Programme)
- Si plusieurs portions, ajouter un petit `+N autre(s)` en dessous
- Les données `todayRevisions` contiennent déjà `surah_number`, `verse_start`, `verse_end` — utiliser `SURAHS` pour récupérer le nom de la sourate

**3. Réduction des marges** : `mb-2` sur l'icône → `mb-1.5`, ajuster le padding si nécessaire pour que tout rentre dans le cercle

