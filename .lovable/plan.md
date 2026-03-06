

## Correction des couleurs Tajweed selon le modele de reference

### Probleme

Les couleurs actuelles suivent la palette technique de l'API Al-Quran.cloud, mais l'utilisateur souhaite un mapping correspondant au modele de reference classique des Mushaf colores :

| Regle | Code | Couleur actuelle | Couleur demandee |
|-------|------|-----------------|-----------------|
| Ghunnah | `g` | `#FF7E1E` (orange) | VERT |
| Idgham avec Ghunnah | `a` | `#169777` (vert) | VERT |
| Ikhfa | `f` | `#9400A8` (violet) | VERT |
| Ikhfa Shafawi | `c` | `#D500B7` (rose) | VERT |
| Qalqalah | `q` | `#DD0008` (rouge) | BLEU |
| Iqlab | `i` | `#26BFFD` (bleu clair) | VERT |
| Madd (n,p,m,o) | n/p/m/o | Bleu | ROUGE/ORANGE |

### Modification : `src/components/quran/QuranTextView.tsx`

Remplacer `TAJWEED_COLORS` avec la palette suivante, alignee sur le modele de reference des Mushaf colores :

```typescript
const TAJWEED_COLORS: Record<string, string> = {
  h: '#AAAAAA',   // Hamzat ul Wasl (gris)
  s: '#AAAAAA',   // Silent (gris)
  l: '#AAAAAA',   // Lam Shamsiyyah (gris)
  n: '#D50000',   // Madd Normal - ROUGE
  p: '#E53935',   // Madd Permissible - ROUGE
  m: '#B71C1C',   // Madd Necessary - ROUGE FONCE
  o: '#C62828',   // Madd Obligatory - ROUGE
  q: '#1565C0',   // Qalqalah - BLEU
  c: '#2E7D32',   // Ikhfa Shafawi - VERT
  f: '#388E3C',   // Ikhfa - VERT
  w: '#2E7D32',   // Idgham Shafawi - VERT
  i: '#2E7D32',   // Iqlab - VERT
  a: '#1B5E20',   // Idgham avec Ghunnah - VERT FONCE
  u: '#1B5E20',   // Idgham sans Ghunnah - VERT FONCE
  d: '#A1A1A1',   // Idgham Mutajanisayn (gris)
  b: '#A1A1A1',   // Idgham Mutaqaribayn (gris)
  g: '#2E7D32',   // Ghunnah - VERT
};
```

Aucune autre modification necessaire. Seule la table de couleurs change.

