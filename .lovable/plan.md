

# Passage à quran-uthmani — Sans tajweed

## Changement unique : `src/components/quran/QuranTextView.tsx`

1. **URL API** : `quran-tajweed` → `quran-uthmani`
2. **Supprimer** : constante `TAJWEED_COLORS` et fonction `renderTajweed()`
3. **Rendu simplifié** : afficher `ayah.text` directement dans le `<span>`, sans parsing
4. **Tout le reste inchangé** : layout justifié, `textAlignLast: 'center'`, séparateurs de sourates, cercles verts, Basmala, surlignage au clic

