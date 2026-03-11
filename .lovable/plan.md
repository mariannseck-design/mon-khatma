

## Supprimer la section "Statistiques d'apprentissage"

### Changement
Supprimer le bloc **"4. STATS FUSIONNÉES — Grille 2x2"** (lignes 379-407) qui affiche les 4 pilules Ar-Rabt, Muraja'a, Streak et Cycles.

### Fichier modifié
- `src/pages/HifzSuiviPage.tsx` — Suppression des lignes 379-407 (le `motion.div` contenant la grille 2x2). Les variables `todayHifz`, `todayMuraja` et `streak` restent utilisées par le graphique hebdo et la timeline, donc on ne touche pas à la logique data.

