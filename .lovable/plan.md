

## Correction du calcul des pages

### Problème

Le calcul actuel (`total / 15 = 5 pages`) est une approximation grossière. Tes acquis couvrent réellement les pages 1 à 9 du Mushaf (anciens acquis p.1–5, nouveaux acquis p.6–9 soit 61 versets). Le ratio fixe de 15 versets/page ne reflète pas la réalité car certaines pages contiennent plus ou moins de versets.

### Solution

**Fichier : `src/pages/MurajaHubPage.tsx`**

Remplacer le calcul approximatif par un comptage exact des pages Mushaf réelles :

1. Utiliser `getExactVersePage` (déjà importé) pour déterminer les pages Mushaf exactes de chaque portion mémorisée.
2. Collecter toutes les pages distinctes dans un `Set<number>` → la taille du Set = nombre réel de pages.
3. Pour la sourate dominante : compter les pages uniquement liées à cette sourate.
4. Afficher les deux informations :
   - Ligne gauche : `{dominantMemorized} / {dominantTotal} versets`
   - Ligne droite : `{totalDistinctPages} pages` (toutes sourates confondues, basé sur les pages Mushaf réelles)

Le `useMemo` actuel (lignes 95–115) deviendra un `useEffect` + `useState` car `getExactVersePage` est asynchrone.

### Fichiers modifiés

| Fichier | Action |
|---|---|
| `src/pages/MurajaHubPage.tsx` | Calcul pages via `getExactVersePage` au lieu de `total / 15` |

