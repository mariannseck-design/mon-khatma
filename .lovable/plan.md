

## Post-validation UX pour MurjaCalendarPage

### Modifications — `src/pages/MurjaCalendarPage.tsx`

1. **Tri dynamique** : Séparer les items en deux listes — `pending` (non validés) et `done` (validés via `checkedIds`). Les pending s'affichent en premier dans la grille principale.

2. **Section collapsible "Révisions terminées"** : Sous les cartes actives, ajouter un `Collapsible` (déjà disponible via `@radix-ui/react-collapsible`) intitulé "Révisions terminées (X)" qui contient les cartes validées avec `opacity: 0.5`. Fermé par défaut, ouvrable au tap.

3. **Bannière de célébration** : Quand tous les items du jour sélectionné (rabt + tour) sont validés et que c'est aujourd'hui, afficher une bannière animée (fade-in) avec le texte "Alhamdulillah ! Programme du jour terminé." en haut de la zone des tâches. Style discret : fond vert pâle, texte émeraude, icône check.

4. **Verrouillage jours futurs** : Déjà partiellement implémenté (opacity + Lock icon + disabled). Renforcer avec `pointer-events: none` et `cursor: not-allowed` sur les cartes futures, et retirer complètement le cercle de validation au profit d'un cadenas.

5. **Logique de données** : Déjà correcte — `handleRabtCheck` met à jour `last_reviewed_at` et insère une `muraja_session`, `handleTourRate` met à jour les paramètres SM-2 et `next_review_date`. Aucun changement backend nécessaire.

### Détail des changements dans le fichier

- Importer `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` et `ChevronDown`
- Refactorer `renderCards` pour ne plus rendre les items checked (ils iront dans la section collapsible)
- Ajouter une fonction `renderCheckedCards` avec opacity 0.5, sans interaction
- Ajouter la bannière conditionnelle `allDayChecked` avec animation framer-motion
- Ajouter `pointerEvents: 'none'` aux cartes futures en plus du `disabled`

