

## Plan : Navigation par page/juz/sourate + application automatique des versets

### Probleme 1 : Pas de navigation par page ou juz dans les parametres
Actuellement, le panneau Parametres ne propose que "Choisir une sourate" via le SurahDrawer. Il manque la navigation par numero de page et par juz.

### Probleme 2 : Les versets debut/fin ne naviguent pas automatiquement
Quand l'utilisateur saisit un verset debut/fin, rien ne se passe visuellement. Il faudrait naviguer automatiquement vers la page Mushaf correspondante.

### Modifications

#### 1. `src/components/quran/ReaderSettingsPanel.tsx`
- Ajouter deux nouveaux champs de navigation dans le bloc groupe (sourate + versets) :
  - **Input "Page"** : champ numerique (1-604) qui appelle un nouveau callback `onGoToPage`
  - **Input "Juz"** : champ numerique (1-30) qui calcule la page de debut du juz (page = (juz-1)*20 + 1 approximativement, ou utiliser un mapping precis) et appelle `onGoToPage`
- Layout : une rangee avec 2 colonnes "Page" et "Juz" au-dessus du bouton sourate
- Nouveaux props : `onGoToPage: (page: number) => void`, `currentPage: number`

#### 2. `src/pages/QuranReaderPage.tsx`
- Passer `onGoToPage={goToPage}` et `currentPage={page}` au ReaderSettingsPanel
- Ajouter un callback `onAudioStartVerseChange` et `onAudioEndVerseChange` enrichi qui, apres la mise a jour du verset, appelle `getExactVersePage(surahNumber, verse)` pour naviguer automatiquement vers la bonne page Mushaf
- Utiliser `getExactVersePage` de `src/lib/quranData.ts` pour obtenir la page exacte

#### 3. Mapping Juz → Page
Utiliser un tableau statique des 30 juz avec leur page de debut (donnee standard du Mushaf de Medine) directement dans le composant ou dans un utilitaire.

### Fichiers modifies
- `src/components/quran/ReaderSettingsPanel.tsx` — ajouter inputs page/juz + props
- `src/pages/QuranReaderPage.tsx` — passer props + auto-navigation sur changement de verset

