

## Ajouter les boutons de validation sur les cartes du Calendrier

### Problème
Les cartes affichent les portions mais il n'y a pas de checkbox visible — toute la carte est cliquable, ce qui n'est pas intuitif. Il faut un bouton rond explicite.

### Modifications — `src/pages/MurjaCalendarPage.tsx`

Dans `renderCards`, modifier chaque carte pour :

1. **Ajouter un cercle checkbox** en haut à droite de chaque carte (non-future, non-checked) :
   - Cercle vide : `w-5 h-5 rounded-full border-2` avec bordure de la couleur de l'item
   - Au clic : déclenche `handleCardTap(id, isRabt)` (même logique existante — rabt = check direct, tour = ouvre rating sheet)

2. **Afficher les cartes validées inline** (au lieu de les cacher + badges) :
   - Les items checked restent dans la grille mais avec `opacity: 0.5`
   - Le cercle se remplit avec la couleur (jaune `#D4AF37` pour rabt, vert `#10B981` pour consolidation) + icône Check blanche
   - Empêcher le re-clic

3. **Séparer le clic checkbox du clic carte** :
   - La carte entière reste un `div` (plus un `button`)
   - Le cercle checkbox est le seul élément cliquable (via `e.stopPropagation()`)
   - Ou plus simple : garder la carte cliquable mais ajouter visuellement le cercle

### Approche retenue (simple)
- Garder `motion.button` sur toute la carte (tap = valide)
- Ajouter visuellement le cercle en haut à droite comme indicateur
- Les items checked restent dans la grille avec opacity 0.5 et cercle rempli
- Supprimer la section "badges checked" en bas

