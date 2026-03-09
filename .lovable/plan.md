

## Plan : Date d'aujourd'hui + Correction critique du calcul pages→versets

### 1. Affichage de la date du jour (AccueilPage)

**`src/pages/AccueilPage.tsx`** : Ajouter sous le greeting (ligne ~217) une ligne avec la date formatée en français :

```
Lundi 9 mars
```

Utiliser `new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })` avec première lettre en majuscule.

---

### 2. BUG CRITIQUE : `pageRangeToVerseBlocks` utilise une interpolation linéaire fausse

**Problème racine** : La fonction `pageRangeToVerseBlocks` dans `src/lib/hifzUtils.ts` calcule `versesPerPage = Math.ceil(versesCount / surahPages)` puis fait une multiplication linéaire. Pour Al-Baqara (286 versets, 48 pages), ça donne ~6 versets/page, mais la distribution réelle n'est pas uniforme. Pages 1-5 donne versets 1-30 approximativement, mais pages 6-10 recalcule depuis le début de la sourate et donne 25-54 au lieu de 30-69.

**Solution** : Réécrire `pageRangeToVerseBlocks` pour utiliser les données **exactes** du fichier `quran-uthmani.json` via `getPageAyahs()` (déjà disponible dans `quranData.ts`). La fonction devient `async` et itère sur chaque page demandée, récupère les ayahs exactes de cette page, et construit les blocs avec les vrais numéros de versets.

**`src/lib/hifzUtils.ts`** — Réécriture de `pageRangeToVerseBlocks` :

```typescript
export async function pageRangeToVerseBlocks(startPage: number, endPage: number) {
  const blocks: { surahNumber: number; verseStart: number; verseEnd: number }[] = [];

  for (let page = startPage; page <= endPage; page++) {
    const ayahs = await getPageAyahs(page);
    for (const ayah of ayahs) {
      const existing = blocks.find(b => b.surahNumber === ayah.surah.number);
      if (existing) {
        existing.verseStart = Math.min(existing.verseStart, ayah.numberInSurah);
        existing.verseEnd = Math.max(existing.verseEnd, ayah.numberInSurah);
      } else {
        blocks.push({
          surahNumber: ayah.surah.number,
          verseStart: ayah.numberInSurah,
          verseEnd: ayah.numberInSurah,
        });
      }
    }
  }
  return blocks;
}
```

**`src/components/hifz/HifzDiagnostic.tsx`** — Adapter les appels (lignes 167-174) car la fonction devient `async`. Le `useMemo` qui appelle `pageRangeToVerseBlocks` doit être converti en `useEffect` + état, ou les appels doivent être awaités dans le handler de confirmation.

### Résumé des fichiers modifiés
1. **`src/lib/hifzUtils.ts`** — Réécriture de `pageRangeToVerseBlocks` avec données exactes
2. **`src/components/hifz/HifzDiagnostic.tsx`** — Adapter les appels async
3. **`src/pages/AccueilPage.tsx`** — Ajouter la date du jour sous le greeting

