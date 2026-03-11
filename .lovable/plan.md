

## Problème identifié

Les versets en phase de **liaison** (`liaison_status === 'liaison'`) ne sont **jamais** inclus dans la liste "Prochaines révisions" affichée dans le `MurajaCountdown` ni dans `nextTourReviews` du `MurajaChecklist`.

**Raison technique** : Deux filtres excluent les versets de liaison :

1. **`nextReviewsForCountdown`** (ligne 241) filtre `v.next_review_date > today` — mais les versets en liaison gardent leur `next_review_date` à aujourd'hui ou dans le passé (jamais mis à jour vers demain dans `handleRabtCheck`, ligne 274-277, seul `last_reviewed_at` est mis à jour).

2. **`nextTourReviews`** (ligne 164) filtre explicitement `v.liaison_status === 'tour' || !v.liaison_status`, excluant les versets de liaison.

Les versets mémorisés cette semaine sont en phase de liaison quotidienne → ils n'apparaissent jamais dans le programme de demain.

## Corrections

### `src/pages/MurjaPage.tsx`

1. **`nextReviewsForCountdown`** (lignes 241-261) : Inclure les versets en liaison comme révisions de demain. Ajouter les `rabtVerses` avec la date de demain et type `'rabt'`, les fusionner avec les révisions tour existantes, trier par date, et limiter à 5.

2. **`nextTourReviews`** (lignes 161-168) : Inclure aussi les versets en liaison (ils seront affichés avec une date "demain" dans le MurajaChecklist quand la section tour est vide).

### Fichier modifié
- `src/pages/MurjaPage.tsx` — 2 blocs `useMemo` à ajuster

