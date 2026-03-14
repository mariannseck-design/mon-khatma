

# Plan de migration des données Test → Live

## Ce que vous devez faire

1. **Ouvrir le Backend** (bouton ci-dessus)
2. **S'assurer d'être sur l'environnement Test** (sélecteur en haut)
3. **Aller dans Database → Run SQL**
4. **Exécuter les requêtes d'export** que je vais générer — elles produiront des instructions `INSERT` prêtes à copier
5. **Basculer sur l'environnement Live**
6. **Coller et exécuter les INSERT** dans Run SQL côté Live

## Ce que je vais implémenter

Je vais créer une **Edge Function** `export-all-data` qui :
- Lit toutes les tables dans l'ordre correct (respect des foreign keys)
- Génère des instructions SQL `INSERT INTO ... VALUES (...)` pour chaque ligne
- Retourne un script SQL complet, prêt à copier-coller dans Run SQL côté Live

### Ordre d'import (foreign keys)
1. `profiles`, `allowed_emails`, `user_roles`
2. `sisters_circles`
3. `quran_goals`, `hifz_goals`, `notification_preferences`, `push_subscriptions`
4. `quran_progress`, `hifz_sessions`, `hifz_memorized_verses`, `hifz_streaks`, `mourad_sessions`, `muraja_sessions`
5. `circle_members`, `circle_messages`, `favorite_verses`, `favorite_douas`
6. `challenge_*`, `ramadan_*`, `daily_emotion_logs`

### Alternative plus simple
Plutôt qu'une Edge Function, je peux aussi générer directement des requêtes SQL `SELECT` → `COPY` que vous exécutez dans Run SQL pour produire les INSERT.

**Approche recommandée** : Edge Function car elle gère automatiquement l'échappement des données et l'ordre des tables.

## Étapes concrètes
1. Créer l'edge function `export-all-data`
2. L'appeler depuis Run SQL ou via curl pour obtenir le script SQL
3. Vous copiez le résultat et l'exécutez côté Live

