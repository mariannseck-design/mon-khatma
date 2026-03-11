

## Remplacer l'icône lampe par un point d'info plus accessible

### Changement unique dans `src/pages/MurjaCalendarPage.tsx`

**Lignes ~272-273** : Remplacer `<Lightbulb className="h-3.5 w-3.5" />` par un petit cercle avec un `?` ou un `i` (point d'information), plus intuitif et universellement compris comme "cliquez pour en savoir plus".

Concrètement : remplacer l'icône `Lightbulb` par l'icône `Info` de Lucide (un cercle avec un "i"). Cette icône est un standard UX reconnu — les utilisateurs savent instinctivement qu'il faut taper dessus pour lire l'explication.

Import : remplacer `Lightbulb` par `Info` dans la ligne d'import Lucide.

