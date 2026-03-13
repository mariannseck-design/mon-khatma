

## Plan : Remplacer les deux indicateurs de progression par des boutons-pastilles de versets

### Constat actuel (lignes 417-454)
Deux éléments redondants :
1. Une barre de progression linéaire ("Progression — 0/7 versets")
2. Des petits dots/pills en dessous

### Proposition
Supprimer ces deux blocs et les remplacer par une **rangée unique de boutons-pastilles numérotés** (un par verset), style compact et élégant :

- Chaque pastille affiche le numéro du verset
- **Fait** : fond doré, icône check
- **En cours** : bordure dorée animée (pulse), fond doré translucide
- **À faire** : fond gris translucide, texte discret
- Le compteur "X/Y versets" est intégré directement dans cette rangée (implicite par les pastilles)

### Fichier : `src/components/hifz/istiqamah/StepImmersion.tsx`

Remplacer les lignes 416-454 (barre de progression + pills) par un seul bloc de boutons-pastilles numérotés avec les 3 états visuels décrits ci-dessus. Les pastilles ne sont pas cliquables (progression linéaire), elles servent uniquement d'indicateur visuel.

