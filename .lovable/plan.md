

# Refonte du module Istiqamah — Parcours par Parties avec fusion progressive

## Résumé

Remplacer le composant monolithique `HifzStep3Memorisation` (786 lignes, 4 phases avec un seul compteur) par un système modulaire qui :
1. Découpe automatiquement la sélection en "Parties" digestes (par page Mushaf)
2. Fait parcourir 5 étapes par partie (Compréhension → Immersion → Imprégnation → Autonomie → Gravure)
3. Génère des étapes de Fusion entre les parties
4. Termine par un compteur Tikrar final (objectif 40)

## Architecture des fichiers

```text
src/components/hifz/istiqamah/
├── IstiqamahEngine.tsx        ← Orchestrateur principal (remplace HifzStep3Memorisation)
├── useIstiqamahState.ts       ← Hook de state management (parties, étape courante, fusion)
├── partSplitter.ts            ← Algo de découpage en parties (réutilise splitBlockByPages)
├── StepComprehension.tsx      ← Étape 1 : Tafsir / traduction
├── StepImmersion.tsx          ← Étape 2 : Écoute 3x avec audio
├── StepImpregnation.tsx       ← Étape 3 : Répétition 5-10x avec Mushaf
├── StepAutonomie.tsx          ← Étape 4 : Lecture sans audio
├── StepGravure.tsx            ← Étape 5 : Récitation de mémoire 5x (compteur circulaire)
├── StepFusion.tsx             ← Liaison : écouter, lire, réciter les parties fusionnées
├── StepTikrarFinal.tsx        ← Compteur final 40 rép. avec saisie libre
├── IstiqamahProgressBar.tsx   ← Barre de progression globale du parcours
└── IstiqamahPartIndicator.tsx ← Indicateur "Partie 2/4" avec état des parties
```

## Algorithme de découpage (partSplitter.ts)

- Réutilise `splitBlockByPages` de `hifzUtils.ts` pour aligner les parties sur les pages du Mushaf
- Si la sélection fait ≤ 5 versets → 1 seule partie, pas de fusion
- Si > 5 versets → découpage par page Mushaf (chaque page = 1 partie)
- Chaque partie = `{ surahNumber, verseStart, verseEnd, partIndex }`

## Flux dynamique (useIstiqamahState.ts)

```text
Pour N parties :
  Partie 1 → [Étape 1..5]
  Partie 2 → [Étape 1..5] → Fusion(1+2)
  Partie 3 → [Étape 1..5] → Fusion(1+2+3)
  ...
  Partie N → [Étape 1..5] → Fusion(toutes)
  → Tikrar Final (40 rép.)
```

Le hook expose : `currentPart`, `currentStep`, `allParts`, `isFusion`, `fusionRange`, `isTikrarFinal`, `next()`, `back()`, `progress`.

## Détail des 5 étapes par partie

1. **Compréhension** — Affiche la traduction Hamidullah (déjà disponible via `getVersesByRange`). Bouton "J'ai compris" → message doré "Magnifique ! Le sens éclaire votre mémorisation".

2. **Immersion Sonore** — Lecteur audio existant (`useQuranAudio`), consigne "Écouter 3 fois attentivement". Compteur 1/3 → 2/3 → 3/3 automatique. Note d'encouragement affichée en bas.

3. **Imprégnation** — Mushaf visible (3 modes existants : image/texte/physique via `HifzMushafToggle`). Audio en boucle. Compteur circulaire 5-10 rép. avec bouton +1.

4. **Autonomie Visuelle** — Mushaf visible, audio désactivé. Bouton "J'ai lu" pour valider.

5. **Gravure par le cœur** — Mushaf masqué, audio désactivé. Compteur circulaire interactif de 1 à 5 (SVG animé). Bouton "Vérifier" pour aperçu temporaire (5s).

## Étapes de Fusion (StepFusion.tsx)

3 sous-phases rapides :
- Écoute des parties fusionnées (audio auto-play)
- Lecture avec Mushaf (validation manuelle)
- Récitation de mémoire (Mushaf masqué, bouton vérifier)

## Tikrar Final (StepTikrarFinal.tsx)

- Objectif : 40 répétitions de mémoire (tout le passage du jour)
- Saisie numérique du nombre de rép. effectuées (input)
- Affichage dynamique : "Solde restant : X" (40 - saisie)
- Règle affichée : "Récitation de mémoire uniquement"
- Bouton de validation quand solde = 0

## Intégration dans HifzPage.tsx

- `HifzStep3Memorisation` est remplacé par `IstiqamahEngine` avec les mêmes props (`surahNumber`, `startVerse`, `endVerse`, `repetitionLevel`, `onNext`, `onBack`, `onPause`)
- Aucun changement dans le flux global (step 0→1→2→3→4→success)
- Le `HifzStepWrapper` existant est réutilisé

## Style

- Fond dégradé émeraude hérité du parent (#065f46 → #064e3b)
- Accents dorés (#d4af37) pour titres, compteurs actifs, boutons CTA
- Transitions Framer Motion (slide horizontal entre étapes, scale sur les compteurs)
- Compteurs circulaires SVG animés (stroke-dasharray transition)
- Typographie Playfair Display pour les titres, Amiri pour le texte arabe

## Composants existants réutilisés

- `HifzStepWrapper` (barre de progression + timer + pause)
- `HifzMushafToggle` + `HifzMushafImage` (affichage Mushaf)
- `useQuranAudio` / `getAyahAudioUrl` (audio)
- `getVersesByRange` + `getTajweedAnnotations` (texte + tajweed)
- `splitBlockByPages` de `hifzUtils.ts` (découpage)

