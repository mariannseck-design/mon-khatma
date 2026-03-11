

## Plan : Améliorer la visibilité sur la barre MA KHATMA

### Problèmes identifiés
1. L'icône `Target` (cercle/cible) a `color: COLORS.goldAccent` — doré sur fond doré, invisible.
2. Le sous-texte "(Mon objectif)" est en `text-white/70` et `font-normal text-xs` — trop discret sur fond doré.

### Modifications dans `AccueilPage.tsx` (ligne 210-211)

**Icône Target** : passer la couleur en blanc (`#fff`) pour qu'elle ressorte sur le fond doré.

**Sous-texte "(Mon objectif)"** : remplacer `font-normal text-xs text-white/70` par `font-bold text-xs text-white` pour le rendre visible et lisible.

