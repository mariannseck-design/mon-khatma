

## Plan : Diviser l'étape Istiqâmah en 4 sous-pages

### Concept
Transformer l'étape 3 en un mini-tunnel de 4 pages distinctes (une par palier), avec navigation séquentielle entre elles. Chaque page se concentre sur son palier et se déverrouille automatiquement quand les répétitions requises sont atteintes.

### Architecture

```text
Step 3 (wrapper)
  ├── Phase 1 (rép. 1-4)  → "Écoute & Répétition"
  ├── Phase 2 (rép. 5-8)  → "Lecture autonome"
  ├── Phase 3 (rép. 9-12) → "Récitation de mémoire"
  └── Phase 4 (rép. 13+)  → "Ancrage final"
```

### Modifications dans `HifzStep3Memorisation.tsx`

1. **Ajouter un state `currentPhase` (1-4)** qui détermine quelle sous-page est affichée. Avancement automatique quand `ancrage` atteint le seuil du palier (4, 8, 12).

2. **Indicateur de progression** en haut : 4 pastilles/étapes numérotées (type stepper horizontal) montrant la sous-page active, avec un mini label pour chaque palier.

3. **Chaque sous-page affiche uniquement** :
   - Son titre et emoji spécifique
   - Sa consigne dédiée (pas le mode d'emploi complet des 4 phases)
   - Le compteur circulaire avec le sous-objectif local (ex: 0/4 pour la phase 1) tout en gardant le compteur global visible en petit
   - Le Mushaf / texte / audio selon les règles de la phase
   - Le bouton +1 et les contrôles audio pertinents

4. **Bouton "Suivant"** à la fin de chaque sous-page (quand le sous-objectif est atteint) pour passer à la phase suivante. La phase 4 montre "Passer au test de validation" comme actuellement.

5. **Bouton retour** entre sous-pages pour revenir à la phase précédente (sans perdre la progression).

6. **Le mode d'emploi global** (accordion) est supprimé au profit d'une consigne courte et claire par sous-page.

### Détail par sous-page

| Phase | Titre | Compteur | Mushaf | Audio | Consigne |
|-------|-------|----------|--------|-------|----------|
| 1 | Écoute & Répétition | 0→4 | Visible | Proéminent | "Regardez le Mushaf, écoutez, répétez" |
| 2 | Lecture autonome | 4→8 | Visible | Discret | "Lisez seul(e), audio en aide si besoin" |
| 3 | Récitation guidée | 8→12 | Visible | Masqué | "Regardez le Mushaf, récitez de mémoire" |
| 4 | Ancrage final | 12→objectif | Masqué + Peek | Masqué | "Texte masqué, récitez de mémoire" |

### Points techniques
- Le state `ancrage` global reste unique et persisté en localStorage (pas de reset entre phases)
- La transition entre phases inclut une animation slide (framer-motion `AnimatePresence` avec direction)
- Le stepper horizontal utilise les couleurs existantes de chaque phase (`#4ecdc4`, `#45b7aa`, `#f0d060`, `#d4af37`)

