

## Supprimer le graphique hebdo "Versets travaillés (7 jours)"

### Changement
Supprimer le bloc **"5. GRAPHIQUE HEBDO"** (lignes 380-434) qui affiche le diagramme en barres empilées avec la légende Ar-Rabt / Muraja'a et le résumé hebdomadaire.

### Fichier modifié
- `src/pages/HifzSuiviPage.tsx` — Suppression des lignes 380-434. Les variables `weeklyData` restent utilisées par la section "Historique récent" (timeline), donc la logique data n'est pas touchée.

