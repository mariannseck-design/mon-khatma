

## Plan : Ajouter les Adhkâr du soir (أذكار المساء)

### Changements

**1. `src/lib/adhkarData.ts`** — Ajouter un nouveau tableau `EVENING_ADHKAR: DhikrItem[]`

Les adhkâr du soir sont très similaires à ceux du matin avec des adaptations :
- Mêmes sourates protectrices (Âyat al-Kursî, Al-Ikhlâs, Al-Falaq, An-Nâs) — identiques
- Formules du soir adaptées : "أَمْسَيْنا" au lieu de "أَصْبَحْنا", "هذه اللَّيلة" au lieu de "هذا اليوم"
- Sayyid al-Istighfâr (version soir)
- Mêmes invocations communes (Tawakkul, Protection, Santé, Pardon, etc.)
- Tasbîh, Tahlîl, Istighfâr (100x chacun)
- ~28-31 items au total avec les bons targets

**2. `src/pages/DhikrPage.tsx`** — 2 modifications mineures :
- Importer `EVENING_ADHKAR`
- Activer la carte "Zikr du soir" (`enabled: true`)
- Ajouter l'entrée `evening` dans `CATEGORY_DATA`

### Fichiers modifiés
- `src/lib/adhkarData.ts` (ajout ~350 lignes)
- `src/pages/DhikrPage.tsx` (3 lignes)

