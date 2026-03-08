

## Plan : Ajouter le mois au format des dates du graphique

### Changement dans `src/pages/HifzSuiviPage.tsx`

**Ligne 157** : Modifier le label pour ajouter `/03` (mois avec zéro).

```
// Avant
const label = `${dayName} ${dayNum}`;

// Après
const month = String(d.getMonth() + 1).padStart(2, '0');
const label = `${dayName} ${dayNum}/${month}`;
```

Résultat : `Lun 3/03`, `Mar 4/03`, etc.

