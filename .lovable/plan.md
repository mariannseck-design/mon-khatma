

## Finalisation de la page HifzSuiviTestPage

### Modifications

**1. Couleurs : utiliser les variables de l'app au lieu du teal hardcodé**
- Remplacer le gradient de fond `from-[hsl(175,40%,12%)]` par les CSS variables de l'app (`var(--p-bg)`, `var(--p-card)`, etc.)
- Remplacer toutes les classes `text-teal-*`, `bg-teal-*`, `border-teal-*` par les variables CSS du thème (`var(--p-primary)`, `var(--p-text-75)`, `var(--p-border)`, etc.)

**2. Corriger le calcul du pourcentage**
- Actuellement : `memorizedVerseCount / (pagesInJuz * 15)` → donne ~1% car 15 versets/page × 20 pages = 300 versets estimés par Juz
- Correction : calculer le **vrai nombre de versets dans chaque Juz** en sommant les `versesCount` des sourates qui tombent dans le range de pages du Juz (variable `totalVerses` déjà calculée mais pas utilisée). Utiliser `totalVerses` au lieu de `approxTotalVerses`

**3. Cacher les Juz vides (2-30) avec un toggle**
- Par défaut, n'afficher que les Juz qui ont des données (memorizedVerses > 0)
- Ajouter un bouton toggle "Voir tous les Juz" / "Masquer les Juz vides" en bas de la grille
- Quand activé, afficher les 30 Juz ; quand désactivé, seulement ceux avec des données

**4. Ajouter les CTAs contextuels**
- "Apprendre du nouveau →" lien vers `/hifz`
- "Réviser l'ancien →" lien vers `/muraja`
- Style pilule émeraude avec `ChevronRight`, comme sur la page principale

### Fichier modifié
- `src/pages/HifzSuiviTestPage.tsx`

