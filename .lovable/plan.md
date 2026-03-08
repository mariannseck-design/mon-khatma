

## Plan : Ajuster le style des cercles Programme / Révision

Les cercles actuels fonctionnent mais sont un peu serrés avec le texte trop petit. Ajustements proposés :

### Changements dans `src/pages/HifzSuiviPage.tsx` (lignes 298-385)

**1. Augmenter le gap entre les cercles** : `gap-4` → `gap-5`

**2. Augmenter le padding interne** : `p-4` → `p-5` sur les deux cercles

**3. Agrandir les icônes centrales** : `w-10 h-10` → `w-11 h-11`, icônes `h-5 w-5` → `h-5.5 w-5.5`

**4. Augmenter légèrement les tailles de texte** :
- Label "PROGRAMME" / "RÉVISION" : `text-[10px]` → `text-[11px]`
- Nom de sourate : `text-xs` → `text-sm`
- Versets : `text-[10px]` → `text-xs`
- Nombre de portions : `text-lg` → `text-xl`
- Label "portion(s) à réviser" : `text-[10px]` → `text-xs`

**5. Ajouter un léger effet hover** pour rendre le côté cliquable plus évident : `transition-transform hover:scale-[1.03]` sur chaque cercle

