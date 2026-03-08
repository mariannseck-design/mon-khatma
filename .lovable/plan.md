

## Donner accès aux fonctionnalités via une liste d'emails autorisés

### Approche

Ajouter un concept de "VIP access" via une liste d'emails dans le `AuthContext`. Les composants qui vérifient `isAdmin` pour débloquer les fonctionnalités vérifieront aussi un nouveau flag `hasFullAccess`.

### Changements

**1. `src/contexts/AuthContext.tsx`**
- Ajouter une constante `ALLOWED_EMAILS` (liste d'emails autorisés)
- Ajouter un booléen `hasFullAccess` dans le contexte (`true` si admin OU email dans la liste)
- Exposer `hasFullAccess` dans `AuthContextType`

```ts
const ALLOWED_EMAILS: string[] = [
  'exemple@email.com',
  // Ajouter ici les emails autorisés
];

// hasFullAccess = isAdmin || ALLOWED_EMAILS.includes(user.email)
```

**2. `src/pages/DhikrPage.tsx`**
- Remplacer `isAdmin` par `hasFullAccess` pour le contrôle d'accès aux cartes

**3. `src/pages/EmotionsPage.tsx`**
- Idem, remplacer `isAdmin` par `hasFullAccess`

**4. `src/components/layout/ComingSoonGate.tsx`**
- Remplacer `isAdmin` par `hasFullAccess` pour débloquer les pages protégées (Hifz, Muraja'a, Duas, etc.)

### Fonctionnement

- Tu ajoutes un email dans la liste `ALLOWED_EMAILS` → cette utilisatrice a accès à tout comme un admin, **sauf** le dashboard admin qui reste réservé à `isAdmin`
- Pour ajouter/retirer un accès, il suffit de modifier la liste dans le code

