

## Plan : Restreindre Hifz aux admins uniquement, garder Muraja'a et Suivi pour les VIP

### Problème
Actuellement, `/hifz` est derrière un `ComingSoonGate` qui laisse passer les VIP (`hasFullAccess`). L'objectif est de bloquer `/hifz` pour les VIP aussi (admin uniquement), tout en gardant `/muraja`, `/hifz-suivi` et `/hifz-hub` accessibles aux VIP.

### Changements

**1. `src/App.tsx`** — Route `/hifz`
- Ajouter le prop `adminOnly` au `ComingSoonGate` existant (il est déjà dans l'interface mais pas utilisé dans la logique).

**2. `src/components/layout/ComingSoonGate.tsx`**
- Modifier la condition de passage : si `adminOnly` est `true`, seuls les admins passent (`isAdmin`). Sinon, `hasFullAccess` suffit comme avant.
- Ligne 18 : `if (adminOnly ? isAdmin : hasFullAccess) return <>{children}</>;`

**3. `src/pages/HifzHubPage.tsx`** — Carte "Méthode Tikrar"
- Conditionner le lien vers `/hifz` : si `isAdmin`, le lien fonctionne normalement. Sinon, afficher "Bientôt disponible" au tap (même pattern que la carte Mourad), ou désactiver le lien avec un indicateur visuel.

