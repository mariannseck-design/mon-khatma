

## Plan : Activer Hifz pour les VIP

Le `/hifz` utilise `ComingSoonGate` avec `adminOnly`, ce qui le restreint aux admins uniquement. Il suffit de retirer la prop `adminOnly` pour que le gate utilise `hasFullAccess` (Admin + VIP).

### Changement

**`src/App.tsx`** (ligne 98) : Retirer `adminOnly` de la route `/hifz`

```tsx
// Avant
<ComingSoonGate title="Espace Hifz" ... adminOnly>

// Après
<ComingSoonGate title="Espace Hifz" ...>
```

Cela permettra aux VIP d'accéder à l'Espace Hifz (méthode Tikrar) via la condition `hasFullAccess` déjà en place dans `ComingSoonGate`.

