

## Plan : Mise à jour de la page Suivi Hifz

### 1. Renommer les titres des blocs d'action

**`src/pages/HifzSuiviPage.tsx`**
- Ligne 336 : "Programme de mémorisation" → "Ar-Rabt (Nouveau)"
- Ligne 378 : "À réviser" → "Muraja'a (Consolidation)"

### 2. Corrections des statistiques

- Ligne 424 : "Versets ancrés" → "Ayats mémorisées"
- Ligne 284 : "verset(s) mémorisé(s)" → "ayat(s) validée(s)" (dans le bloc objectif)

### 3. Légende et récapitulatif du graphique

- Ligne 461 : "Hifz" → "Ar-Rabt"
- Ligne 474 (tooltip formatter) : "Hifz" → "Ar-Rabt"
- Ligne 489 : "{totalHifz} hifz" → "{totalHifz} ar-rabt"

### 4. Nettoyage textes résiduels

- Vérification du code : les textes "Taume" et "Racconto" ne semblent pas présents dans ce fichier. Pas de nettoyage nécessaire ici (probablement un bug d'affichage côté données ou autre page).

### Fichier modifié
- `src/pages/HifzSuiviPage.tsx` uniquement

