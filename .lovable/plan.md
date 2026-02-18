

# Correction : Selection automatique du texte au focus des champs numeriques

## Probleme

Quand vous touchez un champ pour ecrire "20", le curseur se place a cote du "1" existant. Vous tapez "2" et ca donne "12" ou "21" au lieu de remplacer. Il faut manuellement selectionner et supprimer l'ancien texte, ce qui est penible.

## Solution

Ajouter un `onFocus` qui selectionne automatiquement tout le texte du champ quand on le touche. Ainsi, des que vous tapez "20", ca remplace directement l'ancienne valeur.

## Fichiers concernes

### 1. `src/components/planificateur/PlannerCalculator.tsx`
- Ajouter `onFocus={(e) => e.target.select()}` sur les deux inputs (Pages par jour, Objectif de jours)

### 2. `src/components/planificateur/ReadingInput.tsx`
- Ajouter `onFocus={(e) => e.target.select()}` sur l'input "Nombre de pages lues"

### 3. `src/components/ramadan/RamadanDhikrSection.tsx`
- Ajouter `onFocus={(e) => e.target.select()}` sur tous les inputs de compteur (predefined dhikrs, custom entries, new count)

## Resultat attendu

Quand l'utilisateur touche un champ, tout le contenu est selectionne. Il suffit de taper le nouveau nombre directement, sans avoir a supprimer l'ancien.

