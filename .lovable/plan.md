

# Supprimer la citation du jour de HifzHubPage

## Changement

Retirer le bloc `<DailyQuote />` et son import de `src/pages/HifzHubPage.tsx`.

## Fichier modifié

**`src/pages/HifzHubPage.tsx`**
- Supprimer l'import de `DailyQuote`
- Supprimer le `<motion.div variants={itemVariants}>` qui encapsule `<DailyQuote />`

