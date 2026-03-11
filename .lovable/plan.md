

## Supprimer le compteur communautaire du Hifz Hub

### Changement

Retirer le composant `HifzCommunityCounter` de la page `HifzHubPage.tsx` — l'import et le bloc `<motion.div>` qui l'encapsule.

### Fichier modifié

**`src/pages/HifzHubPage.tsx`** — Supprimer l'import de `HifzCommunityCounter` et le bloc motion correspondant (le premier `<motion.div variants={itemVariants}>` contenant `<HifzCommunityCounter />`).

