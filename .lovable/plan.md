

## Intégrer "Méthode Oustaz Mourad" dans la carte Hifz

### Approche

Transformer la carte "Espace Hifz" (lignes 388-429) en une carte conteneur avec deux sous-liens séparés par un séparateur visuel :

1. **Sous-lien 1** : "Espace Hifz" → `/hifz` (comportement actuel conservé, avec session active si applicable)
2. **Sous-lien 2** : "Méthode Oustaz Mourad" → `/methode-mourad` (nouveau lien avec icône BookHeart déjà importée)

### Design

- La carte garde le même gradient émeraude et le même arrondi `rounded-[2rem]`
- Retirer le `<Link>` qui englobe toute la carte
- Diviser l'intérieur en 2 zones cliquables séparées par une ligne fine `border-t` semi-transparente
- Chaque zone a son propre `<Link>` avec effet `whileTap`
- La partie Hifz garde l'icône Play/BookOpen et le texte session active
- La partie Mourad utilise l'icône BookHeart avec le texte "Méthode Oustaz Mourad" et sous-titre "Parcours guidé de mémorisation"

### Fichier modifié

`src/pages/AccueilPage.tsx` — lignes 388-429 (bloc ESPACE HIFZ)

