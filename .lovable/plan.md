

## Plan : Améliorer la hiérarchie visuelle des couleurs du Hifz Hub

### Problème
Les 3 cartes principales sont trop similaires visuellement (même dégradé émeraude + titres dorés), rendant la navigation peu intuitive. La carte "Mon Suivi Hifz" est trop discrète.

### Changements proposés dans `HifzHubPage.tsx`

**1. Carte "Continuer ma session"** (quand une session active existe)
- Dégradé plus sombre/profond : `#1B4332 → #2d6a4f` pour la distinguer comme action prioritaire
- Ajouter un léger liseré doré lumineux à gauche (accent visuel)

**2. Carte "Muraja'a"**
- Garder le dégradé sage actuel mais le rendre légèrement plus chaud/distinct : `#3a6b5a → #5a9a80`
- Badge : augmenter la taille du texte et ajouter un fond blanc au lieu du doré pour un meilleur contraste

**3. Carte "Mon Suivi Hifz"**
- Passer d'un fond `greenMist` plat à un fond beige chaud (`#f5f0e8`) avec une bordure émeraude plus marquée
- Augmenter le padding et le border-radius pour le rendre cohérent avec les cartes au-dessus (rounded-[2rem], p-7)

**4. Titres — varier les couleurs**
- Carte Tikrar : titre en blanc pur (pas doré) pour la différencier, sous-titre blanc/70
- Carte "Continuer" : titre doré (action en cours, attire l'oeil)
- Carte Muraja'a : titre en blanc, badge doré
- Mon Suivi : titre émeraude (déjà le cas, OK)

Ces changements créent une hiérarchie claire : session active (sombre + doré) > méthodes (émeraude standard) > révision (sage) > suivi (beige clair).

