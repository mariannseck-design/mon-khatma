

# Refonte du rendu texte Coran — Espacement Mushaf Uthmani/Madani + Layout épuré

## Analyse de l'espacement actuel vs souhaité

| Paramètre | Actuel | Souhaité (référence) |
|-----------|--------|---------------------|
| `lineHeight` | `fontSize × 2.3` (très aéré) | `fontSize × 1.6–1.7` (plus compact, style Mushaf imprimé) |
| `wordSpacing` | `3px` (serré) | `6–8px` (mots plus espacés horizontalement) |
| `letterSpacing` | aucun | `0.02–0.04em` (légère aération entre les lettres) |
| Disposition | Paragraphe continu (`<span>` inline) | Verset par ligne (`display: block`) |
| Numéros versets | ﴿n﴾ en olive, petits | Cercles colorés (vert / rouge multiples de 5) |
| En-tête sourate | Nom arabe seul | Numéro cercle + nom arabe + nom français |
| Basmala | 1.2× taille, vert olive | 1.3× taille, vert foncé, espacement plus généreux |
| Police | KFGQPC Uthmanic Script HAFS (déjà correcte) | Idem — confirmé |

## Changements techniques

### `src/components/quran/QuranTextView.tsx`

1. **Interligne** : Réduire le multiplicateur de `2.3` à `1.65` pour un rendu plus compact, fidèle au Mushaf imprimé
2. **Espacement des mots** : Augmenter `wordSpacing` de `3px` à `7px` pour aérer horizontalement
3. **Espacement des lettres** : Ajouter `letterSpacing: '0.03em'`
4. **Layout verset par ligne** : Chaque verset dans un `div` block centré au lieu de `span` inline dans un `<p>` justifié
5. **Numéros de versets** : Cercles inline colorés (~18px), fond vert `#2E7D32` par défaut, rouge `#D50000` pour multiples de 5, chiffre blanc
6. **En-tête sourate** : Cercle vert avec numéro + nom arabe + nom français
7. **Basmala** : Facteur 1.3×, vert foncé `#2d5a2d`, `letterSpacing: '0.05em'`
8. **Conserver** : API `quran-tajweed`, `renderTajweed()`, `TAJWEED_COLORS`, interactions de sélection

### `src/lib/surahData.ts`

- Ajouter un champ `nameFr` (nom français) aux 114 sourates pour l'en-tête (ex: "La Vache", "La Famille d'Imran"...)

