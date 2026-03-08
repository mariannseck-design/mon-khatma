

## Plan : 5 Corrections Lecteur Coran

### 1. Audio : plage de versets ignorée
**Problème** : `fetchAndPlay` dans `useQuranAudio.ts` capture `startVerse`/`endVerse` dans sa closure mais n'est pas dans la liste de dépendances du `useCallback`. Quand l'utilisateur change la plage, l'audio continue sur tous les versets.

**Correction** (`src/hooks/useQuranAudio.ts`) :
- Ajouter `startVerse, endVerse` aux dépendances de `fetchAndPlay`
- Ajouter un `useEffect` qui stoppe et relance l'audio quand `startVerse` ou `endVerse` changent pendant la lecture

### 2. Favoris inactifs en mode texte
**Problème** : En mode texte, cliquer un verset dans `QuranTextView` ne fait que le surligner (`selectedAyah`). Il n'y a pas de lien vers le `VerseTranslationDrawer` (qui contient le bouton ❤️).

**Correction** (`src/components/quran/QuranTextView.tsx` + `src/pages/QuranReaderPage.tsx`) :
- Ajouter un callback `onVerseSelect?: (verseKey: string) => void` à `QuranTextView`
- Au clic sur un verset, appeler `onVerseSelect('surah:verse')`
- Dans `QuranReaderPage`, passer ce callback et mettre à jour `selectedVerse` + `pageVerses` pour ouvrir le drawer

### 3. Basmala en double
**Problème** : La Basmala est affichée en vert par le header ET reste dans le texte du verset 1. La fonction `stripLeadingBasmala` est censée la retirer mais peut échouer sur certaines variantes.

**Correction** : Renforcer la détection dans `stripLeadingBasmala` en normalisant les caractères de contrôle avant la comparaison des mots.

### 4. Renommer "Couleurs Tajwid" → "Tajwid"
**Correction** (`src/components/quran/ReaderSettingsPanel.tsx` ligne 243) :
- Remplacer `Couleurs Tajwid` par `Tajwid`
- Retirer l'icône `Palette`

### 5. Supprimer traductions Montada et Pickthall
**Correction** (`src/components/quran/ReaderSettingsPanel.tsx` lignes 6-11) :
- Garder uniquement `fr.hamidullah` et `en.sahih`
- Supprimer `fr.leclerc` et `en.pickthall`

### Fichiers modifiés

| Fichier | Changements |
|---|---|
| `src/hooks/useQuranAudio.ts` | Fix dépendances fetchAndPlay + useEffect verse range |
| `src/components/quran/QuranTextView.tsx` | Ajouter callback onVerseSelect |
| `src/pages/QuranReaderPage.tsx` | Connecter QuranTextView au VerseTranslationDrawer |
| `src/components/quran/ReaderSettingsPanel.tsx` | Renommer Tajwid, supprimer 2 traductions |

