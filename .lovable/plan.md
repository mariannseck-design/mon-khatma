

## Plan : Restructuration du flux Hifz en 5 étapes claires (1/5 → 5/5)

### Objectif
Remplacer la numérotation anarchique actuelle (0/4, 3/4, 5/4...) par un flux linéaire de 5 étapes numérotées de 1 à 5 avec des titres explicites.

### Flux actuel (problématique)
```text
step -1 : HifzConfig (pas numéroté)
step  0 : "Intention & Imprégnation" (0/4) — intention + audio + traduction fusionnés
step  1 : IstiqamahEngine (3/4) — 3 sous-étapes internes (compréhension → immersion → tikrar)
step  2 : HifzStep4Validation (4/4) — 5 enregistrements
step  3 : HifzStep5Tikrar (5/4) — 40 répétitions
step  4 : Succès
```

### Nouveau flux (5 étapes)
```text
Config  : HifzConfig — affiche "Étape 1/5 · Choix des versets"
step 0  : "Intention et Compréhension" (2/5) — intention + traduction (ouverte par défaut)
step 1  : "Imprégnation de la récitation et du Tajweed" (3/5) — mushaf + audio + compteur d'écoute
step 2  : "Mémorisation" (4/5) — StepImmersion promu au top level (verset par verset)
step 3  : "Tikrâr" (5/5) — HifzStep5Tikrar (40 reps + Pomodoro)
step 4  : Succès
```

### Changements fichier par fichier

**1. `src/components/hifz/HifzStepWrapper.tsx`**
- Changer `totalSteps` par défaut de 5 à 5 (inchangé)
- Modifier l'affichage : `Étape {stepNumber}/{totalSteps}` (au lieu de `{stepNumber}/{totalSteps - 1}`)
- Barre de progression : `(stepNumber / totalSteps) * 100%` (au lieu de `(stepNumber + 1) / totalSteps`)

**2. `src/components/hifz/HifzConfig.tsx`**
- Ajouter un petit bandeau "Étape 1/5 · Choix des versets" en haut du composant

**3. Scinder `HifzStepIntentionImpregnation.tsx` en deux composants :**

- **`HifzStepIntentionComprehension.tsx`** (nouveau, étape 2/5) :
  - Icone Heart + texte d'intention
  - Traduction Hamidullah (ouverte par défaut, non collapsible)
  - CTA : "J'ai lu et compris le sens"
  - `stepNumber={2}`, `stepTitle="Intention et Compréhension"`

- **`HifzStepImpregnation.tsx`** (nouveau, étape 3/5) :
  - Reprend le mushaf (text/image/physical toggle, zoom)
  - Audio player (récitateur, bouton play, compteur 3 écoutes)
  - CTA : "Je suis prêt(e) — Bismillah"
  - `stepNumber={3}`, `stepTitle="Imprégnation de la récitation et du Tajweed"`

**4. Nouveau composant wrapper `HifzStepMemorisation.tsx`** (étape 4/5)
- Wraps `StepImmersion` dans un `HifzStepWrapper` avec `stepNumber={4}`, `stepTitle="Mémorisation"`
- Gère le `reciterId` (localStorage)
- Supprime la dépendance à IstiqamahEngine

**5. `src/components/hifz/HifzStep5Tikrar.tsx`**
- Changer `stepNumber` de 5 → 5 (inchangé) et `stepTitle` → "Tikrâr"

**6. `src/pages/HifzPage.tsx`**
- Mettre à jour `STEP_NAMES` : `['Intention et Compréhension', 'Imprégnation', 'Mémorisation', 'Tikrâr']`
- Remapper les steps :
  - step 0 → `HifzStepIntentionComprehension`
  - step 1 → `HifzStepImpregnation`
  - step 2 → `HifzStepMemorisation` (avec StepImmersion)
  - step 3 → `HifzStep5Tikrar`
  - step 4 → `HifzSuccess`
- Pause respiratoire entre step 1 (Imprégnation) et step 2 (Mémorisation)
- Adapter `handleStep1Complete` → déclenché à la fin de step 1
- Mettre à jour `completeSession` : `current_step: 4`
- Adapter les DevSkipButton et la logique de sauvegarde/reprise

**7. Composants retirés du flux principal**
- `IstiqamahEngine` : plus utilisé dans le tunnel (StepImmersion est utilisé directement)
- `HifzStep4Validation` : retiré du flux (la validation est intégrée dans StepImmersion qui a déjà un mode "memory")
- `StepComprehension` : logique absorbée par HifzStepIntentionComprehension
- `StepTikrarFinal` : remplacé par HifzStep5Tikrar au top level
- Ces fichiers ne sont pas supprimés (pourraient servir ailleurs) mais ne sont plus importés dans HifzPage

### Résumé visuel du rendu
```text
┌─────────────────────────────┐
│ Étape 1/5 · Choix des versets │  ← HifzConfig
├─────────────────────────────┤
│ Étape 2/5 · Intention et     │  ← Intention + traduction
│              Compréhension   │
├─────────────────────────────┤
│ Étape 3/5 · Imprégnation de │  ← Mushaf + audio
│   la récitation et du Tajweed│
├─────────────────────────────┤
│ [Pause respiratoire]         │
├─────────────────────────────┤
│ Étape 4/5 · Mémorisation     │  ← Verset par verset
├─────────────────────────────┤
│ Étape 5/5 · Tikrâr           │  ← 40 répétitions
├─────────────────────────────┤
│ 🎉 Succès                    │
└─────────────────────────────┘
```

