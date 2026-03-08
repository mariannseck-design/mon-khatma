

## Deux thèmes visuels pour la page Hifz avec Toggle de test

### Ce qui sera fait

Ajouter un sélecteur de thème temporaire en haut de la page Hifz permettant de basculer entre deux fonds visuels pour le conteneur principal (le `div` avec `GRADIENT_STYLE`).

### Les deux thèmes

**Thème A — "An-Nur" (Dégradé Sacré)**
- `radial-gradient(ellipse at center, #FCFBF9 0%, rgba(22,155,76,0.05) 100%)`
- Fond lumineux blanc crème au centre, vert émeraude translucide sur les bords
- Texte coranique en couleur sombre (`#2a2a2a`) pour contraste optimal avec Tajweed

**Thème B — "Parchemin de Médine"**
- Fond `#F9F6EE` avec un filtre CSS `url(data:image/svg+xml,...)` générant un bruit fin (noise SVG en base64)
- Effet papier mat subtil, texte sombre pour lisibilité Tajweed

### Ajustements transversaux par thème clair
- Couleur du texte coranique : passer de `#e8e0d0` (crème sur fond sombre) à `#1a1a1a` (noir sur fond clair)
- Couleurs Tajweed inchangées (rouge, vert, bleu) — contraste excellent sur fond clair
- Ombres portées des cartes : `rgba(0,0,0,0.05)` diffuses
- Textes d'interface (labels, compteurs) : ajuster de `white/80` à `#3a3a3a` etc.
- Numéros de versets (badges verts) : inchangés, lisibles sur les deux fonds

### Toggle temporaire
- Ajout d'un state `hifzTheme` (`'teal' | 'nur' | 'parchemin'`) dans `HifzPage.tsx` avec persistance `localStorage`
- Petit toggle 3 boutons en haut du conteneur : `🌊 Teal` / `☀️ An-Nur` / `📜 Parchemin`
- `GRADIENT_STYLE` remplacé dynamiquement selon le thème sélectionné
- Les composants enfants (Step2, Step3, Step4) reçoivent un prop `theme` pour adapter leurs couleurs internes

### Fichiers impactés
- `src/pages/HifzPage.tsx` — state du thème, toggle UI, style dynamique, passage du prop `theme`
- `src/components/hifz/HifzStep2Impregnation.tsx` — adapter les couleurs texte/fond selon le prop `theme`
- `src/components/hifz/HifzStep3Memorisation.tsx` — idem
- `src/components/hifz/HifzStep4Validation.tsx` — idem
- `src/components/hifz/HifzStepWrapper.tsx` — adapter les couleurs de la barre de progression et du texte

