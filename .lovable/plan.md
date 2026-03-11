

## Retirer le label "Lecture seule" sur les jours futurs

**Fichier** : `src/pages/MurjaCalendarPage.tsx`

**Modification** (ligne ~262) : Supprimer `{isFutureDay && ' · Lecture seule'}` du label du jour sélectionné.

Le verrouillage visuel des cartes (icône cadenas, opacité réduite, non-cliquable) reste en place pour protéger l'algorithme de répétition espacée — seul le texte "Lecture seule" disparaît.

