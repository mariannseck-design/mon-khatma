

# Ajouter un sélecteur de récitateur dans l'étape Mémorisation (Istiqâmah)

## Constat

L'étape Istiqâmah (StepImmersion, StepImpregnation, StepFusion, StepTikrarFinal) lit le récitateur depuis `localStorage('quran_reciter')` mais **n'offre aucune UI pour le changer**. Seule l'étape 2 (Imprégnation — `HifzStep2Impregnation`) et l'ancien step 3 (`HifzStep3Memorisation`) ont un `<select>` de récitateur.

## Plan

**Fichier : `src/components/hifz/istiqamah/IstiqamahEngine.tsx`**

Ajouter un sélecteur de récitateur compact dans le header de l'engine, juste sous le fil d'Ariane :

1. Importer `RECITERS` depuis `@/hooks/useQuranAudio` et `ChevronDown` depuis lucide.
2. Ajouter un état `reciter` initialisé depuis localStorage + un setter qui persiste dans localStorage.
3. Rendre un petit `<select>` stylisé (fond transparent, texte doré, discret) entre le breadcrumb et le contenu.
4. Passer `reciter` + `onReciterChange` en prop aux sous-étapes (`StepImmersion`, `StepImpregnation`, `StepFusion`, `StepTikrarFinal`).

**Fichiers : `StepImmersion.tsx`, `StepImpregnation.tsx`, `StepFusion.tsx`, `StepTikrarFinal.tsx`**

- Accepter une prop optionnelle `reciterId?: string` qui, si présente, remplace la lecture localStorage.
- Modifier `const [reciter]` pour utiliser la prop en priorité : `props.reciterId || localStorage.getItem(...)`.

Cela maintient la rétro-compatibilité tout en donnant le contrôle depuis l'engine.

