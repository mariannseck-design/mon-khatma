

## Clarifier l'affichage des blocs dans le résumé

### Problème
L'utilisatrice saisit "pages 1 à 10" et voit "2 blocs" sans comprendre pourquoi. En interne, le système découpe par sourate (Al-Fatiha + Al-Baqara = 2 blocs), mais ce détail technique n'a pas à être exposé.

### Solution
Remplacer le comptage de "blocs" par un affichage centré sur ce que l'utilisatrice a saisi : les **pages**.

Dans le résumé de confirmation et le bouton :
- **Avant** : `🏛 Acquis Solides — 2 blocs`
- **Après** : `🏛 Acquis Solides — Pages 1-10`

### Changements dans `HifzDiagnostic.tsx`

1. **Section résumé "Acquis enregistrés"** : Afficher les plages de pages saisies (ex: `Pages 1-10, 50-55`) au lieu du nombre de blocs techniques.

2. **Bouton de confirmation** : Remplacer le décompte de blocs par le nombre de pages total. Ex : `✨ Confirmer (10 pages solides + 5 pages récentes)` au lieu de `✨ Confirmer (2 solides + 1 récent)`.

3. **Stocker les plages de pages saisies** dans l'état du composant (elles le sont déjà via `solidPageRanges` / `recentPageRanges`) pour les réafficher dans le résumé.

Un seul fichier modifié : `src/components/hifz/HifzDiagnostic.tsx`.

