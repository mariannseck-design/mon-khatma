

## Étendre le Mode Testeur aux utilisatrices VIP

### Problème
Le mode testeur (bouton Skip) est actuellement réservé aux admins (`isAdmin`). Tu veux l'ouvrir à tous les accès complets (admin + VIP).

### Modifications

**1. `src/hooks/useDevMode.ts`** — Remplacer `isAdmin` par `hasFullAccess` partout :
- Import `hasFullAccess` au lieu de `isAdmin` depuis `useAuth()`
- Gate sur `hasFullAccess` dans le `useEffect`, `toggleDevMode` et le return

**2. `src/pages/ProfilPage.tsx`** — Afficher le toggle Dev Mode pour les VIP aussi :
- Remplacer la condition `{isAdmin && (` par `{hasFullAccess && (`
- Importer `hasFullAccess` depuis `useAuth()`

### Résultat
Toute utilisatrice admin ou VIP (email dans `allowed_emails`) pourra activer le mode testeur et utiliser le bouton Skip dans les sessions Hifz et Mourad.

