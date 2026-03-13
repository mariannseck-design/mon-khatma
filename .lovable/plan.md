

## Ajouter un bouton "Continuer la mémorisation" sur le hub Muraja'a

Ajouter un bouton vert arrondi avec une flèche `>` (style identique à la capture), placé après les deux cartes existantes, qui redirige vers la page de mémorisation `/hifz`.

### Changement

**`src/pages/MurajaHubPage.tsx`** :
- Importer `ChevronRight` de lucide-react
- Ajouter un bouton `motion.button` après la carte Consolidation (ligne ~244), avec :
  - Texte : "Continuer la mémorisation"
  - Style : fond vert foncé (`var(--p-primary)`), texte blanc, coins arrondis complets (`rounded-full`), icône `ChevronRight` à droite
  - Navigation vers `/hifz` au clic
  - Animation `whileTap` pour le feedback tactile

