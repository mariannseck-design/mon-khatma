

## Plan : 3 corrections pour le lecteur Coran

### 1. Tajwid activé par défaut
**Fichier** : `src/pages/QuranReaderPage.tsx` (ligne 49)

Actuellement : `localStorage.getItem('quran_tajweed') === 'true'` → `false` quand aucune valeur n'est stockée.

Correction : inverser la logique — par défaut `true` sauf si explicitement désactivé :
```ts
localStorage.getItem('quran_tajweed') !== 'false'
```

### 2. Versets début/fin fonctionnels dans les paramètres
**Fichier** : `src/components/quran/ReaderSettingsPanel.tsx` (lignes 306-349)

Les inputs "Du verset" / "Au verset" existent et sont câblés aux props `audioStartVerse`/`audioEndVerse` qui contrôlent la plage audio. Le problème est probablement que les inputs ne réagissent pas visuellement ou que le type `number` pose problème sur mobile. Correction :
- Passer les inputs en `type="text"` + `inputMode="numeric"` (comme dans HifzConfig) pour éviter le bug mobile
- Ajouter `onFocus` pour sélectionner le texte au tap
- Ajouter `fontSize: 16px` pour éviter le zoom iOS

### 3. Message de bienvenue première visite
**Fichier** : `src/pages/QuranReaderPage.tsx`

Ajouter un pop-up élégant affiché une seule fois (clé localStorage `quran_reader_intro_seen`) qui informe l'utilisatrice :
- Qu'elle peut choisir entre le **Mushaf image** (Tajwid couleur) et le **mode Texte**
- Qu'elle peut changer à tout moment via l'icône ⚙️ Paramètres en bas à droite
- Bouton "J'ai compris" pour fermer et ne plus afficher

Style : modal centré, fond semi-transparent, esthétique crème/dorée cohérente avec le thème.

### Fichiers modifiés
| Fichier | Action |
|---|---|
| `src/pages/QuranReaderPage.tsx` | Tajwid défaut `true` + pop-up bienvenue |
| `src/components/quran/ReaderSettingsPanel.tsx` | Fix inputs versets mobile |

