

## Désactiver l'accès au Coran pour les non-admins

### Points d'accès identifiés

1. **Route `/quran-reader`** dans `App.tsx` — accessible à tous les utilisateurs connectés
2. **Page Accueil** — la carte "Le Noble Coran" est déjà grisée pour les non-admins (utilise `isAdmin`), mais il faut vérifier qu'elle utilise bien `isAdmin` et pas `hasFullAccess`
3. **Défis (Al-Mulk, Al-Kahf, Al-Baqara)** — les boutons "Lire" redirigent vers `/quran-reader` (déjà désactivés quand `disabled=true`)
4. **Page Favoris** — le bouton "Ouvrir le Mushaf" et la fonction `openInMushaf` redirigent vers `/quran-reader`

### Changements

**1. `src/App.tsx`** (ligne 85)
- Envelopper la route `/quran-reader` dans un `ComingSoonGate` pour la restreindre aux admins uniquement (pas `hasFullAccess`)

**2. `src/pages/AccueilPage.tsx`** (ligne 325)
- Confirmer que la carte Coran utilise `isAdmin` (pas `hasFullAccess`) — c'est déjà le cas, rien à changer

**3. `src/pages/FavorisPage.tsx`**
- Conditionner le bouton "Ouvrir le Mushaf" et la fonction `openInMushaf` : ne naviguer vers `/quran-reader` que si `isAdmin`, sinon afficher un toast "Bientôt disponible"

**4. Défis** — les boutons "Lire" sont déjà désactivés quand `disabled=true`, qui est contrôlé par `!hasFullAccess`. Il faut les rendre toujours désactivés pour le Coran sauf si admin. Mais comme les défis sont déjà disabled pour les non-VIP, et que les admins ont accès, c'est déjà correct. Rien à changer.

### Résumé : 2 fichiers à modifier
- `App.tsx` : ajouter `ComingSoonGate` sur la route `/quran-reader`
- `FavorisPage.tsx` : bloquer la navigation vers le Mushaf pour les non-admins

