
## Inverser les sections favoris : Ayat sur l'accueil, Invocations sur le Dhikr

### Situation actuelle
- **Accueil** : affiche `FavoriteDouasSection` (invocations) — devrait afficher les **versets favoris**
- **Dhikr** : aucune section favoris — devrait afficher les **invocations favorites**

### Changements

| # | Fichier | Action |
|---|---------|--------|
| 1 | `src/pages/AccueilPage.tsx` | Remplacer `FavoriteDouasSection` par `FavoriteVersesSection` (remettre comme avant) |
| 2 | `src/pages/DhikrPage.tsx` | Ajouter `FavoriteDouasSection` en haut de la grille des cartes dhikr |

### Détails
- **AccueilPage** : import `FavoriteVersesSection`, titre "Mes Versets Favoris"
- **DhikrPage** : import `FavoriteDouasSection`, l'afficher avant la grille des cartes pour que l'utilisateur voie ses invocations sauvegardées en accédant à la page Dhikr
