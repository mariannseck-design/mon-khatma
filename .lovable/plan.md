

## Plan : Corriger le calcul de progression en pages

### Problème
La conversion versets → pages utilise une division fixe par 15 (`versesCompleted / 15`), ce qui est imprécis. Certaines pages du Coran contiennent 5 versets, d'autres 20+.

### Solution
Utiliser les données réelles de pages du Mushaf au lieu d'une approximation. Le fichier `quran-uthmani.json` contient probablement les numéros de pages par verset. On peut calculer le nombre exact de pages distinctes couvertes par les sessions complétées.

### Changements dans `src/pages/HifzSuiviPage.tsx`

**1. Charger les données de mapping verset → page**
- Utiliser `surahData` ou `quranData` pour connaître la page de chaque verset

**2. Remplacer la ligne 141**
Au lieu de :
```ts
setPeriodProgress(Math.round((versesCompleted / 15) * 10) / 10);
```
Calculer les pages distinctes couvertes par les sessions complétées en utilisant les numéros de page réels des versets mémorisés.

**Alternative simple (si pas de mapping page disponible)** : utiliser une constante plus réaliste. Le Coran a 6236 versets sur 604 pages → ~10.3 versets/page en moyenne. Remplacer `/15` par `/10.3` pour une meilleure approximation.

### Vérification nécessaire
Je dois d'abord vérifier quelles données de pages sont disponibles dans le projet avant de choisir l'approche.

