

## Simplifier la logique Ar-Rabt vs Consolidation : basée sur `memorized_at`

### Problème actuel
La séparation repose sur le champ `liaison_status` (`'liaison'` ou `'tour'`) et `liaison_start_date`, mis à jour par une fonction `graduateLiaisonBlocks()`. Ce système est fragile : si la graduation ne se déclenche pas, les items restent bloqués. De plus, les items importés comme "solides" reçoivent directement `liaison_status = 'tour'` même s'ils ont été mémorisés récemment.

### Nouvelle règle (pure calcul de date)
- **Ar-Rabt** : `aujourd'hui - memorized_at < 30 jours` → affiché chaque jour
- **Consolidation** : `aujourd'hui - memorized_at >= 30 jours` → affiché selon SM-2 (`next_review_date`)

Le champ `memorized_at` existe déjà sur chaque ligne de `hifz_memorized_verses`.

### Fichiers modifiés

**1. `src/pages/MurjaPage.tsx`**

- **Ligne 145-147** (`rabtVerses`) : Remplacer le filtre `v.liaison_status === 'liaison'` par un calcul de date :
  ```ts
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoff = thirtyDaysAgo.toISOString();
  return allVerses.filter(v => v.memorized_at >= cutoff);
  ```

- **Ligne 149-159** (`tourVerses`) : Remplacer le filtre `liaison_status === 'tour'` par le filtre inverse (memorized_at < cutoff) + `next_review_date <= today` :
  ```ts
  const allDue = allVerses.filter(
    v => v.memorized_at < cutoff && v.next_review_date <= today
  );
  ```

- **Ligne 161-167** (`todayReviewedTourItems`) : Même logique inverse pour les items déjà révisés aujourd'hui.

- **Ligne 176-183** (`nextTourReviews`) : Adapter les filtres futurs pour utiliser le calcul de date au lieu de `liaison_status`. Les items rabt n'ont plus besoin d'être injectés comme "tomorrow" car ils apparaissent automatiquement chaque jour.

- **Supprimer l'appel à `graduateLiaisonBlocks`** (lignes 92-97) : Plus nécessaire car le transfert est automatique par calcul de date.

**2. `src/lib/hifzUtils.ts`**

- **`injectMemorizedVerses`** (lignes 140-165) : Pour la catégorie `'recent'`, utiliser `memorized_at = today - daysAlreadyDone` au lieu de manipuler `liaison_status`. Le `liaison_status` peut rester pour compatibilité mais n'est plus le critère de tri. Le `next_review_date` des items récents doit être mis au jour courant (ils seront affichés chaque jour via le filtre date de toute façon).

- **`graduateLiaisonBlocks`** : Garder la fonction mais elle peut devenir un no-op ou être supprimée. La graduation est désormais implicite par le passage du temps.

### Résultat
Tout item mémorisé il y a moins de 30 jours apparaît quotidiennement dans Ar-Rabt. Au 31ème jour, il bascule automatiquement dans Consolidation et suit l'algorithme SM-2. Aucune dépendance à `liaison_status` pour le tri d'affichage.

