

## Éclaircir le turquoise : passer au vert menthe doux

La couleur de référence de l'image est un **vert menthe pastel** (~`#8ed1c4` / `#a0d9ce`), bien plus clair que le turquoise foncé actuel (`#0d5c63`).

### Fichiers modifiés

**1. `AccueilPage.tsx`** — Carte "LE NOBLE CORAN" (admin + inactive, ~lignes 202 et 238)
- Fond : `linear-gradient(135deg, #8ed1c4, #a0d9ce)` au lieu de `#0d5c63`
- Bordure dorée conservée mais ajustée pour le fond clair
- Texte titre : passer à un or-bronze foncé (`#6b5417`) ou blanc pour lisibilité sur fond clair
- Icône : garder l'or `#d4af37`
- Ombres et overlays : ajuster les opacités pour le fond clair

**2. `QuranReaderPage.tsx`** — Barre d'outils inférieure (~lignes 321-323)
- Fond jour : `linear-gradient(135deg, #8ed1c4, #a0d9ce)`
- Fond nuit : version assombrie `#3a8a80`
- Texte/icônes : passer de `#f0e6c8` (clair) à `#2d3a25` ou `#1a3a3a` (foncé) pour contraste sur fond clair
- Bordures dorées : conserver

