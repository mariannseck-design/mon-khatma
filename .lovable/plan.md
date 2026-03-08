

## Plan : Réorganiser la page Dhikr

### Résumé des changements

1. **Réordonner la grille** : Mettre les 8 cartes dhikr en premier, puis "Mes Émotions" et "Mes Favoris" tout en bas de la grille

2. **Supprimer "Réflexion du mois"** : Retirer complètement la Card de réflexion (lignes 436-445)

3. **Retirer la section Favoris de cette page** : Supprimer le `<FavoriteVersesSection />` et son ref, car les favoris restent dans "Mon Univers" sur l'accueil

4. **Transformer "Mes Favoris" en simple carte de navigation** : Au lieu de scrollIntoView, faire un `Link` vers `/accueil` avec l'onglet "univers" (ou naviguer vers la section favoris de l'accueil)

### Fichiers modifiés

**`src/pages/EmotionsPage.tsx`** :
- Réordonner la grille : d'abord les 8 dhikrCards, puis "Mes Émotions", puis "Mes Favoris"
- Supprimer `favorisSectionRef` et `<FavoriteVersesSection />`
- Supprimer la Card "Réflexion du mois"
- Changer "Mes Favoris" pour utiliser `Link to="/accueil"` (section Mon Univers)
- Supprimer l'import de `FavoriteVersesSection`

### Layout résultat

```text
┌──────────────────────────┐
│   MON DHIKR QUOTIDIEN    │
├────────────┬─────────────┤
│ Zikr du    │ Zikr du     │
│ matin      │ soir        │
├────────────┼─────────────┤
│ Après la   │ Toute       │
│ prière     │ occasion    │
├────────────┼─────────────┤
│ Sujud      │ Duas Omra   │
│ Tilawah    │             │
├────────────┼─────────────┤
│ Duas Hajj  │ Istikharah  │
├────────────┼─────────────┤
│ Mes        │ Mes         │
│ Émotions ↓ │ Favoris →   │
├────────────┴─────────────┤
│ [Section Émotions]       │
│ (humeur + gratitude +    │
│  moments précédents)     │
└──────────────────────────┘
```

