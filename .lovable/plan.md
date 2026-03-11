

## Ajouter la sélection par page Mushaf dans HifzConfig

### Approche

Ajouter un toggle **Sourate / Page** en haut du formulaire. En mode "Page", remplacer le sélecteur de sourate et les champs versets par des champs **Page début** et **Page fin** (1-604). Une seule page est possible (même valeur début/fin).

Au clic sur "Commencer", les pages sont converties en surah/versets via `getPageAyahs` (déjà disponible dans `quranData.ts`), puis le `onStart` existant est appelé normalement. Si la plage couvre plusieurs sourates, on prend la première sourate trouvée sur la page de début.

### Modifications — `src/components/hifz/HifzConfig.tsx`

1. **Nouveau state** : `selectionMode: 'surah' | 'page'`, `startPage`, `endPage`
2. **Toggle UI** : Deux boutons "Sourate" / "Page" stylés comme les niveaux de répétition (gold active)
3. **Mode Page** : Affiche 2 champs numériques (Page début / Page fin, 1-604) au lieu du sélecteur de sourate + versets
4. **Logique onStart** : En mode page, appel async à `getPageAyahs` pour résoudre la première sourate et la plage de versets de la page, puis appel `onStart({ surahNumber, startVerse, endVerse, repetitionLevel })`
5. **Import** : Ajouter `getPageAyahs` depuis `@/lib/quranData`

Aucun autre fichier modifié. Le reste du tunnel Hifz reçoit toujours le même format `{ surahNumber, startVerse, endVerse, repetitionLevel }`.

