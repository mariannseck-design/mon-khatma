

# Correction de l'export — JSON dans les tableaux

## Problème
La fonction `escapeSQL` traite les tableaux comme des tableaux PostgreSQL (`'{...}'`), mais `verses_reviewed` est une colonne **jsonb** contenant un tableau d'objets. Les objets sont convertis en `[object Object]` au lieu de JSON.

## Correction
Dans `escapeSQL`, quand une valeur est un **tableau**, vérifier si elle contient des objets. Si oui, la traiter comme du **jsonb** (avec `JSON.stringify`) plutôt que comme un tableau PostgreSQL natif.

## Fichier modifié
- `supabase/functions/export-all-data/index.ts` — modifier la fonction `escapeSQL` pour gérer correctement les tableaux d'objets en les sérialisant comme jsonb.

## Après correction
1. Republier l'app (automatique)
2. Revisiter le lien de la fonction pour obtenir un nouveau SQL corrigé
3. Cliquer **Clear** dans le SQL Editor, coller le nouveau SQL, puis **Run**

