

## Plan : Remplacer l'icône Moon par un chapelet pour Dhikr

Lucide-react ne possède pas d'icône "chapelet" (prayer beads). La solution est de créer un petit composant SVG custom représentant un chapelet/misbaha.

### Modifications

1. **`src/components/icons/ChapeletIcon.tsx`** (nouveau fichier)
   - Composant SVG custom représentant un chapelet (misbaha) simplifié : quelques perles en arc avec un fil et un pompon
   - Accepte les mêmes props que les icônes Lucide (`size`, `className`, `color`)

2. **`src/components/layout/Navigation.tsx`**
   - Importer `ChapeletIcon` à la place de `Moon` pour l'item Dhikr
   - Adapter le type de `navItems` pour accepter aussi le composant custom
   - L'item Ramadan garde `Moon`

### Fichiers modifiés
- `src/components/icons/ChapeletIcon.tsx` — nouveau composant SVG chapelet
- `src/components/layout/Navigation.tsx` — utiliser ChapeletIcon pour Dhikr

