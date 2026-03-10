## Plan : Remplacer le countdown par l'affichage de la prochaine révision

### Problème

Le compte à rebours vers minuit est confus : il dit "révision dans 1 min", puis à minuit repart à 23h59 sans montrer de nouvelle tâche. Il ne sert à rien concrètement.

### Solution

Remplacer le countdown circulaire par un encart informatif qui montre clairement :

- **Quand toutes les révisions du jour sont faites** : un message "Révisions du jour terminées ✓" + la liste des prochaines révisions prévues (sourate, versets, page, date formatée "demain" ou jour de la semaine)
- **Quand les révisions ne sont pas encore faites** : garder le message "En attente de votre validation du jour" actuel mais sans l'horloge inutile

### Changements

`**src/components/muraja/MurajaCountdown.tsx**`

1. Supprimer tout le mécanisme de countdown (timer, SVG ring, calcul heures/minutes/secondes)
2. Ajouter une nouvelle prop `nextReviews` : `{ surahName: string; verseStart: number; verseEnd: number; page?: string; date: string }[]`
3. Quand `allChecked = false` : afficher un simple encart "En attente de ta validation du jour" avec icône Clock (sans countdown)
4. Quand `allChecked = true` : afficher "Révisions terminées ✓" + liste des prochaines révisions avec date (formatée : "demain", nom du jour, ou date)

`**src/pages/MurjaPage.tsx**`
5. Enrichir `nextTourReviews` avec les données de page (réutiliser `pageMap` existant) et le nom de sourate
6. Combiner `nextTourReviews` avec les prochains blocs rabt pour avoir une vue complète
7. Passer ces données au `MurajaCountdown` via la nouvelle prop `nextReviews`

### Fichiers modifiés

- `src/components/muraja/MurajaCountdown.tsx`
- `src/pages/MurjaPage.tsx`

faire pareil pour revision et liaison 