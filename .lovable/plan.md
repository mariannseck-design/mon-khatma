

## Indicateur hors-ligne pour le lecteur Coran

### Comportement
- Quand l'utilisateur passe hors-ligne (`navigator.onLine` + événements `online`/`offline`) :
  - Une petite bannière discrète apparaît en haut du lecteur Coran : "Mode hors-ligne · Texte uniquement"
  - Si l'utilisateur est en mode image, basculer automatiquement vers le mode texte
  - Désactiver le bouton audio (play/pause) car le streaming audio ne fonctionne pas hors-ligne
  - Dans le panneau de réglages, griser l'option "Image" avec une indication "Hors-ligne"
- Quand l'utilisateur revient en ligne :
  - La bannière disparaît avec une animation fade-out
  - Les modes image et audio redeviennent disponibles

### Fichiers à modifier

1. **`src/hooks/useOnlineStatus.ts`** (nouveau) — Hook simple utilisant `navigator.onLine` + event listeners `online`/`offline`

2. **`src/pages/QuranReaderPage.tsx`** — Utiliser le hook, afficher la bannière, forcer le mode texte si hors-ligne, désactiver audio

3. **`src/components/quran/ReaderSettingsPanel.tsx`** — Recevoir une prop `isOffline` pour griser le mode image et l'audio

### Design de la bannière
- Position fixe en haut du lecteur, petite hauteur (~28px)
- Fond ambre/orange doux, texte petit, icône wifi-off
- Animation fade in/out avec framer-motion

