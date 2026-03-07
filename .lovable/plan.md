

## Plan : Rendre le compteur communautaire visible pour tous

### Modification unique

**`src/pages/AccueilPage.tsx`** : Retirer la condition `{isAdmin && ...}` autour de `<DefisCommunityCounter />` pour qu'il s'affiche pour tous les utilisateurs, sous les défis (qu'ils soient actifs ou inactifs).

Le compteur utilise déjà une fonction RPC `SECURITY DEFINER` (`get_defis_collective_stats`) qui agrège les données anonymement — aucun changement backend nécessaire.

