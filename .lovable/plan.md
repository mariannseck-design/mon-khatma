

## Plan : Simplifier l'étape Imprégnation Tajweed

### Changements dans `HifzStepImpregnationTajweed.tsx`

**Supprimer :**
- Le bouton Stop rouge (Square, lignes 516-541)
- Le toggle `HifzMushafToggle` (image/texte/physical) et tout le bloc conditionnel associé (lignes 405-461)
- Le bloc "Mushaf agrandi" / "Ouvrir le Mushaf ici" (lignes 463-488) — remplacé par le Mushaf inline par défaut
- L'icône casque (Headphones) réduite de `w-14 h-14` → `w-10 h-10`, icône de `h-7 w-7` → `h-5 w-5`

**Remplacer par :**
- `HifzMushafImage` affiché directement en permanence, sans toggle, avec `maxHeight="55vh"` pour occuper un maximum d'espace
- Supprimer les états `mushafMode`, `mushafExpanded`, `fontSizeIndex` et les imports inutiles (`HifzMushafToggle`, `ZoomIn`, `ZoomOut`, `BookOpen`, `Minimize2`)

**Réduire :**
- Bouton Play/Pause : `w-20 h-20` → `w-14 h-14`, icône `h-8 w-8` → `h-5 w-5`
- Bouton "Je suis prêt(e)" : `py-4` → `py-2.5`, `text-sm` au lieu de font-semibold normal

**Conserver :**
- Sélecteur de récitant
- Compteur d'écoute (3 cercles)
- Toute la logique audio (play/pause, visibilitychange, anti-coupure)

