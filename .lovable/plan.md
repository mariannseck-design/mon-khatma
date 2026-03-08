

## Plan : Citation du jour — texte simple centré

### Modification : `src/components/accueil/DailyQuote.tsx`

Retirer le fond coloré, la bordure et le style "carte". Afficher uniquement le texte centré avec l'icône, sans surbrillance.

- Supprimer `background`, `border`, `rounded-2xl` du conteneur
- Passer de `flex items-start` à `flex flex-col items-center text-center`
- Icône au-dessus du texte, centrée
- Couleur du texte : `var(--p-text-65)` (texte muted standard) au lieu du vert forcé
- Icône en `var(--p-text-55)`

### Fichier modifié
- `src/components/accueil/DailyQuote.tsx`

