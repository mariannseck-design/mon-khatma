

## Afficher un retour à la ligne après la Basmala dans les cartes Dhikr

### Problème
Les textes arabes contiennent déjà des `\n` après la Basmala dans les données (`adhkarData.ts`), mais le composant `DhikrCounter` utilise un simple `<p>{item.arabic}</p>` qui ne rend pas les sauts de ligne.

### Solution
**`src/components/dhikr/DhikrCounter.tsx`** : Ajouter `whiteSpace: 'pre-line'` au style du paragraphe arabe (ligne 82-91). Cela suffit pour que les `\n` existants soient rendus comme des retours à la ligne visibles.

Aucune modification des données nécessaire — les `\n` sont déjà en place dans `adhkarData.ts`.

