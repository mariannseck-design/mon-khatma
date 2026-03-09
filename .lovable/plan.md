

## Plan : Renommer « Tikrar » en « Istiqâmah » + bouton info

### Fichiers impactés et changements

**1. `src/components/hifz/HifzStep3Memorisation.tsx`**
- Ligne 314 : `stepTitle="Tikrar"` → `stepTitle="Istiqâmah"`
- Ligne 326 : Remplacer `L'ancrage d'acier` par `Istiqâmah`
- Ligne 326 : Ajouter un bouton icône `Info` (lucide-react) à côté du titre, qui ouvre un Popover/Tooltip affichant le texte explicatif
- Ligne 338 : `Mode d'emploi du Tikrar` → `Mode d'emploi de l'Istiqâmah`
- Import `Info` de lucide-react + composants Tooltip ou Popover

**2. `src/pages/HifzPage.tsx`**
- Ligne 62 : `'Ancrage (Tikrar)'` → `'Istiqâmah'`

**3. `src/pages/AccueilPage.tsx`**
- Ligne 79 : `'Ancrage (Tikrar)'` → `'Istiqâmah'`

**4. `src/components/hifz/HifzSuccess.tsx`**
- Ligne 9 : `3: 'Tikrar'` → `3: 'Istiqâmah'`

**5. `src/components/hifz/HifzConfig.tsx`**
- Ligne 208 : `Commencer l'ancrage` → `Commencer l'Istiqâmah`

### Bouton info (détail technique)
Un composant Popover (déjà disponible dans le projet) sera utilisé à côté du titre « Istiqâmah » avec une icône `Info` (16px, doré). Au clic, il affiche :

> « L'Istiqâmah désigne la constance, la droiture et la persévérance. Nous avons choisi ce nom car la régularité et l'effort continu sont les véritables clés pour graver ces versets dans votre cœur. »

