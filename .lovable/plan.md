

## Ajout du sélecteur de récitateur à l'étape 3 (Tikrar)

### Constat
- L'étape 2 (Imprégnation) a déjà un sélecteur de récitateur avec la liste complète `RECITERS`.
- L'étape 3 (Mémorisation) lit le récitateur depuis `localStorage` (`quran_reciter`) mais n'offre aucune UI pour le changer. De plus, l'étape 2 ne persiste pas son choix dans `localStorage`, donc les deux étapes sont désynchronisées.

### Changements

**1. `src/components/hifz/HifzStep2Impregnation.tsx`**
- Initialiser `reciter` depuis `localStorage` (`quran_reciter`) au lieu de `'ar.alafasy'` en dur.
- Persister le choix dans `localStorage` quand il change.

**2. `src/components/hifz/HifzStep3Memorisation.tsx`**
- Importer `RECITERS` et `getAyahAudioUrl` depuis `useQuranAudio`.
- Transformer `reciter` en état React (au lieu d'une simple lecture localStorage).
- Ajouter un `<select>` de récitateur, visible uniquement quand l'audio est disponible (phases 1 et 2).
- Persister le choix dans `localStorage`.
- Adapter le chargement audio pour utiliser `getAyahAudioUrl` (everyayah) comme fallback, comme le fait déjà l'étape 2.

### UI du sélecteur (étape 3)
Même style que l'étape 2 : un `<select>` natif stylé avec fond semi-transparent, placé sous les contrôles audio (phases 1-2 uniquement).

Deux fichiers modifiés.

