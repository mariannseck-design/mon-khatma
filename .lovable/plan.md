

## Plan : Afficher les versets favoris intégralement

### Problème
Dans `FavoriteVersesSection.tsx`, le texte arabe est tronqué à 120 caractères et la traduction à 150 caractères (lignes ~130-137 du fichier). Cela empêche l'affichage complet des versets.

### Correction : `src/components/favoris/FavoriteVersesSection.tsx`

- Supprimer la troncature du texte arabe : retirer le `slice(0, 120) + '…'` conditionnel
- Supprimer la troncature de la traduction : retirer le `slice(0, 150) + '…'` conditionnel
- Afficher les textes complets directement

### Fichier modifié
- `src/components/favoris/FavoriteVersesSection.tsx` — lignes ~130-137

