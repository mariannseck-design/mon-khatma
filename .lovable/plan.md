

## Supprimer les compteurs pour Omra et Hajj

Les duas d'Omra et Hajj sont des invocations de référence à lire, pas à compter. On va ajouter un mode "lecture seule" au `DhikrCounter`.

### Approche

1. **`DhikrItem` interface** — ajouter un champ optionnel `readOnly?: boolean`
2. **`DhikrCounter.tsx`** — quand `item.readOnly` est `true` :
   - Masquer le cercle compteur et le texte "Appuie pour compter"
   - Afficher un bouton "Suivant ➜" à la place pour passer au dhikr suivant
3. **`adhkarData.ts`** — ajouter `readOnly: true` à chaque item de `OMRA_DUAS` et `HAJJ_DUAS`

### Fichiers modifiés
- `src/components/dhikr/DhikrCounter.tsx`
- `src/lib/adhkarData.ts`

