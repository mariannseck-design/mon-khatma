

## Plan : Supprimer le Mushaf flottant (FAB) globalement

Le FAB vert "Mushaf" en bas à gauche et le badge doré "Mushaf" en haut sont rendus par `HifzStepWrapper.tsx`. Ils apparaissent dans toutes les étapes qui passent `surahNumber`/`startVerse`/`endVerse` sans `disableMushafOverlay`.

### Changement — `src/components/hifz/HifzStepWrapper.tsx`

Supprimer entièrement :
1. **Le bouton doré "Mushaf"** dans le header (lignes ~89-98) — le petit badge vert à côté du verse info
2. **Le FAB flottant** (lignes ~133-155) — le bouton vert fixe en bas à gauche
3. **Le Sheet/overlay Mushaf** (lignes ~157-190) — le panneau qui s'ouvre en bas

Conserver uniquement le badge doré avec les infos de verset (📖 sourate · versets · page).

Cela supprime le Mushaf flottant dans **toutes** les étapes (Intention, Compréhension, Immersion, Validation, Tikrar) d'un seul coup, sans avoir à passer `disableMushafOverlay` partout.

On peut aussi retirer le state `mushafOpen`, l'import de `Sheet`/`SheetContent`, `ExternalLink`, `X`, `BookOpen`, et la prop `disableMushafOverlay` devenue inutile.

