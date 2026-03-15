

## Intégrer le Tajweed KSU sur les glyphes QCF V2

### Contrainte technique majeure
Les polices QCF V2 rendent chaque mot comme un glyphe unique (un seul caractère Unicode). Il est **impossible** de colorer des lettres individuelles au sein d'un glyphe. La seule approche compatible avec le rendu QCF V2 est le **tajweed au niveau du mot** : si un mot contient une règle de tajweed, tout le glyphe prend la couleur de la règle dominante.

### Palette KSU (extraite du screenshot officiel)
D'après le site KSU, le rendu tajweed utilise une palette très sobre, dominée par le rouge/marron et le noir :

| Règle | Couleur KSU | Hex |
|-------|------------|-----|
| Madd (prolongation) | Rouge brique foncé | `#A51B0B` |
| Qalqalah | Rouge clair / orange | `#C44536` |
| Ghunnah | Vert doux | `#2A7B3D` |
| Ikhfa / Iqlab | Bleu | `#1A6B8A` |
| Idghaam | Orange brique | `#D4790E` |
| Lettres muettes / Hamzat wasl | Gris | `#888888` |
| Lam Shamsiyyah | Gris foncé | `#636e72` |

### Fichiers modifiés

**`src/lib/tajweedData.ts`** :
- Remplacer `TAJWEED_COLORS` par la palette KSU ci-dessus
- Remplacer `TAJWEED_COLORS_NIGHT` par des versions légèrement plus claires de la même palette
- Ajouter une fonction `getWordTajweedColor(verseKey, wordText, wordPosition, annotations)` qui :
  1. Prend les annotations d'un verset
  2. Mappe les positions de caractères aux mots via `text_qpc_hafs`
  3. Retourne la couleur de la règle dominante du mot, ou `null` si aucune

**`src/components/quran/QuranMushafView.tsx`** :
- Ajouter les props `tajweedEnabled` et `darkMode` (darkMode existe déjà)
- Quand `tajweedEnabled === true` :
  - Charger les annotations tajweed via `getTajweedAnnotations()` pour chaque verset de la page
  - Pour chaque mot, calculer sa couleur tajweed basée sur les annotations qui chevauchent sa position dans le texte du verset
  - Appliquer cette couleur au `style.color` du `<span>` du glyphe QCF V2
- Quand `tajweedEnabled === false` : texte noir uni (comportement actuel)
- L'espacement, le fontSize et le layout ne changent absolument pas

**`src/pages/QuranReaderPage.tsx`** :
- Passer `tajweedEnabled` au composant `QuranMushafView`
- Le toggle existe déjà dans `ReaderSettingsPanel` mais n'est affiché qu'en mode texte offline. L'afficher aussi en mode texte/QCF V2 (quand `isOnline`)

### Logique de mapping mot ↔ annotations
Chaque verset a un `text_qpc_hafs` complet (concaténation des mots). Les annotations donnent des positions `[start, end]` dans ce texte. Pour chaque mot :
1. Calculer son offset dans le texte complet du verset (somme des longueurs des mots précédents + espaces)
2. Vérifier si une annotation chevauche cet intervalle
3. Prendre la règle avec la plus grande couverture → couleur du mot

