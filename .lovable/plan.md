

## Plan : Retirer la page Favoris inactive

La page `/favoris` est une page placeholder inactive (affiche "Aucun favori" et "Bientôt disponible"). Elle n'a rien à voir avec les versets favoris du Coran qui sont dans "Mon Univers".

### Modifications

1. **`src/components/layout/Navigation.tsx`** — Retirer l'entrée `{ path: '/favoris', icon: Heart, label: 'Favoris' }` de la barre de navigation (4 onglets au lieu de 5)

2. **`src/App.tsx`** — Retirer l'import `FavorisPage` et la route `/favoris`

3. **`src/hooks/useSwipeNavigation.ts`** — Retirer `'/favoris'` du tableau `SWIPE_PAGES`

4. **`src/pages/FavorisPage.tsx`** — Supprimer le fichier

### Ce qui ne change PAS
- Le bouton ❤️ dans le lecteur Coran reste
- La section "Mes Versets Favoris" dans Mon Univers reste
- La table `favorite_verses` reste intacte

