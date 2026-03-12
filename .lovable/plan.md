

# Ajouter des flèches de navigation interne dans Istiqamah

## Problème
Sur desktop, il n'y a pas de moyen simple de revenir à l'étape précédente à l'intérieur du parcours Istiqamah. Le bouton "back" du `HifzStepWrapper` quitte tout le module.

## Solution
Ajouter une barre de navigation avec flèches gauche/droite en haut du contenu Istiqamah (dans `IstiqamahEngine.tsx`), juste sous la barre de progression. Ces flèches appellent `state.back()` et `state.next()` pour naviguer entre les sous-étapes internes.

## Fichier modifié

**`src/components/hifz/istiqamah/IstiqamahEngine.tsx`**
- Ajouter une rangée avec `ChevronLeft` / `ChevronRight` entre la progress bar et le contenu
- Flèche gauche désactivée sur le premier noeud, flèche droite masquée (on ne veut pas skip en avant)
- Style : boutons semi-transparents avec icônes blanches, cohérent avec le design émeraude/doré existant
- Label du step affiché entre les deux flèches

