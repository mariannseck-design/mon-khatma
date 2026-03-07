

## Plan: Ajouter une note "3 fois minimum" sur le bouton "Passer quand même"

### Modification

**`src/components/hifz/HifzStep2Impregnation.tsx`** (lignes 204-221)

Quand `listenCount < 3`, transformer le bouton pour inclure une sous-ligne de texte en plus petit : *"L'écoute c'est 3 fois minimum 🤲"*. Le bouton passera de `flex items-center justify-center` à une disposition en colonne (`flex-col`) pour afficher le texte principal + la note en dessous en `text-xs` avec une opacité réduite.

Quand `listenCount >= 3`, le bouton reste inchangé (texte simple "Passer à la mémorisation").

