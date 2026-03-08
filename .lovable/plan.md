

## Remplacer "Mes Versets Favoris" par "Mes Invocations Favorites" sur l'accueil

### Constat
La section `FavoriteVersesSection` dans l'onglet "Mon Univers" affiche les versets favoris du Coran (table `favorite_verses`). L'utilisateur veut que cette section montre les **invocations/duas favorites** (système `useDouaFavorites` basé sur localStorage).

### Changements

**1. Créer `src/components/favoris/FavoriteDouasSection.tsx`**
- Nouveau composant qui remplace `FavoriteVersesSection` dans le contexte dhikr/zikr
- Utilise le hook `useDouaFavorites` existant pour lire les favoris
- Affiche le nombre d'invocations sauvegardées et les catégories
- Au clic, redirige vers la page Douas avec la vue favoris (`/douas?view=favorites`)
- Même style visuel que FavoriteVersesSection (carte arrondie, icône coeur, chevron)

**2. Modifier `src/pages/AccueilPage.tsx`**
- Remplacer l'import et l'utilisation de `FavoriteVersesSection` par `FavoriteDouasSection`
- Titre : "Mes Invocations Favorites" au lieu de "Mes Versets Favoris"

**3. Conserver `FavoriteVersesSection`**
- Le composant et la page `/favoris` restent disponibles pour les versets favoris (utilisés depuis le Mushaf), mais ne sont plus affichés dans l'onglet "Mon Univers"

