

## Mise en page des cartes Juz

### Problème
Quand il n'y a qu'un seul Juz actif, la carte est petite et coincée dans un coin de la grille 2 colonnes. Le bouton "Voir tous les Juz" est au-dessus, séparé de la carte.

### Changements prévus

**1. Carte Juz active : pleine largeur**
- Quand une carte Juz active est affichée (non expanded), elle occupe toute la largeur (`col-span-2 sm:col-span-3`) au lieu d'une seule colonne
- Le contenu interne s'adapte : cercle de progression plus grand (80px), texte plus lisible

**2. Déplacer "Voir tous les Juz" sous les cartes actives**
- Retirer le toggle du header de section
- Le placer en bas, après les cartes actives, sous forme de bouton centré
- Le titre "Mon Parcours par Juz" reste seul en haut

### Fichier modifié
- `src/pages/HifzSuiviPage.tsx` — layout grille + repositionnement du toggle

