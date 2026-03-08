

## Transformer la carte Al-Kahf en thème "Caverne sablée"

### Changements — `src/components/defis/DefiAlKahf.tsx`

**1. Palette de couleurs** — Remplacer les tons navy par des tons sable/brun caverne :
```
COLORS = {
  cave: '#3B2F1E',        // brun foncé (fond principal)
  caveLight: '#5C4A32',   // brun moyen
  sand: '#C2A66B',        // sable doré (accent)
  sandLight: '#D4BF8A',   // sable clair
}
```

**2. Icône** — Remplacer `BookOpen` par `Mountain` (lucide-react) qui évoque une caverne/montagne, avec la couleur sable.

**3. Gradient du fond** — `linear-gradient(135deg, #3B2F1E 0%, #5C4A32 100%)` pour un effet caverne sablée.

**4. Dialog de célébration** — Même palette brun/sable, emoji 🕌 conservé.

**5. Bouton de validation** — Fond sable `#C2A66B` avec texte brun foncé `#3B2F1E`.

Toutes les références à `COLORS.navy`, `COLORS.navyLight`, `COLORS.goldAccent` seront mises à jour vers les nouvelles valeurs.

