

## Ajouter subtilement du doré et du vert à la carte Ma Khatma

La carte actuelle est trop neutre/terne. On va rehausser avec des touches de couleur subtiles mais visibles :

### Changements dans `TotalProgressBar.tsx`

| Élément | Avant | Après |
|---|---|---|
| Fond carte | `var(--p-card)` vers `rgba(6,95,70,0.04)` | `var(--p-card)` vers `rgba(6,95,70,0.08)` — vert plus visible |
| Bordure | `rgba(6,95,70,0.08)` | `rgba(212,175,55,0.15)` — bordure dorée subtile |
| Halo décoratif | Un seul halo or en haut-droite, opacité 0.07 | Deux halos : or en haut-droite (opacité 0.12) + vert en bas-gauche (opacité 0.08) |
| Icône fond | Or translucide faible | Or plus marqué `rgba(212,175,55,0.22)` |
| Bloc sourate | Fond vert très pâle `rgba(6,95,70,0.07)` | Fond avec une touche dorée mélangée : `rgba(212,175,55,0.06)` en bordure |
| Barre de progression track | `rgba(6,95,70,0.06)` | `rgba(6,95,70,0.10)` — plus visible |
| Ombre carte | Ombre légère | Ajout d'une touche dorée dans l'ombre `rgba(212,175,55,0.12)` |

Résultat : la carte garde son fond clair mais les accents dorés et verts lui donnent de la vie et de la richesse visuelle.

### Fichier modifié
- `src/components/planificateur/TotalProgressBar.tsx`

