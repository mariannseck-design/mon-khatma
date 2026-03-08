

## Plan : Harmoniser la traduction entre le texte inline et le drawer

### Problème identifié
Deux API différentes sont utilisées pour la même traduction Hamidullah :
- **Mode texte inline** : `api.alquran.cloud/v1/page/{page}/fr.hamidullah`
- **Drawer (panneau bas)** : `api.quran.com/api/v4/verses/by_key/{key}?translations=136`

Ces deux sources donnent des variantes légèrement différentes du texte Hamidullah (ex: "C'est le Livre au sujet duquel..." vs "Voici le Livre à propos duquel...").

### Correction

**`src/components/quran/VerseTranslationDrawer.tsx`** — Remplacer l'appel à `api.quran.com` par `api.alquran.cloud` avec l'édition `fr.hamidullah`, identique au mode texte :

```
https://api.alquran.cloud/v1/ayah/{surah}:{ayah}/fr.hamidullah
```

Cela garantit que la traduction affichée dans le drawer correspond exactement à celle affichée en mode texte avec traduction.

### Fichier modifié
- `src/components/quran/VerseTranslationDrawer.tsx` — modifier la fonction `fetchTranslation` pour utiliser `api.alquran.cloud` au lieu de `api.quran.com`

