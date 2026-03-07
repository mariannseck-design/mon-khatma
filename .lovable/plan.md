

## Plan : Corriger la sauvegarde des versets mémorisés + affichage Muraja'a

### Problème identifié

La table `hifz_memorized_verses` est **vide** malgré les sessions Hifz. La cause : le code utilise `upsert` avec `onConflict: 'user_id,surah_number,verse_start,verse_end'` mais **aucune contrainte unique n'existe** sur ces colonnes. L'upsert échoue silencieusement.

### Corrections

**1. Migration : ajouter la contrainte unique manquante**

Ajouter un index unique sur `(user_id, surah_number, verse_start, verse_end)` dans `hifz_memorized_verses` pour que l'upsert fonctionne correctement.

**2. `src/pages/HifzPage.tsx` — sécuriser la sauvegarde**

- Ajouter un `try/catch` + log d'erreur autour de l'upsert pour détecter les échecs futurs.
- En fallback, utiliser `insert` si l'upsert échoue.

**3. `src/pages/MurjaPage.tsx` — affichage intelligent**

Quand des versets existent mais qu'aucun n'est dû aujourd'hui, au lieu de ne rien montrer après le countdown, afficher un résumé clair :
- Nombre total de versets ancrés
- Prochaine révision prévue le [date]
- Liste des sourates mémorisées avec leur prochaine date de révision

### Fichiers modifiés
- Migration SQL (contrainte unique)
- `src/pages/HifzPage.tsx`
- `src/pages/MurjaPage.tsx`

