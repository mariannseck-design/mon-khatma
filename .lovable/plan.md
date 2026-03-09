

## Plan : Corriger l'accès au Noble Coran pour les VIP sur la page Accueil

### Probleme
Ligne 325 de `src/pages/AccueilPage.tsx` est corrompue : `hasFullAccess       {isAdmin ? (` au lieu de `{hasFullAccess ? (`. Le texte `hasFullAccess` flotte en dehors du JSX et la condition utilise toujours `isAdmin`.

### Correction
**`src/pages/AccueilPage.tsx`** ligne 325 :
- Remplacer `hasFullAccess       {isAdmin ? (` par `              {hasFullAccess ? (`

Un seul caractere a changer, un seul fichier.

