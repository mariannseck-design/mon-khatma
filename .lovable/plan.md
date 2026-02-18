

# Correction : Celebraciones visibles pour toutes les lectrices

## Probleme

La table `quran_progress` a des politiques RLS qui limitent chaque utilisatrice a voir uniquement ses propres donnees. Seule l'administratrice peut voir toutes les lignes. Le composant `CollectiveCounter` fait un `SELECT` sur toutes les lignes, donc les utilisatrices normales ne voient que leurs propres statistiques (1 lectrice, leurs propres pages).

## Solution

Creer une **fonction base de donnees** avec `SECURITY DEFINER` qui retourne les statistiques agregees du jour (total de pages lues et nombre de lectrices actives) sans exposer les donnees individuelles. Cela respecte la confidentialite tout en permettant a chaque lectrice de voir les statistiques collectives.

### Etape 1 : Migration SQL

Creer une fonction `get_today_collective_stats()` :
- Calcule le total des pages lues aujourd'hui par toutes les utilisatrices
- Compte le nombre de lectrices uniques actives aujourd'hui
- Utilise `SECURITY DEFINER` pour contourner les politiques RLS
- Retourne uniquement des donnees agregees (pas de donnees individuelles)

### Etape 2 : Modifier `CollectiveCounter.tsx`

Remplacer la requete directe sur `quran_progress` par un appel a la fonction RPC `get_today_collective_stats()`. Cela retournera les vrais totaux pour toutes les utilisatrices, pas seulement les donnees de l'utilisatrice connectee.

## Fichiers concernes

- **Migration SQL** : nouvelle fonction `get_today_collective_stats()`
- **`src/components/cercle/CollectiveCounter.tsx`** : remplacer le `SELECT` par un appel RPC

## Securite

- Les donnees individuelles restent protegees par RLS
- Seules les statistiques agregees (totaux) sont accessibles
- Aucune donnee personnelle n'est exposee
