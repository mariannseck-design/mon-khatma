

## Plan : Ouvrir toutes les rubriques aux utilisatrices VIP (sauf Admin Dashboard)

Le principe : partout où `isAdmin` est utilisé pour restreindre l'accès à une fonctionnalité, le remplacer par `hasFullAccess` (qui inclut admin + emails autorisés). Le seul endroit qui reste `isAdmin` est le lien vers le dashboard Admin dans le Header et le ProfilPage.

### Fichiers à modifier

**1. `src/components/layout/ComingSoonGate.tsx`** (ligne 18)
- Supprimer la distinction `adminOnly` : toujours utiliser `hasFullAccess` pour décider si on affiche le contenu ou l'écran "Bientôt disponible".
- `if (hasFullAccess) return <>{children}</>;`

**2. `src/pages/AccueilPage.tsx`**
- Ligne 41 : ajouter `hasFullAccess` au destructuring de `useAuth()`
- Ligne 325 : Quran card — remplacer `isAdmin` par `hasFullAccess`
- Lignes 570-577 : Défis — remplacer `!isAdmin` par `!hasFullAccess`

**3. `src/pages/FavorisPage.tsx`**
- Ligne 33 : ajouter `hasFullAccess` au destructuring
- Lignes 52, 111, 114 : remplacer `isAdmin` par `hasFullAccess` pour l'accès au Mushaf

**4. `src/pages/EmotionsPage.tsx`**
- Supprimer la logique `adminOnly` sur les dhikr cards : toutes les cartes deviennent accessibles si `hasFullAccess`
- Lignes 201, 233, 320 : remplacer `isAdmin` par `hasFullAccess`

### Ce qui ne change PAS
- `Header.tsx` : le lien Admin Dashboard reste protégé par `isAdmin`
- `ProfilPage.tsx` : le badge admin reste `isAdmin`
- `AdminPage.tsx` : reste `isAdmin`

