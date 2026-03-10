

## Plan : Découper les portions de révision par page du Mushaf

### Probleme

Les blocs de révision sont trop grands (ex: "Al-Baqara v. 1 → 69") car ils couvrent plusieurs pages du Mushaf d'un coup. Il faut les découper en portions cohérentes alignées sur les pages du Mushaf (~10-15 versets par portion).

### Solution

Modifier la logique d'injection des versets mémorisés pour découper chaque bloc en sous-blocs alignés sur les pages du Mushaf. Ainsi au lieu d'un seul bloc "Al-Baqara 1-69", on aura "Al-Baqara 1-5" (p.2), "Al-Baqara 6-16" (p.3), etc.

### Changements

**`src/lib/hifzUtils.ts`**

1. Ajouter une fonction `splitBlockByPages(surahNumber, verseStart, verseEnd)` qui utilise `getExactVersePage` et `getPageAyahs` pour découper un bloc en sous-blocs alignés par page du Mushaf
2. Modifier `surahsToVerseBlocks` pour utiliser cette fonction (ou la rendre async et l'appeler depuis le code appelant)
3. Modifier `injectMemorizedVerses` pour appliquer `splitBlockByPages` sur chaque bloc avant insertion, créant ainsi des lignes par page plutôt que par sourate entière

**`src/components/hifz/HifzGoalOnboarding.tsx`** (ou tout fichier appelant `surahsToVerseBlocks` + `injectMemorizedVerses`)

4. Adapter les appels pour passer les blocs découpés par page à `injectMemorizedVerses`

### Resultat attendu

- Al-Fatiha v. 1-7 reste un seul bloc (une seule page)
- Al-Baqara v. 1-69 devient ~10 blocs de ~5-10 versets chacun, alignés sur les pages du Mushaf
- Chaque portion dans la checklist Muraja'a correspond à une page du Mushaf, facilitant la révision

