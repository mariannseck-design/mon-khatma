

# Récitation audio page par page avec 8 récitateurs

## Fichiers à créer

### `src/hooks/useQuranAudio.ts`
- Hook gérant la lecture séquentielle des versets d'une page
- Fetch `api.alquran.cloud/v1/page/{page}/{reciter}` pour obtenir les URLs MP3
- Lecture séquentielle avec `Audio` API native
- Expose : `play`, `pause`, `stop`, `isPlaying`, `currentAyahNumber`, `reciter`, `setReciter`, `loading`

### Récitateurs disponibles

| Nom | Edition ID |
|-----|-----------|
| Mishary Al-Afasy | ar.alafasy |
| Al-Husary | ar.husary |
| Abdul Samad | ar.abdulsamad |
| Al-Minshawi | ar.minshawi |
| Saad Al-Ghamidi | ar.saadalghamidi |
| Abdourahmane Al-Sudais | ar.abdurrahmaansudais |
| Al-Huthaify | ar.hudhaify |
| Ibrahim Al-Akhdar | ar.ibrahimakhdar |

## Fichiers à modifier

### `src/pages/QuranReaderPage.tsx`
- Intégrer `useQuranAudio` avec la page courante
- Ajouter bouton play/pause dans la barre inférieure (icône Play/Pause)
- Ajouter un `Select` pour choisir le récitateur
- Passer `highlightAyah` au composant `QuranTextView`
- Stopper l'audio au changement de page, relancer si `isPlaying`

### `src/components/quran/QuranTextView.tsx`
- Ajouter prop `highlightAyah?: number`
- Appliquer un fond doré léger (`bg-amber-100/40`) sur le verset en cours de récitation

## Coût estimé : 1-2 crédits

