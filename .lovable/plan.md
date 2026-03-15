

## Plan : Lien Mushaf toujours visible + bouton audio permanent

### Problème
Le lien « Lire sur le Mushaf » n'apparaît que quand `isPlaying === true`. L'utilisateur ne voit rien tant qu'il n'a pas lancé l'audio — et le bouton audio lui-même peut être caché selon la phase.

### Solution

**Fichier unique : `src/components/hifz/HifzStep3Memorisation.tsx`**

1. **Rendre le lien Mushaf toujours visible** (ligne ~745) : retirer la condition `{isPlaying && ...}`. Le texte s'adapte selon l'état :
   - Si audio en cours : « 📖 Lire sur le Mushaf — l'audio continue en arrière-plan »
   - Sinon : « 📖 Lire sur le Mushaf »

2. **Rendre le bouton audio toujours visible** : déplacer le bouton audio (Volume2) **en dehors** des conditions `phase.audioProminent` / `phase.audioAvailable` pour qu'il soit accessible dans toutes les phases, positionné sous le compteur +1, de façon discrète.

3. Le lien Mushaf reste un `<button>` qui navigue vers `/quran-reader?page=X` via `getExactVersePage`.

### Résultat
L'utilisateur voit en permanence un petit bouton audio et un lien vers le Mushaf, quel que soit l'état de lecture ou la phase en cours.

