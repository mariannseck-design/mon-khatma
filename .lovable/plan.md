

## Plan : Finalisation de la page "Mon Suivi Hifz"

### 1. Correction de texte
- **`src/pages/HifzSuiviPage.tsx` l.504** : Remplacer "Ar-Rabt" par "Mémorisation"

### 2. Ajout des appels à l'action contextuels
Ajouter des petits liens cliquables (style pilule, texte émeraude, flèche `→`) directement sous chaque bloc concerné :

- **Après le bloc Objectif (section 3, ~l.408)** : lien "Définir son programme →" pointant vers l'édition d'objectif (`setShowGoalEdit(true)`)
- **Après les liens rapides existants (section "LIENS RAPIDES")** : transformer les 2 cartes existantes en CTAs contextuels :
  - "Apprendre du nouveau →" → `/hifz` (remplace la carte "Ar-Rabt")
  - "Réviser l'ancien →" → `/muraja` (remplace la carte "Muraja'a")
- Design : texte émeraude (`var(--p-accent)`), effet hover scale, flèche `ChevronRight`, forme pilule arrondie

### 3. Finition des mini-cartes Juz/Hizb/Pages
Modifier le composant `MiniCircle` et les 3 cartes jalons pour afficher la valeur `value/max` **centrée à l'intérieur** du cercle SVG (via un positionnement absolu), au lieu d'avoir le cercle vide séparé du texte.

### 4. Carrousel horizontal pour le détail par Juz
- Importer le composant `HifzSuiviTestPage` (la grille des 30 Juz) en tant que section dans `HifzSuiviPage`, mais **en carrousel horizontal** :
  - Conteneur `overflow-x-auto scrollbar-hide` avec `flex` et `snap-x`
  - Chaque carte Juz en `snap-center`, largeur fixe (~160px)
  - Scroll horizontal au doigt, pas de barre de défilement visible
- Ajouter une classe CSS `scrollbar-hide` dans `index.css` si absente

### Fichiers modifiés
- `src/pages/HifzSuiviPage.tsx` — toutes les modifications ci-dessus
- `src/index.css` — ajout de `.scrollbar-hide` si nécessaire

