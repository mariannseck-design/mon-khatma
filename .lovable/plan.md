

## Plan : Rendre les cartes Dhikr cliquables sur la page Émotions

### Problème
La page `/emotions` (EmotionsPage) affiche 8 cartes dhikr toutes marquées "Bientôt" et non cliquables. La page `/dhikr` (DhikrPage) avec le compteur interactif existe mais n'est pas accessible depuis cette grille.

### Solution
Modifier `EmotionsPage.tsx` pour rendre la carte **"Zikr du matin"** cliquable — elle naviguera vers `/dhikr` qui contient déjà le module interactif complet.

### Changements dans `src/pages/EmotionsPage.tsx`

1. Ajouter un champ `enabled: boolean` et `route: string` aux objets `dhikrCards` :
   - "Zikr du matin" → `enabled: true, route: '/dhikr'`
   - Les 7 autres → `enabled: false`

2. Rendre la carte cliquable avec `navigate(card.route)` quand `enabled === true`

3. Masquer le badge "Bientôt" pour les cartes `enabled`

4. Ajouter `cursor-pointer` et un effet `whileTap` pour les cartes actives

### Fichier modifié
- `src/pages/EmotionsPage.tsx`

