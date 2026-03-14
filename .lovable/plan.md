

## Séparer le parcours Hifz en Étape A (Préparation) et Étape B (Mémorisation)

### Concept
Diviser visuellement et fonctionnellement les 5 étapes en deux blocs :
- **Étape A — Préparation** (faisable la veille) : Intention/Compréhension + Imprégnation Tajweed
- **Étape B — Mémorisation** (le jour même) : Mémorisation + Validation + Tikrâr

### Changements

#### 1. `src/components/hifz/HifzStepWrapper.tsx`
- Remplacer l'affichage "Étape X/5" par un label contextuel :
  - Steps 0-1 → **"Étape A · 1/2"** et **"Étape A · 2/2"**
  - Steps 2-4 → **"Étape B · 1/3"**, **"Étape B · 2/3"**, **"Étape B · 3/3"**
- Ajouter une prop optionnelle `phaseLabel` pour surcharger l'affichage

#### 2. `src/pages/HifzPage.tsx`
- **Remplacer** le `HifzBreathingPause` entre step 1 et 2 par un nouvel écran de transition "Étape A terminée" qui :
  - Félicite l'utilisateur (✅ Préparation terminée)
  - Explique qu'il peut revenir plus tard pour l'Étape B
  - Offre deux boutons : **"Continuer maintenant →"** et **"Revenir plus tard"** (qui fait `handlePause`)
- Mettre à jour `STEP_NAMES` pour refléter les phases A/B
- Passer `phaseLabel` au `HifzStepWrapper` dans chaque step

#### 3. `src/components/hifz/HifzBreathingPause.tsx`
- Transformer en écran de transition A→B avec message clair sur la séparation des deux phases, tout en gardant le timer de décompression optionnel

### Fichiers modifiés
- `src/components/hifz/HifzStepWrapper.tsx` — affichage phase A/B
- `src/pages/HifzPage.tsx` — écran de transition, labels mis à jour
- `src/components/hifz/HifzBreathingPause.tsx` — nouveau design transition A→B

