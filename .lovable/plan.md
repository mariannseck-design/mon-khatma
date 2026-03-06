

# Correction de 5 bugs dans le lecteur Mushaf

## Bugs identifiés

1. **Navigation par swipe ne fonctionne pas en mode texte** -- Le gestionnaire de swipe (`drag`/`onDragEnd`) est uniquement attaché au `motion.div` du mode image. En mode texte, `QuranTextView` n'a aucun support swipe.

2. **Ecran non zoomable** -- Le conteneur texte a `overflow-hidden` et aucun support pinch-to-zoom.

3. **Sélecteur de récitateur disparaît trop vite** -- Le timer auto-hide (4s) masque la barre de contrôle entière, y compris le menu de sélection du récitateur ouvert.

4. **Basmala manquante** -- L'API `quran-tajweed` n'inclut pas la Basmala dans le texte des versets (sauf Al-Fatiha). Il faut l'ajouter manuellement quand `numberInSurah === 1` et que la sourate n'est ni Al-Fatiha (1) ni At-Tawbah (9).

## Fichiers à modifier

### `src/pages/QuranReaderPage.tsx`
- Envelopper le `QuranTextView` dans un `motion.div` avec `drag="x"` et `onDragEnd` pour supporter le swipe en mode texte (même logique que le mode image)
- Quand `showReciterSelect` est `true`, annuler le timer auto-hide pour laisser le temps de choisir
- Réactiver le timer quand le sélecteur se ferme

### `src/components/quran/QuranTextView.tsx`
- Ajouter la Basmala (`بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ`) au-dessus du texte quand la première ayah du groupe a `numberInSurah === 1`, sauf pour les sourates 1 et 9
- Permettre le zoom tactile en changeant le style du conteneur (retirer les contraintes qui bloquent le pinch-zoom)

## Estimation : 1 crédit

