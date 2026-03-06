

## Correction des couleurs Tajweed - Alignement exact avec l'API Al-Quran.cloud

### Probleme identifie

Les mappings de couleurs dans `TAJWEED_COLORS` sont **presque tous faux**. En comparant avec la documentation officielle de l'API (https://alquran.cloud/tajweed-guide), voici les erreurs :

| Code | Regle | Couleur actuelle (FAUSSE) | Couleur officielle API |
|------|-------|---------------------------|----------------------|
| `l` | Lam Shamsiyyah | `#DD0000` (rouge) | `#AAAAAA` (gris) |
| `n` | Madd Normal | `#169777` (vert) | `#537FFF` (bleu) |
| `q` | Qalqalah | `#4050FF` (bleu) | `#DD0008` (rouge) |
| `i` | Iqlab | `#992299` (violet) | `#26BFFD` (bleu clair) |
| `o` | Madd Obligatoire | `#FF7E1E` (orange) | `#2144C1` (bleu) |
| `m` | Madd Necessaire | `#D50000` (rouge) | `#000EBC` (bleu fonce) |
| `f` | Ikhfa | `#FF7E1E` (orange) | `#9400A8` (violet) |
| `w` | Idgham Shafawi | `#999999` (gris) | `#58B800` (vert) |
| `a` | Idgham avec Ghunnah | `#4050FF` (bleu) | `#169777` (vert) |
| `u` | Idgham sans Ghunnah | `#169777` | `#169200` (vert) |
| `b` | Idgham Mutaqaribayn | `#4050FF` (bleu) | `#A1A1A1` (gris) |
| `r` | Code inexistant | `#FF4500` | A supprimer |
| `k` | Code inexistant | `#169777` | A supprimer |

Codes manquants : `p` (Madd Permissible), `c` (Ikhfa Shafawi), `d` (Idgham Mutajanisayn), `g` (Ghunnah).

### Modification : `src/components/quran/QuranTextView.tsx`

Remplacer `TAJWEED_COLORS` par les couleurs officielles exactes de l'API :

```typescript
const TAJWEED_COLORS: Record<string, string> = {
  h: '#AAAAAA',   // Hamzat ul Wasl
  s: '#AAAAAA',   // Silent
  l: '#AAAAAA',   // Lam Shamsiyyah
  n: '#537FFF',   // Madd Normal (2 vowels)
  p: '#4050FF',   // Madd Permissible (2,4,6 vowels)
  m: '#000EBC',   // Madd Necessary (6 vowels)
  o: '#2144C1',   // Madd Obligatory (4-5 vowels)
  q: '#DD0008',   // Qalqalah
  c: '#D500B7',   // Ikhfa Shafawi
  f: '#9400A8',   // Ikhfa
  w: '#58B800',   // Idgham Shafawi
  i: '#26BFFD',   // Iqlab
  a: '#169777',   // Idgham with Ghunnah
  u: '#169200',   // Idgham without Ghunnah
  d: '#A1A1A1',   // Idgham Mutajanisayn
  b: '#A1A1A1',   // Idgham Mutaqaribayn
  g: '#FF7E1E',   // Ghunnah (2 vowels)
};
```

Supprimer les codes inexistants (`r`, `k`). Aucune autre modification necessaire -- la logique de parsing `renderTajweed` fonctionne correctement.

