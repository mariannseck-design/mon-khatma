

## Afficher uniquement les versets à mémoriser (texte arabe) au lieu de la page complète

### Constat
Actuellement, les étapes 2 et 3 affichent une **image entière de la page Mushaf** via une URL CDN. Si l'utilisateur ne mémorise que 3-4 versets sur une page de 15, il voit tout le reste inutilement.

### Solution
Remplacer l'image Mushaf par un **rendu texte arabe** des versets sélectionnés uniquement, avec le style tajweed coloré — exactement comme le mode "Texte Tajwid" qui existe déjà dans l'étape 3.

### Modifications

**1. `src/components/hifz/HifzStep2Impregnation.tsx`**
- Charger les versets locaux via `getVersesByRange(surahNumber, startVerse, endVerse)` + annotations tajweed
- Remplacer le bloc image Mushaf (lignes 157-190) par un rendu texte arabe avec numéros de versets en pastilles vertes et couleurs tajweed
- Supprimer le zoom image (plus nécessaire), conserver un zoom de taille de police à la place
- Ajouter la Basmala en en-tête si `startVerse === 1`

**2. `src/components/hifz/HifzStep3Memorisation.tsx`**
- Supprimer le mode "Mushaf Image" du toggle (lignes 334-358) — ne garder que le mode texte tajweed
- Supprimer le code de rendu de l'image Mushaf (lignes 497-534)
- Simplifier le composant en retirant les états `displayMode` et `mushafZoom`

### Résultat
L'utilisateur ne verra que ses versets ciblés, rendus en arabe avec tajweed coloré, dans les deux étapes — plus compact, plus focalisé, plus efficace pour la mémorisation.

