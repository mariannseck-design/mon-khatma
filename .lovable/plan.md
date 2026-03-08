

## Plan : Activer tous les modules désactivés pour les admins

### Changement dans `src/pages/DhikrPage.tsx`

1. Importer `useAuth` depuis `@/contexts/AuthContext`
2. Récupérer `isAdmin` dans le composant
3. Remplacer la condition `card.enabled` par `card.enabled || isAdmin` pour :
   - Le clic sur la carte (ligne ~100 : `if (card.enabled)`)
   - Le badge "Bientôt disponible" (ligne ~104 : `{!card.enabled && ...}`)
   - L'animation `whileTap` (ligne ~102)

Les cartes désactivées (Toute occasion, Sujud Tilawah, Duas Omra, Duas Hajj, Istikharah) deviendront cliquables pour les admins et le badge disparaîtra. Elles n'auront pas encore de données dans `CATEGORY_DATA`, donc cliquer dessus ne lancera pas de session (comportement gracieux existant).

### Fichier modifié
- `src/pages/DhikrPage.tsx` (~5 lignes)

