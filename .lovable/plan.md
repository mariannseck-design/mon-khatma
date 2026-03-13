

## Plan : Ajouter les numéros de page aux blocs de versets

Deux écrans affichent des blocs de versets sans numéro de page. Il faut ajouter l'indication "p. X" (ou "p. X-Y" si multi-pages) à chacun.

### Fichiers modifiés

**1. `src/components/hifz/HifzDiagnostic.tsx`** (écran "Durée de liaison")
- Importer `getExactVersePage` depuis `@/lib/quranData`
- Ajouter un state `pageMap: Record<number, string>` (index du bloc → label page)
- Dans un `useEffect` sur `recentBlocks`, résoudre la page de chaque bloc via `getExactVersePage(surahNumber, verseStart)` et `getExactVersePage(surahNumber, verseEnd)` pour afficher "p. X" ou "p. X–Y"
- Ligne 429 : ajouter le label page après le nom de sourate/versets

**2. `src/components/hifz/HifzStep5Liaison.tsx`** (étape Liaison)
- Importer `getExactVersePage` depuis `@/lib/quranData`
- Ajouter un state `pageMap: Record<number, string>` (index → label)
- Résoudre les pages dans le `useEffect` existant après le fetch des blocs
- Ligne 96-98 : ajouter "p. X" sous ou à côté de "Versets X → Y"

### Format d'affichage

```text
Al-Baqara — v.70→119  (p. 11–18)
```

Ou sur une ligne séparée :
```text
Versets 70 → 119
p. 11–18
```

