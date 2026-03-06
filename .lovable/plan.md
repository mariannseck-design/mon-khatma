

## Amélioration du mode texte du Mushaf

### Modifications dans `src/components/quran/QuranTextView.tsx`

1. **Défilement vertical** — Supprimer `maxHeight: '100%'` du conteneur interne qui bloque le scroll. Le conteneur externe a déjà `overflow-y-auto`.

2. **Centrage pages spéciales (pages 1 & 2)** — Quand `page <= 2`, appliquer `justify-center items-center` et centrer le texte au lieu de `text-justify`.

3. **Basmala distincte** — Augmenter la taille de la Basmala de 20% (`computedFontSize * 1.2`) et appliquer `fontWeight: 'bold'`.

4. **Équilibrage dernière ligne** — Ajouter `textAlignLast: 'center'` sur le paragraphe des ayahs pour centrer les lignes orphelines.

### Modifications dans `src/pages/QuranReaderPage.tsx`

5. **4 niveaux de taille** — Remplacer `TEXT_SIZES` (3 niveaux) par 4 niveaux :
   - Petite (16px), Moyenne (22px, défaut), Grande (28px), Très Grande (36px)
   - Défaut = index 1 (Moyenne, 22px)

6. **Conserver** le bouton cyclique `AArrowUp` existant qui affiche le label de la taille courante.

### Résumé des changements

| Fichier | Lignes | Changement |
|---------|--------|------------|
| `QuranTextView.tsx` | 149-154 | Supprimer `maxHeight:'100%'`, ajouter padding bottom |
| `QuranTextView.tsx` | 136-146 | Ajouter centrage conditionnel pages 1-2 |
| `QuranTextView.tsx` | 172-184 | Basmala +20% taille, bold |
| `QuranTextView.tsx` | 189-196 | Ajouter `textAlignLast: 'center'` |
| `QuranReaderPage.tsx` | 48-56 | 4 niveaux de taille, défaut Moyenne (22px) |

