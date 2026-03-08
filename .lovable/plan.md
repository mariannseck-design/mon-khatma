

## Plan : 3 corrections pour le lecteur Coran

### 1. Déplacer les champs "Du verset / Au verset" au-dessus de "Choisir une sourate"
**Fichier** : `src/components/quran/ReaderSettingsPanel.tsx`

Les inputs de plage de versets sont actuellement en bas dans la section Audio (lignes 338-393). Les déplacer juste après le Header (ligne 123) et avant le bouton "Choisir une sourate" (ligne 126). Garder le même style mais les rendre indépendants de la section audio.

### 2. Corriger l'audio de Ghamidi
**Fichier** : `src/hooks/useQuranAudio.ts`

Le dossier `Sa3d_Al-Ghamidi/128kbps` n'existe pas sur everyayah.com. Le vrai dossier est `Ghamadi_40kbps`. Corriger la ligne 13 :
```ts
{ id: 'ea.ghamidi', name: 'Saad Al-Ghamidi', source: 'everyayah', folder: 'Ghamadi_40kbps' }
```

### 3. Persister le viewMode dans localStorage
**Fichier** : `src/pages/QuranReaderPage.tsx`

Le `viewMode` est initialisé en dur à `'image'` (ligne 45). Il faut :
- Lire depuis `localStorage.getItem('quran_view_mode')` au démarrage
- Sauvegarder dans localStorage à chaque changement via un wrapper `handleViewModeChange`

```ts
const [viewMode, setViewMode] = useState<'image' | 'text'>(() => {
  const saved = localStorage.getItem('quran_view_mode');
  return saved === 'text' ? 'text' : 'image';
});

const handleViewModeChange = (mode: 'image' | 'text') => {
  setViewMode(mode);
  localStorage.setItem('quran_view_mode', mode);
};
```

Passer `handleViewModeChange` au lieu de `setViewMode` dans les props de `ReaderSettingsPanel`.

### Fichiers modifiés

| Fichier | Action |
|---|---|
| `src/components/quran/ReaderSettingsPanel.tsx` | Déplacer verse range inputs en haut |
| `src/hooks/useQuranAudio.ts` | Fix dossier Ghamidi → `Ghamadi_40kbps` |
| `src/pages/QuranReaderPage.tsx` | Persister viewMode dans localStorage |

