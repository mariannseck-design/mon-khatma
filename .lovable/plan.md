

# Corrections du mode texte Coran

## Analyse des images de référence

Les images de référence montrent un Mushaf avec :
- **Numéros de versets** dans des cercles/médaillons **tous verts** (pas de rouge pour les multiples de 5)
- Texte arabe dense avec justification complète
- Style classique épuré

## Changement unique

### `src/components/quran/QuranTextView.tsx` — VerseCircle (lignes 57-58)

Supprimer la condition `isMultipleOf5` et fixer la couleur de fond à `#2E7D32` (vert) pour tous les numéros de versets sans exception.

```typescript
// Avant
const isMultipleOf5 = number % 5 === 0;
const bg = isMultipleOf5 ? '#D50000' : '#2E7D32';

// Après
const bg = '#2E7D32';
```

