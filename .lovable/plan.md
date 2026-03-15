

## Plan : Mushaf pleine largeur

Le Mushaf est actuellement contraint par le padding du wrapper et le `space-y-2` interne. Pour qu'il remplisse toute la largeur disponible :

### Changements

1. **`HifzStepImpregnationTajweed.tsx`** — Sortir le `HifzMushafImage` du conteneur `text-center space-y-5` et lui appliquer des marges négatives (`-mx-4`) pour qu'il déborde du padding du wrapper et prenne toute la largeur écran.

2. **`HifzMushafImage.tsx`** — Supprimer le `rounded-xl` et le `border` du conteneur image quand il est en mode pleine largeur (ou par défaut), et s'assurer que l'image utilise `w-full` sans contrainte de marge latérale. Supprimer aussi le `space-y-2` du wrapper racine pour réduire l'espace vertical perdu.

Résultat : l'image Mushaf Tajweed occupera 100% de la largeur de l'écran, comme sur la capture de référence.

