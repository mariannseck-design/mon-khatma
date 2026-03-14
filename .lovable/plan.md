

## Séparer la carte Hifz en deux cartes : Étape A et Étape B

### Concept
Remplacer la carte unique "Méthode Tikrar-ISTIQÂMAH" sur le HifzHub par **deux cartes distinctes** :
- **Étape A — Préparation** : Intention + Imprégnation (faisable la veille)
- **Étape B — Mémorisation** : Mémorisation + Validation + Tikrâr

Chaque carte affiche son propre état (session active, complétion) et redirige vers `/hifz` avec un paramètre `?phase=A` ou `?phase=B` pour reprendre au bon endroit.

### Changements

#### 1. `src/pages/HifzHubPage.tsx`
- **Remplacer** le bloc unique "Méthode Tikrar-ISTIQÂMAH" (lignes ~232-330) par deux cartes :
  - **Carte Étape A** : fond emerald clair, icône BookOpen, sous-titre "Intention & Imprégnation". Si session active en step 0-1, affiche "▶️ Continuer". Si step ≥ 2, affiche "✅ Terminée".
  - **Carte Étape B** : fond emerald foncé, icône Play/BookHeart, sous-titre "Mémorisation, Validation & Tikrâr". Si session active en step 2-4, affiche "▶️ Continuer". Si pas encore à l'étape B, affiche "Disponible après l'Étape A".
- Enrichir le state `activeHifzSession` pour stocker le `currentStep` numérique (en plus du nom).
- Les liens pointent vers `/hifz?phase=A` et `/hifz?phase=B`.

#### 2. `src/pages/HifzPage.tsx`
- Lire le query param `phase` à l'ouverture.
- Si `phase=B` et qu'une session existe en step < 2, sauter directement au step 2 (début Étape B).
- Si `phase=A` et step ≥ 2, ne rien changer (la session continue normalement).
- Comportement par défaut inchangé si pas de paramètre.

### Fichiers modifiés
- `src/pages/HifzHubPage.tsx` — deux cartes A/B au lieu d'une
- `src/pages/HifzPage.tsx` — lecture du query param `phase`

