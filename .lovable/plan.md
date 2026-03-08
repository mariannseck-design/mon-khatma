

## Choix Mushaf Image / Texte — Étapes 2 (Écoute) et 3 (Mémorisation) + Mode Secours

### Contexte
L'utilisatrice veut pouvoir choisir entre le **Mushaf Image** (pages tajweed en image) et le **Mushaf Texte** (texte arabe inline actuel) dans :
1. Le **Mode Secours** de l'étape 1 (relecture 3 fois)
2. L'**étape 2 — Imprégnation** (écoute 3 fois)
3. L'**étape 3 — Mémorisation** (tikrar)

### Solution
Ajouter un **toggle Image / Texte** en haut de la zone d'affichage du Coran dans ces 3 composants. Le choix est persisté dans `localStorage` (`hifz_mushaf_mode`) pour être cohérent entre les étapes.

### Composant Mushaf Image
Créer un petit composant réutilisable `HifzMushafImage` qui :
- Reçoit `surahNumber`, `startVerse`, `endVerse`
- Calcule la page Mushaf via `getExactVersePage()` (déjà existant dans `quranData.ts`)
- Affiche l'image depuis le CDN existant : `https://cdn.jsdelivr.net/gh/QuranHub/quran-pages-images@main/easyquran.com/hafs-tajweed/{page}.jpg`
- Gère le fallback source et le chargement
- Si les versets couvrent plusieurs pages, permet de naviguer entre elles

### Fichiers modifiés

1. **`src/components/hifz/HifzMushafImage.tsx`** (nouveau) — Composant réutilisable affichant la page Mushaf image pour une plage de versets donnée.

2. **`src/components/hifz/HifzStep1Revision.tsx`** — Dans le mode secours (`rescueMode`), ajouter un toggle Image/Texte au-dessus du bloc arabe. En mode image, afficher `HifzMushafImage` au lieu du texte inline.

3. **`src/components/hifz/HifzStep2Impregnation.tsx`** — Ajouter le même toggle Image/Texte au-dessus du `renderedText`. En mode image, remplacer le texte par `HifzMushafImage`.

4. **`src/components/hifz/HifzStep3Memorisation.tsx`** — Ajouter le toggle quand `phaseInfo.showText === true`. En mode image, afficher `HifzMushafImage` au lieu du texte tajweed inline.

### UI du toggle
Deux boutons côte à côte, style ToggleGroup compact :
- 🖼 Image
- 📝 Texte

Style doré/transparent cohérent avec le design existant. Le choix est mémorisé dans `localStorage`.

