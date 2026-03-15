

## Plan : Ajouter un bouton "Mushaf" au MiniPlayer

### Idée

Quand l'audio joue en arrière-plan, l'utilisatrice devrait pouvoir ouvrir le Mushaf directement depuis le MiniPlayer pour suivre la récitation visuellement — sans perdre l'audio.

### Modification

**`src/components/layout/MiniPlayer.tsx`** :

Ajouter un petit bouton icône `BookOpen` (📖) entre les infos du track et le bouton play/pause. Au clic, il navigue vers `/quran-reader` avec la page correspondante si possible.

Pour déterminer la page Mushaf, on enrichit `AudioTrackInfo` dans `AudioContext.tsx` avec un champ optionnel `surahNumber` et `startVerse`. Le MiniPlayer utilisera `getExactVersePage()` pour calculer la page et naviguer vers `/quran-reader?page=X`.

### Détail des fichiers

1. **`src/contexts/AudioContext.tsx`** — Étendre `AudioTrackInfo` :
   ```ts
   interface AudioTrackInfo {
     label: string;
     returnPath: string;
     surahNumber?: number;
     startVerse?: number;
   }
   ```

2. **`src/components/layout/MiniPlayer.tsx`** — Ajouter un bouton `BookOpen` :
   - Importer `BookOpen` de lucide-react et `getExactVersePage` de quranData
   - Au clic : calculer la page via `getExactVersePage(surahNumber, startVerse)` puis `navigate(/quran-reader?page=X)`
   - Style : même taille que le bouton Stop (w-8 h-8), fond subtil vert `rgba(5,150,105,0.15)`
   - N'afficher le bouton que si `trackInfo.surahNumber` est défini

3. **3 composants Hifz** (`HifzStep3Memorisation`, `HifzStepIntentionImpregnation`, `HifzStepImpregnationTajweed`) — Passer `surahNumber` et `startVerse` dans l'appel `registerAudio` :
   ```ts
   registerRef.current(audio, { label, returnPath, surahNumber, startVerse })
   ```

### Résultat

Le MiniPlayer affichera un petit bouton 📖 qui ouvre le Mushaf à la bonne page, permettant de suivre visuellement la récitation audio en cours.

