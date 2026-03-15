

## Améliorer le rendu du texte coranique

### Comment font les apps professionnelles

Les apps comme **Ayat**, **Al Quran** et **Tanzil** utilisent des techniques spécifiques :

1. **Police spécialisée Mushaf** : Elles utilisent la police **KFGQPC Uthmanic Script HAFS** (ou similaire), spécialement conçue pour reproduire le rendu exact du Mushaf de Médine. Notre police actuelle "Amiri Quran" est bonne mais n'atteint pas ce niveau de fidélité calligraphique.

2. **Rendu page-fidèle** : Chaque page affiche exactement les mêmes lignes que le Mushaf imprimé (mode image que tu as déjà).

3. **Tajweed natif dans la police** : Certaines utilisent des polices avec les couleurs tajweed intégrées via OpenType, pas du code couleur appliqué après coup.

### Ce qu'on peut améliorer concrètement

**Changement principal** : Remplacer la police "Amiri Quran" par **"KFGQPC HAFS Uthmanic Script"** (police libre, utilisée par quran.com et tanzil.net). Cette police :
- Reproduit fidèlement le style calligraphique du Mushaf de Médine
- Gère mieux les ligatures complexes et les signes de tajweed
- A un espacement et un rendu des harakat (diacritiques) supérieur

**Fichiers modifiés** :
- `index.html` — charger la police KFGQPC via un CDN (fonts.qurancomplex.gov.sa ou CDN alternatif)
- `src/components/quran/QuranTextView.tsx` — mettre à jour `FONT_FAMILY` pour utiliser la nouvelle police en priorité
- `src/components/mourad/MouradVerseTextView.tsx` — idem
- Ajuster le `line-height` et `word-spacing` pour s'adapter à la nouvelle police (elle est plus grande que Amiri)

### Limite réaliste

Le rendu **pixel-perfect identique au Mushaf** n'est atteignable qu'en mode image (que tu as déjà). En mode texte, avec KFGQPC on s'en rapprochera fortement — c'est la même police que quran.com utilise.

