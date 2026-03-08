

## Changer le fond du bloc coranique à l'étape 2 du Hifz

L'image de référence montre un fond **vert turquoise/teal** (style Mushaf) pour la zone d'affichage du texte arabe, au lieu du fond sombre transparent actuel.

### Modification dans `HifzStep2Impregnation.tsx`

Changer le style du conteneur du texte arabe (lignes 297-300 et 307) :
- **Fond extérieur** : passer de transparent à un dégradé teal similaire au lecteur Mushaf (`linear-gradient(135deg, #0d7377, #14919b, #0d7377)`)
- **Fond intérieur** : remplacer `rgba(255,255,255,0.03)` par un teal légèrement plus clair (`rgba(255,255,255,0.08)`) pour le contraste
- **Bordure** : adapter en bordure teal/or assortie
- **Couleur du texte** : garder `#e8e0d0` (crème) qui contraste bien sur le teal, comme dans la capture

Un seul fichier impacté : `src/components/hifz/HifzStep2Impregnation.tsx`.

