

## Remplacer le message "Alhamdulillah" par les badges validés (Consolidation)

### Changement

Dans `src/components/muraja/MurajaChecklist.tsx`, quand `sortedItems.length === 0` et `section === 'tour'` et `hasTourBlocks` (lignes 127-184) :

- Supprimer le message "Alhamdulillah, révisions terminées !" avec l'icône PartyPopper
- Le remplacer par le même bloc compact de badges que le rabt (lignes 248-290), mais avec un fond **bleu-teal** (`rgba(20, 184, 166, 0.10)`, bordure `rgba(20, 184, 166, 0.25)`) pour se distinguer visuellement du rabt doré
- Le problème : dans ce cas `sortedItems` est vide (les items ont déjà été filtrés en amont dans MurjaPage). Il faudra donc passer les items validés via une nouvelle prop ou changer l'approche.

**Approche retenue** : Ce cas se produit quand `items` est vide mais `hasTourBlocks` est true. Les items validés ne sont plus dans `items` car filtrés avant. Il faut passer une nouvelle prop `checkedTourItems` contenant les items tour déjà validés aujourd'hui, pour les afficher en badges compacts.

### Fichiers modifiés

1. **`src/pages/MurjaPage.tsx`** — Passer les items tour validés au composant via une nouvelle prop `checkedTourItems`
2. **`src/components/muraja/MurajaChecklist.tsx`** :
   - Ajouter prop `checkedTourItems?: ChecklistItem[]`
   - Dans le bloc vide tour (lignes 127-184), afficher ces items en badges compacts teal au lieu du message Alhamdulillah
   - Conserver les "Prochaine révision" en dessous

