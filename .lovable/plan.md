

## Ajouter la traduction Hamidullah à l'étape 2 (Imprégnation)

L'étape 0 (Intention) affiche déjà la traduction Hamidullah, mais l'étape 2 (Imprégnation & Sens) ne montre que l'image Mushaf et l'audio sans traduction. Le plan est d'ajouter un bloc de traduction sous l'image Mushaf dans `HifzStep2Impregnation.tsx`.

### Modifications

**`src/components/hifz/HifzStep2Impregnation.tsx`** :
- Ajouter un état `translation` et un `useEffect` qui fetch `https://api.alquran.cloud/v1/surah/{surahNumber}/fr.hamidullah` (même logique que Step0)
- Filtrer les versets par `startVerse` → `endVerse`
- Afficher un bloc dépliable (collapsible) sous l'image Mushaf avec le titre "Traduction — Hamidullah" et les versets traduits
- Style cohérent : fond semi-transparent, bordure dorée, texte `text-white/70`
- Le bloc sera fermé par défaut pour ne pas surcharger l'écran, avec un bouton "Voir la traduction" pour l'ouvrir

### Détails techniques
- Fetch API identique à `HifzStep0Intention` : `fr.hamidullah` via alquran.cloud
- État toggle `showTranslation` pour afficher/masquer
- Spinner de chargement pendant le fetch
- Zone scrollable `max-h-48` pour les longues plages de versets

