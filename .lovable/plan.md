

# Compréhension : traduction française + réordonnancement

## Problème
1. L'étape Compréhension affiche le texte arabe au lieu de la traduction française — elle devrait montrer uniquement la traduction, sans texte arabe ni audio.
2. L'ordre actuel est Mémorisation → Compréhension → Tikrar, mais la compréhension doit venir **avant** la mémorisation.

## Changements

### 1. `src/components/hifz/istiqamah/useIstiqamahState.ts`
Réordonner le flow : `comprehension → immersion → tikrar` au lieu de `immersion → comprehension → tikrar`.

### 2. `src/components/hifz/istiqamah/IstiqamahEngine.tsx`
- Mettre à jour le breadcrumb pour refléter le nouvel ordre : `Compréhension › Mémorisation › Tikrar`
- Mettre à jour le texte d'info de l'Istiqâmah en conséquence

### 3. `src/components/hifz/istiqamah/StepComprehension.tsx`
- Supprimer le chargement du texte arabe (`getVersesByRange`)
- Charger la traduction française depuis `api.alquran.cloud` (édition Hamidullah), comme fait dans `MouradPhase1`
- Afficher chaque verset avec son numéro et sa traduction française (direction LTR)
- Aucun audio, aucun texte arabe

