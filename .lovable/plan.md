

## Plan : Section "Nos Défis" dans Mon Univers

### Architecture

La section sera placée dans l'onglet **Mon Univers** de `AccueilPage.tsx`, juste après la carte "Ma Tillawah". Les données de progression seront persistées en `localStorage` pour commencer (pas de table DB pour l'instant).

### Changements

**1. Nouveau composant : `src/components/defis/DefiAlMulk.tsx`**
- Carte "Le Bouclier de la Nuit (Al-Mulk)" avec fond émeraude profond et accents or
- Tracker 7 jours (L, M, M, J, V, S, D) : petites icônes lunes, cliquables pour valider
- État stocké en localStorage avec la semaine courante comme clé
- Le dimanche soir : si l'utilisatrice clique, pop-up de félicitations animé (framer-motion)
- Icône `Shield` (lucide) en line-art

**2. Nouveau composant : `src/components/defis/DefiAlBaqara.tsx`**
- Grande carte "La Forteresse (Al-Baqara)" avec fond beige/or
- Deux états : **configuration** (sélecteur d'objectif) et **en cours** (progression)
- Sélecteur : 48j, 30j, 24j, 15j, 7j, 3j, 1j — via des boutons radio stylisés
- Une fois lancé : barre de progression dorée, compteur "Jour X sur Y", checkbox quotidienne
- Bouton reset pour relancer un défi
- Icône `Castle` ou `Landmark` en line-art
- Données en localStorage (date de début, objectif, jours cochés)

**3. Modifier `src/pages/AccueilPage.tsx`**
- Dans l'onglet "Mon Univers", après Ma Tillawah (ligne ~460), insérer un bloc "Nos Défis" :
  - Titre section "Nos Défis" en vert émeraude, uppercase, Inter
  - `<DefiAlMulk />`
  - `<DefiAlBaqara />`

### Design
- Charte Vert Émeraude / Or respectée
- Coins arrondis `rounded-2xl`, ombres légères
- Animations d'entrée framer-motion cohérentes avec le reste de la page

