

# Mettre en évidence "sans regarder le Mushaf" en rouge

Deux fichiers contiennent ce texte :

1. **`src/components/hifz/istiqamah/StepImmersion.tsx`** (ligne 480) — le paragraphe d'instruction sous la phase mémoire
2. **`src/components/hifz/istiqamah/StepFusion.tsx`** (ligne 106) — la description de la phase "recite"

## Changements

Dans les deux fichiers, remplacer le texte brut par du JSX qui entoure "sans regarder le Mushaf ni écouter l'audio" dans un `<span>` rouge vif (`#ef5350`) avec un `font-weight: 600` pour le rendre bien visible, tout en gardant le reste du texte dans sa couleur actuelle (gris subtil).

Exemple de rendu :
> Récitation 2 — Récitez de mémoire, <span style="color:#ef5350;font-weight:600">sans regarder le Mushaf ni écouter l'audio</span>

