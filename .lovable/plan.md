

## Plan : Masquer la carte Méthode Oustaz Mourad (réactivable)

Commenter le bloc JSX de la carte Mourad (lignes 298-367) dans `HifzHubPage.tsx` en l'enveloppant dans un flag booléen `SHOW_MOURAD_CARD = false`. Le code reste intact, il suffit de passer le flag à `true` pour la réactiver.

### Fichier : `src/pages/HifzHubPage.tsx`

1. Ajouter une constante `const SHOW_MOURAD_CARD = false;` en haut du fichier (après les imports)
2. Envelopper le bloc `<motion.div>` Mourad (lignes 298-367) dans `{SHOW_MOURAD_CARD && ( ... )}`
3. La logique `detectActiveMouradSession` et le state associé restent en place (pas d'effet de bord si la carte est masquée)

