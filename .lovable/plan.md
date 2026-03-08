

## Supprimer (عز وجل) de toutes les cartes Dhikr

### Changement unique

**`src/lib/adhkarData.ts`** : Supprimer toutes les occurrences de `(عز وجل)` dans le fichier (405 occurrences). Cela concerne les champs `french`, `phonetic` et `source` des adhkâr dans toutes les catégories (matin, soir, après prière, louanges, chifâ, etc.).

L'opération est un simple find-and-replace global :
- `(عز وجل)` → supprimé
- Nettoyer les espaces doubles résultants

Les mentions `(ﷺ)` et `(عليه السلام)` ne sont pas touchées.

