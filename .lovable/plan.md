

## Plan : Arranger l'affichage mobile de la page Mon Suivi Hifz

En regardant les screenshots, les problèmes principaux sur mobile sont :

1. **Les 3 cartes KPI** (Jours consécutifs, Versets ancrés, Cycles terminés) sont trop serrées en `grid-cols-3` — le texte déborde et les éléments sont écrasés
2. **Le graphique hebdomadaire** — les labels de l'axe X sont trop longs et se chevauchent sur petit écran

### Changements dans `src/pages/HifzSuiviPage.tsx`

**1. Réduire la jauge CircularGauge pour qu'elle rentre mieux**
- Réduire le SVG de `96x96` à `80x80`, le rayon de 38 à 32, ajuster le texte

**2. Cartes KPI — réduire le padding et les tailles**
- Padding `p-4` → `p-3` sur les cartes latérales
- Icônes `w-9 h-9` → `w-8 h-8`
- Nombre `text-2xl` → `text-xl`
- Gap `gap-3` → `gap-2`

**3. Graphique — raccourcir les labels de l'axe X**
- Afficher seulement le jour abrégé + numéro (ex: `Lun 4`) au lieu de `Lun 04/03` pour éviter le chevauchement
- Réduire la taille de police des ticks à `9px`

