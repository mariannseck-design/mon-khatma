

## Plan : Corriger l'audio qui s'arrête en mi-récitation

### Diagnostic

Le bouton haut-parleur (`playOneAyahForCheck`) ne joue que le **premier verset** du passage (`ayahsRef.current[0]`), sans enchaîner les suivants. L'audio s'arrête donc après un seul verset au lieu de réciter tout le passage sélectionné.

### Correction dans `src/components/hifz/HifzStep3Memorisation.tsx`

1. **Remplacer `playOneAyahForCheck`** par une fonction qui enchaîne tous les versets du passage séquentiellement, en réutilisant la logique de `playNextAyah` existante.

2. **Ajouter un état `isPlaying`** pour permettre d'arrêter/reprendre l'audio en cliquant à nouveau sur le bouton haut-parleur (toggle play/pause).

3. **Feedback visuel** : animer l'icône Volume2 quand l'audio est en cours (couleur dorée au lieu de gris).

### Fichier modifié
- `src/components/hifz/HifzStep3Memorisation.tsx`

