

## Changer la répartition des phases Tikrar : de 4 quarts à 5 cinquièmes

### Problème actuel
Les 4 phases sont réparties en **quarts égaux** (25% chacune). La phase 4 (texte masqué) ne représente que 1/4 des répétitions.

### Nouvelle répartition (basée sur la capture)
Diviser le total en **cinquièmes** : les 3 premières phases occupent chacune 1/5, et la phase 4 (mémoire) occupe les **2/5 restants**.

Exemple avec Hifz 30 : 1→6, 7→12, 13→18, dès la 19ème.

### Modification dans `src/components/hifz/HifzStep3Memorisation.tsx`

**Fonction `getQuarters`** (lignes 83-88) — renommer en `getPhaseBreaks` et recalculer :
```typescript
function getPhaseBreaks(target: number) {
  const q1End = Math.max(Math.floor(target / 5), 1);
  const q2End = Math.max(Math.floor(target * 2 / 5), q1End + 1);
  const q3End = Math.max(Math.floor(target * 3 / 5), q2End + 1);
  return { q1End, q2End, q3End };
}
```

Mettre à jour toutes les références de `getQuarters` → `getPhaseBreaks` (lignes 91, 131).

