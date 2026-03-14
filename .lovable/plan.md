

## Diagnostic du Planificateur — Bugs identifiés

### Problème principal : calcul de pages incorrect dans ReadingSlider

Le composant `ReadingSlider.tsx` (section "Où je me suis arrêté(e)") a un bug critique dans sa logique de calcul :

```typescript
// Ligne 43 — logique actuelle
const pagesRead = Math.max(1, page - totalPagesRead);
```

**Scénarios qui cassent :**
1. L'utilisatrice est à la page 15 (`totalPagesRead = 15`), elle entre page 10 par erreur → `Math.max(1, 10-15) = 1` → ça ajoute 1 page au lieu de corriger la position
2. L'utilisatrice entre la même page une 2e fois → ça ajoute 1 page à chaque fois
3. Impossible de corriger sa position — le système est purement additif, pas un "marque-page"

### Correction proposée

Transformer la logique pour que le numéro de page entré **devienne** la nouvelle position (marque-page), pas un calcul de différence :

**`src/components/planificateur/ReadingSlider.tsx`** :
- Si la page entrée > `totalPagesRead` → enregistrer la différence (cas normal, elle avance)
- Si la page entrée ≤ `totalPagesRead` → ne rien ajouter, mais permettre l'enregistrement comme correction de position (toast informatif)
- Ajouter une validation : si la page entrée est 0 ou invalide, bloquer

**`src/pages/PlanificateurPage.tsx`** :
- Adapter `logReading` pour accepter un mode "set position" en plus du mode "add pages"
- Ajouter une fonction `setReadingPosition(page)` qui met à jour `totalPagesRead` directement dans la DB au lieu d'ajouter

### Fichiers modifiés

| Fichier | Modification |
|---|---|
| `src/components/planificateur/ReadingSlider.tsx` | Passer la page brute au parent au lieu de calculer la différence |
| `src/pages/PlanificateurPage.tsx` | Nouvelle logique `logReading` qui gère position absolue vs ajout |

