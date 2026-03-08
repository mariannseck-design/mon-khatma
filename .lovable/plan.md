

## Plan : Créer la section Premium "Les Sources de Lumière"

### Architecture

Nouvelle page `src/pages/SourcesDeLumierePage.tsx` accessible via `/sources-de-lumiere`, avec une carte premium sur le dashboard (AccueilPage) qui y renvoie.

La page contient 3 onglets internes avec animations de transition :
1. **Le Noble Coran** — Versets coraniques sous forme d'invocations
2. **La Sunna Sacrée** — Invocations prophétiques authentiques
3. **Salawat** — Prières sur le Prophète Muhammad (ﷺ) avec mode turbo

### Fichiers à créer

**`src/lib/sourcesLumiereData.ts`** (~200 lignes)
- `QURAN_INVOCATIONS` : ~12 versets-invocations majeurs (Al-Fatiha, Âyat al-Kursî, fin Al-Baqarah, Al-Hashr 22-24, Ibrâhîm 40-41, etc.)
- `SUNNA_INVOCATIONS` : ~12 duas prophétiques (istikhara, voyage, repas, entrée mosquée, etc.) avec (عليه السلام) pour chaque Prophète mentionné
- `SALAWAT` : ~8 formules de salât sur le Prophète (ﷺ) (Ibrahimiya, Nariya, Tunjina, etc.) avec `target` élevé (10, 33, 100)
- Chaque item avec `source` (référence hadith/coran), honorifiques systématiques

**`src/components/sources-lumiere/SourcesSession.tsx`** (~80 lignes)
- Variante de DhikrSession adaptée avec bouton "Partager" (Web Share API / copie presse-papier)
- Format partagé : arabe + traduction + lien app

**`src/components/sources-lumiere/SalawatCounter.tsx`** (~100 lignes)
- Compteur spécial "mode turbo" : maintien prolongé du doigt = incrémentation rapide (intervalles de 150ms)
- Cercle de progression identique au DhikrCounter mais avec paliers visuels (10, 33, 100)
- Retour haptique adapté (léger en turbo, fort aux paliers)

**`src/pages/SourcesDeLumierePage.tsx`** (~150 lignes)
- 3 tuiles luxueuses plein écran au lieu d'onglets classiques :
  - Noble Coran : fond parchemin, icône BookOpenCheck dorée
  - Sunna Sacrée : fond émeraude dégradé, icône Heart dorée
  - Salawat : fond vert profond #065F46, icône Star dorée
- AnimatePresence pour transitions douces entre menu et session
- Réutilise `DhikrSession` pour Coran et Sunna, `SalawatCounter` pour Salawat

### Fichiers à modifier

**`src/pages/AccueilPage.tsx`** (~15 lignes)
- Ajouter une carte "Les Sources de Lumière" dans l'onglet Principal, après le Noble Coran
- Design premium : bordure dorée épaisse (3px #D4AF37), fond dégradé parchemin/or, icône Sparkles
- `Link to="/sources-de-lumiere"`

**`src/App.tsx`** (~3 lignes)
- Ajouter la route protégée `/sources-de-lumiere` → `SourcesDeLumierePage`

### Design premium

La carte sur le dashboard se distingue par :
- Bordure dorée 3px `#D4AF37`
- Fond : `linear-gradient(135deg, #faf8f5, #f5e6c8)`
- Icône Sparkles dorée avec halo lumineux (blur)
- Sous-titre : "Coran · Sunna · Salawat"

### Bouton Partager

Présent sur chaque invocation dans la session, utilisant l'API Web Share :
```
Contenu : "{arabe}\n\n{traduction}\n\n— {source}\n\nDécouvre l'app Ma Khatma : https://www.makhatma.com"
```
Fallback : copie dans le presse-papier avec toast de confirmation.

### Mode Turbo Salawat

- `onTouchStart` / `onMouseDown` déclenche un intervalle de 150ms
- `onTouchEnd` / `onMouseUp` arrête l'intervalle
- Tap simple = +1, maintien = incrémentation continue
- Vibration légère (10ms) en turbo, forte (30ms) aux paliers de 10

