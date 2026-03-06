

# Palette « Olive du Levant » pour le lecteur Mushaf

## Palette de couleurs

```text
Fond application :  #f7f3eb  (crème chaud)
Barres/Boutons :    #7a8b6f  (vert sauge mat)
Boutons hover/actif:#5e6e54  (vert olive foncé)
Texte titre :       #2d3a25  (vert forêt très foncé)
Texte secondaire :  #f0ead9  (crème clair, sur fond vert)
Icônes :            #e8e2d0  (ivoire, sur fond vert)
Fond Mushaf :       #ffffff  (blanc pur — inchangé)
Accent actif :      #8fa07e  (sauge clair pour autoplay actif)
Page counter :      #5e6e54  (vert olive)
```

## Fichier impacte : `src/pages/QuranReaderPage.tsx`

### Fond principal
- Remplacer le gradient `#fefdfb → #f9f6f0` par `#f7f3eb → #ede8dc` (crème chaud)

### Barre du haut
- Gradient overlay : `rgba(42, 58, 37, 0.6)` (vert forêt semi-transparent) au lieu de `rgba(62, 50, 28, 0.55)`
- Boutons (retour, Aa, toggle) : `rgba(122, 139, 111, 0.35)` (vert sauge translucide) au lieu de `rgba(184, 149, 46, 0.25)`
- Texte surah/page : couleur crème `#f0ead9` (reste lisible sur fond vert)
- Icônes : `#e8e2d0`

### Barre du bas
- Gradient overlay : `rgba(42, 58, 37, 0.6)` au lieu de `rgba(62, 50, 28, 0.55)`
- Tous les boutons : même vert sauge translucide `rgba(122, 139, 111, 0.35)`
- Icônes : `#e8e2d0`
- Compteur de page : `#8fa07e` (vert sauge clair) au lieu de `#d4af37`
- Slider labels : `rgba(240, 234, 217, 0.8)`
- Bouton autoplay actif : `rgba(122, 139, 111, 0.55)`
- Repeat icon actif : `#8fa07e`
- Reciter select : fond `rgba(122, 139, 111, 0.35)`, bordure `rgba(122, 139, 111, 0.5)`

### Zone de contenu Mushaf
- Le `QuranTextView` garde son fond `#fefdfb` (blanc quasi pur) — aucun changement dans ce fichier. Les pages se detachent naturellement sur le fond creme.

### Aucun changement dans `QuranTextView.tsx`
Le fond blanc pur du texte coranique reste intact pour le contraste "Mushaf sur pupitre".

