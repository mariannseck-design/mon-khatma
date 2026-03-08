

## Plan: Améliorations du lecteur Coran

### 1. Désactiver le mode texte (sans le supprimer)
- Dans `ReaderSettingsPanel.tsx`: masquer le toggle "Mushaf / Texte" et la section taille de texte
- Dans `QuranReaderPage.tsx`: forcer `viewMode = 'image'` (ignorer la valeur sauvegardée)
- Le code de `QuranTextView` reste intact, prêt à être réactivé

### 2. Fixer la page image (pas de scroll, zoom autorisé)
- Dans `QuranReaderPage.tsx`: ajouter `overflow: hidden` sur le conteneur de l'image pour empêcher tout défilement vertical
- Conserver le pinch-to-zoom et le double-tap zoom existants

### 3. Améliorer la précision de sélection des versets
- Dans `ImageVerseOverlay.tsx`: le système actuel mappe par **ligne** (15 zones), ce qui crée des décalages
- Ajuster les offsets `topOffset` / `bottomOffset` pour mieux aligner les zones de frappe avec le texte réel du Mushaf
- Affiner les marges (top ~8%, bottom ~8% pour les pages normales) pour coller au texte imprimé

### 4. Choix verset début/fin pour la récitation audio
- Dans `ReaderSettingsPanel.tsx`: ajouter deux champs numériques "Du verset" / "Au verset" dans la section audio
- Passer `startVerse` et `endVerse` au hook `useQuranAudio`
- Dans `useQuranAudio.ts`: filtrer les ayahs chargées pour ne jouer que celles dans la plage sélectionnée
- Ajouter les props nécessaires dans l'interface

### 5. Ajouter Al-Ghamidi aux récitateurs
- Dans `useQuranAudio.ts`: ajouter `{ id: 'ar.saabormedien', name: 'Al-Ghamidi' }` à la liste `RECITERS`
- L'identifiant API alquran.cloud pour Saad Al-Ghamidi est `ar.saoodshuraym` ou similaire -- je vérifierai l'ID exact disponible sur l'API

### Fichiers modifiés
- `src/hooks/useQuranAudio.ts` -- ajout récitateur + filtre plage versets
- `src/components/quran/ReaderSettingsPanel.tsx` -- masquer mode texte, ajouter champs versets
- `src/pages/QuranReaderPage.tsx` -- forcer mode image, fixer overflow
- `src/components/quran/ImageVerseOverlay.tsx` -- ajuster alignement zones de frappe

