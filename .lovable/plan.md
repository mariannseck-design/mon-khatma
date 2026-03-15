

## Plan : Limiter la hauteur du Mushaf et ajouter un scroll interne

### Changement — 1 fichier

**`src/components/hifz/istiqamah/StepImmersion.tsx`** — fonction `renderMushaf` (ligne ~505)

Remplacer `maxHeight="none"` par une hauteur limitée (ex. `maxHeight="350px"`) sur le composant `HifzMushafImage`. Le composant gère déjà le scroll interne via `overflow-auto` dans son container — il suffit de rétablir une hauteur max.

```tsx
// Avant
<HifzMushafImage ... maxHeight="none" fullWidth />

// Après
<HifzMushafImage ... maxHeight="350px" fullWidth />
```

Le composant `HifzMushafImage` utilise déjà `overflow-auto` sur son container (visible dans le code fourni), donc la barre de défilement verticale apparaîtra automatiquement dès que l'image dépasse 350px. L'indicateur de scroll (flèche animée) existant restera fonctionnel.

