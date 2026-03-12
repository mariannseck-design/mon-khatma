

# Nettoyage de l'interface IstiqamahEngine — supprimer les éléments redondants

## Problème

L'écran affiche actuellement **deux couches de navigation superposées** :

1. **IstiqamahEngine** (parent) affiche :
   - La barre de progression "1/3 — Mémorisation" → indique l'étape globale (Mémorisation / Compréhension / Tikrar)
   - Des flèches de navigation ← → avec le label "Mémorisation" en dessous
   - L'indicateur de parties (pills)

2. **StepImmersion** (enfant) affiche :
   - Sa propre barre de progression par verset ("0/7 versets")
   - Ses propres pills de versets
   - Le label "Verset X — X/7"

Résultat : les flèches de navigation du parent et le label "Mémorisation" dupliqué sont inutiles et déroutants. La barre 1/3 n'apporte rien car chaque étape enfant gère déjà sa propre progression.

## Changements proposés

**Fichier : `src/components/hifz/istiqamah/IstiqamahEngine.tsx`**

Supprimer de l'interface parent :
- La `IstiqamahProgressBar` (barre 1/3)
- Les flèches de navigation (← →) et le label central
- L'`IstiqamahPartIndicator` (pills de parties)

Garder uniquement :
- Le titre "Istiqâmah" avec le bouton info (ⓘ)
- Le rendu de l'étape active (`renderStep()`)
- La phrase d'invocation en bas

Cela donne une interface épurée où seule l'étape en cours (StepImmersion, StepComprehension, StepTikrarFinal) gère son propre affichage de progression.

