

## Rendre le bouton de confirmation plus explicite

Modifier la ligne 630 de `HifzDiagnostic.tsx` pour afficher le détail par catégorie au lieu du total brut.

**Avant** : `✨ Confirmer mes 3 blocs`

**Après** (exemples dynamiques) :
- Si les deux catégories ont des blocs : `✨ Confirmer (2 solides + 1 récent)`
- Si seulement solides : `✨ Confirmer mes 2 blocs solides`
- Si seulement récents : `✨ Confirmer mon 1 bloc récent`

Un seul fichier modifié, une seule ligne.

