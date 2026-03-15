

## Corriger le rendu Mushaf QCF V2

Le composant `QuranMushafView.tsx` ne fonctionne pas car l'URL des polices est incorrecte. Voici les corrections basées sur la documentation officielle de Quran Foundation.

### Problèmes identifiés

1. **URL de police incorrecte** : `https://v4.quran.com/fonts/...` n'existe pas
   - Correct : `https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p${page}.woff2`

2. **Nom de police incorrect** : `QCF_P001` au lieu de `p1-v2`
   - Correct : `p${page}-v2` (sans padding)

3. **Marqueurs de fin de verset** : le code utilise actuellement la police KFGQPC pour les `end` markers, mais devrait utiliser `UthmanicHafs` avec `text_qpc_hafs`
   - Charger `UthmanicHafs` depuis `https://verses.quran.foundation/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2`

### Fichiers modifiés

**`src/components/quran/QuranMushafView.tsx`** :
- Corriger l'URL CDN des polices QCF V2
- Corriger le `familyName` en `p${page}-v2`
- Corriger la référence `fontFamily` dans le rendu
- Utiliser `UthmanicHafs` (chargée dynamiquement) pour les `end` markers au lieu de KFGQPC
- Utiliser `word.code_v2` aussi pour les end markers via la police QCF (comme dans l'API response, le code_v2 des end markers contient déjà le bon glyphe) — ou bien utiliser `text_qpc_hafs` avec UthmanicHafs selon la doc officielle

**`index.html`** :
- Mettre à jour l'URL `@font-face` de UthmanicHafs vers `https://verses.quran.foundation/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2`

