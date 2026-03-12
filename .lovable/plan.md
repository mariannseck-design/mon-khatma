

# Shimmer intermittent + textes des cartes Tikrar & Mourad

## Changements

### 1. Animation shimmer intermittente (CSS)
Modifier `@keyframes istiqamah-shine` pour que la brillance ne se déclenche que par moments : le texte reste doré fixe la majorité du temps, puis un flash de brillance passe rapidement, avec une longue pause entre chaque cycle.

**`src/index.css`** — Remplacer l'animation actuelle par une version avec pause : l'animation dure ~6s, le shine ne se produit que sur les 15 premiers %, le reste du temps le background-position reste fixe (effet de repos).

### 2. Textes sous-titres des cartes (HifzHubPage.tsx)
Remplacer les sous-titres blancs quand il n'y a pas de session active :
- **Tikrar** (ligne 245) : `'Apprendre et mémoriser le Coran'` → `'Graver le Coran dans les cœurs'`
- **Tikrar disabled** (ligne 274) : `'Bientôt disponible in shaa Allah'` — conserver tel quel (état désactivé)
- **Mourad** (ligne 316) : `'Recommandé pour débutant'` → `'Graver le Coran dans les cœurs'`
- **Mourad disabled** (ligne 345) : `'Bientôt disponible in shaa Allah'` — conserver tel quel

## Fichiers modifiés
- `src/index.css` — Animation keyframes modifiée
- `src/pages/HifzHubPage.tsx` — 2 textes remplacés

