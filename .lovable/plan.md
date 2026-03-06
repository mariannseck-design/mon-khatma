

# Refonte typographique et sélecteur de taille pour le Mushaf

## Problemes identifies

1. **Police Amiri = italique/inclinee** -- La police Amiri a un style calligraphique penche. Il faut passer a une police Uthmani droite et stable.
2. **Fond trop stylise** -- Le gradient beige sable actuel manque de contraste. Passer a un blanc net / blanc casse.
3. **Pinch-to-zoom inutilisable** -- Le zoom natif est peu pratique sur mobile. Remplacer par un selecteur de taille predefinies.

## Modifications

### 1. `index.html` -- Charger la police KFGQPC Uthmani
Ajouter un lien Google Fonts pour "Scheherazade New" (police Uthmani academique, droite, stable, disponible sur Google Fonts) en remplacement d'Amiri.

### 2. `src/components/quran/QuranTextView.tsx`
- Remplacer `fontFamily: "'Amiri'"` par `"'Scheherazade New', 'Traditional Arabic', serif"` partout
- Accepter une nouvelle prop `fontSize` (number en px) pour controler dynamiquement la taille du texte et du line-height
- Fond du conteneur : blanc casse `#fefdfb` au lieu du fond transparent actuel
- Ajuster le line-height proportionnellement au fontSize

### 3. `src/pages/QuranReaderPage.tsx`
- **Fond** : changer le gradient vers un blanc casse leger (`#fefdfb` -> `#f9f6f0`)
- **Sélecteur de taille "AA"** : ajouter un bouton icone "AA" dans la barre du haut (a cote du bouton texte/image), qui ouvre un petit panneau avec 4 niveaux prédéfinis :
  - Petit (20px)
  - Moyen (24px) -- defaut
  - Grand (30px)
  - Tres Grand (36px)
- Stocker le choix dans `localStorage` (`quran_text_size`)
- Passer la valeur a `QuranTextView` via la prop `fontSize`
- Le panneau se ferme au tap exterieur
- Barres de controle : adapter les couleurs de texte pour le nouveau fond clair (texte sombre au lieu de creme)

### 4. Adaptation des barres de controle
Les barres haut/bas utilisent actuellement du texte creme (`#f5edd6`) sur fond sombre semi-transparent. Avec le fond blanc, garder les barres semi-transparentes sombres -- le contraste reste bon, pas de changement necessaire sur les barres.

## Fichiers impactes
- `index.html` (1 ligne)
- `src/components/quran/QuranTextView.tsx`
- `src/pages/QuranReaderPage.tsx`

