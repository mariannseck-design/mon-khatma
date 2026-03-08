

## Probleme identifie et correction

Le clic sur un verset favori fonctionne mais de maniere peu intuitive :

1. **Zone cliquable trop petite** : Seul le petit bouton "Al-Ma'ida : 18" en haut a gauche navigue vers le Mushaf. Le reste de la carte (texte arabe, traduction) n'est pas cliquable. L'utilisatrice clique probablement sur le texte du verset sans effet.

2. **Page approximative** : Le code utilise `getApproxVersePage` (interpolation lineaire) au lieu de `getExactVersePage` (donnees exactes du Mushaf). Cela peut amener a la mauvaise page.

### Corrections

**`src/components/favoris/FavoriteVersesSection.tsx`**

1. Rendre **toute la carte cliquable** (pas seulement le petit bouton surah:verse) pour naviguer vers le Mushaf.
2. Utiliser `getExactVersePage` (async, depuis `quranData.ts`) au lieu de `getApproxVersePage` pour obtenir la page exacte du verset.
3. Garder le bouton surah:verse comme indicateur visuel, mais aussi rendre le contenu (arabe + traduction) cliquable avec un feedback visuel (cursor pointer, hover).
4. Ajouter un petit indicateur visuel ("Toucher pour ouvrir dans le Mushaf") pour guider l'utilisatrice.

