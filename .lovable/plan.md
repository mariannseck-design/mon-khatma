

## Adoucir la palette et renommer le titre

### 1. Palette — tons soleil/ambre au lieu du brun foncé

```
COLORS = {
  cave: '#7A5C2E',        // brun doré chaud (fond)
  caveLight: '#A07D45',   // ambre moyen
  sand: '#F5D87A',        // jaune soleil
  sandLight: '#FBE9A0',   // jaune clair
}
```

### 2. Titre — reformater

Actuellement : `La Lumière du Vendredi`

Nouveau rendu :
- Ligne 1 : **La Lumière** (taille actuelle, bold)
- Ligne 2 : `du Vendredi` en plus petit (`text-xs`) et opacité réduite

### 3. Gradient mis à jour

`linear-gradient(135deg, #7A5C2E 0%, #A07D45 100%)` — plus lumineux, évoquant le soleil couchant.

Fichier modifié : `src/components/defis/DefiAlKahf.tsx`

