

## Cartes Juz ouvertes par défaut

Remplacer `expandedJuz` (un seul Juz) par un `Set` contenant tous les Juz actifs, pour qu'ils soient tous dépliés par défaut.

### Modifications — `src/pages/HifzSuiviPage.tsx`

1. **State** : Remplacer `const [expandedJuz, setExpandedJuz] = useState<number | null>(null)` par `const [collapsedJuz, setCollapsedJuz] = useState<Set<number>>(new Set())`
2. **Toggle logic** : Au clic, ajouter/retirer du Set des Juz repliés
3. **Condition expanded** : `expanded = !collapsedJuz.has(juz.juzNumber)` (ouvert par défaut pour les actifs)

Un seul fichier modifié, logique inversée simple.

