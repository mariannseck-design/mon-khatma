

## Remplacer les Ayats Favoris par les Invocations Favorites dans la page Dhikr

### Problème
La page Dhikr (`/emotions` — `EmotionsPage.tsx`) affiche actuellement la section "Mes Ayats Favoris" (`FavoriteVersesSection`), alors que cette même section existe déjà sur la page d'accueil. Il faut la remplacer par "Mes Invocations Favorites" (`FavoriteDouasSection`).

### Changement

**`src/pages/EmotionsPage.tsx`** :
- Remplacer l'import de `FavoriteVersesSection` par `FavoriteDouasSection` (de `@/components/favoris/FavoriteDouasSection`)
- Remplacer `<FavoriteVersesSection />` (ligne 358) par `<FavoriteDouasSection />`
- Mettre à jour le commentaire "Mes Versets Favoris" → "Mes Invocations Favorites"

Un seul fichier modifié, deux lignes changées.

