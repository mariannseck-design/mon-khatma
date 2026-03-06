

## Plan : Bouton flottant pour afficher les contrôles

Ajouter un petit bouton circulaire semi-transparent en bas à droite du lecteur Coran, visible uniquement quand les contrôles sont masqués. Un tap dessus affiche les barres de contrôle (top + bottom).

### Modification : `src/pages/QuranReaderPage.tsx`

- Ajouter un bouton flottant avec `AnimatePresence` qui apparaît quand `showControls === false`
- Position : `fixed bottom-6 right-4 z-30`
- Style : cercle discret avec icône `Settings2` ou `ChevronUp`, fond `rgba(122, 139, 111, 0.4)` avec `backdrop-blur`
- Au clic : appeler `resetControlsTimer()` pour afficher les contrôles
- Animation : fade in/out inverse des barres de contrôle

