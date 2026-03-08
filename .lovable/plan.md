

## Plan : Ajouter une 3ème carte "Mes Favoris" dans la grille Bien-Être

### Modification

**`src/pages/EmotionsPage.tsx`** :
- Importer `Heart` (déjà importé) et `FavoriteVersesSection` n'est pas nécessaire ici — la carte sera un lien
- Passer la grille de `grid-cols-2` à `grid-cols-3` 
- Ajouter une 3ème carte **"Mes Favoris"** avec l'icône `Heart`, qui redirige vers la section favoris sur l'accueil ou qui affiche les favoris directement en dessous (comme pour Émotions)
- Puisque `FavoriteVersesSection` existe déjà comme composant autonome, la carte scrollera vers une nouvelle section favoris ajoutée sous la section Émotions, avec le composant `FavoriteVersesSection` intégré

### Détail
- Grille : `grid-cols-3 gap-3`, retirer `aspect-[4/3]` pour un ratio plus compact adapté à 3 colonnes
- Carte "Mes Favoris" : icône Heart rouge, scrolle vers `favorisSectionRef` en bas de page
- Ajouter `FavoriteVersesSection` importé depuis `@/components/favoris/FavoriteVersesSection` dans une nouvelle section entre la section Émotions et la réflexion du mois

### Fichier modifié
- `src/pages/EmotionsPage.tsx`

