

## Plan : Refonte SM-2 avec intervalles spécifiques et cap à 40 jours

### Changements

**1. `src/lib/sm2Config.ts`**
- Modifier `interval4` de 14 → 15 jours (bouton "Très Facile - Dans 15 jours")
- Ajouter `maxInterval: 40` au config
- Supprimer la lecture localStorage (plus de config utilisateur) : retourner toujours les valeurs fixes
- Conserver `saveSM2Config` / `resetSM2Config` comme no-ops pour ne pas casser les imports existants

**2. `src/hooks/useMurajaData.ts` — fonction `computeSM2`**
- Appliquer `Math.min(config.maxInterval, newInterval)` à chaque branche
- Ajuster les coefficients EF conformément aux specs (inchangé sauf cap)

**3. `src/components/hifz/HifzStep6Tour.tsx`**
- Mettre à jour les labels des boutons pour inclure le délai : `🔴 Difficile - Demain`, `🟠 Moyen - Dans 3 jours`, `🟢 Facile - Dans 7 jours`, `🔵 Très Facile - Dans 15 jours`
- Ajouter le texte "Comment s'est passée votre récitation ?" au-dessus des boutons (déjà présent, ajuster si besoin)
- Appliquer `maxInterval = 40` dans le calcul SM-2 local de ce composant
- Changer `interval4` de 14 → 15

**4. `src/pages/MurajaRevisionPage.tsx`** (si les boutons de rating y existent aussi)
- Vérifier et appliquer les mêmes labels et le cap à 40 jours

### Résumé des règles
- Premier intervalle : 1j / 3j / 7j / 15j selon auto-évaluation
- Intervalles suivants : `ancien_intervalle × facteur_facilité` (ajusté par qualité)
- Cap absolu : `min(calculé, 40)` — aucune portion ne dépasse 40 jours sans révision
- Pas de configuration utilisateur exposée

