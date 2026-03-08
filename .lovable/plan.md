

## Plan : Ajouter les dates au graphique d'activité hebdomadaire

### Changement unique dans `src/pages/HifzSuiviPage.tsx`

**Ligne 155-156** : Modifier le label pour inclure le jour du mois en plus du nom du jour.

Remplacer :
```
const label = DAY_LABELS[jsDay === 0 ? 6 : jsDay - 1];
chartData.push({ day: label, count: dayCounts[key] || 0 });
```

Par :
```
const dayName = DAY_LABELS[jsDay === 0 ? 6 : jsDay - 1];
const dayNum = d.getDate();
const label = `${dayName} ${dayNum}`;
chartData.push({ day: label, count: dayCounts[key] || 0 });
```

Résultat : au lieu de `Lun`, `Mar`, etc., le graphique affichera `Lun 3`, `Mar 4`, `Mer 5`...

On ajustera aussi la taille de police du XAxis (fontSize: 10) pour que les labels plus longs restent lisibles.

