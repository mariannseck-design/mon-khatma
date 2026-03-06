

## Palette Tajweed stricte — 4 couleurs uniques

### Modification unique : `src/components/quran/QuranTextView.tsx` (lignes 20-38)

Remplacer `TAJWEED_COLORS` par exactement 4 couleurs, une par categorie :

```typescript
const TAJWEED_COLORS: Record<string, string> = {
  // GRIS — lettres muettes
  h: '#AAAAAA',   // Hamzat ul Wasl
  s: '#AAAAAA',   // Silent
  l: '#AAAAAA',   // Lam Shamsiyyah
  d: '#AAAAAA',   // Idgham Mutajanisayn
  b: '#AAAAAA',   // Idgham Mutaqaribayn
  // ROUGE — Madd (prolongations)
  n: '#D50000',   // Madd Normal
  p: '#D50000',   // Madd Permissible
  m: '#D50000',   // Madd Necessary
  o: '#D50000',   // Madd Obligatory
  // BLEU — Qalqalah (vibrations)
  q: '#1565C0',
  // VERT — nasalisations (Ghunna, Ikhfa, Idgham)
  c: '#2E7D32',   // Ikhfa Shafawi
  f: '#2E7D32',   // Ikhfa
  w: '#2E7D32',   // Idgham Shafawi
  i: '#2E7D32',   // Iqlab
  a: '#2E7D32',   // Idgham avec Ghunnah
  u: '#2E7D32',   // Idgham sans Ghunnah
  g: '#2E7D32',   // Ghunnah
};
```

4 couleurs strictes : `#AAAAAA` (gris), `#D50000` (rouge), `#1565C0` (bleu), `#2E7D32` (vert). Aucune nuance, aucune variation.

