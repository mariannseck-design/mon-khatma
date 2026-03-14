

# Correction : Export par lots

## Problème
Le script SQL contient toutes les tables en un seul bloc (~867+ lignes d'INSERT). L'éditeur SQL coupe la connexion avant la fin (timeout).

## Solution
Modifier la fonction `export-all-data` pour accepter un paramètre `?batch=1`, `?batch=2`, etc. Chaque batch exportera seulement quelques tables à la fois.

### Découpage proposé
- **Batch 1** : `profiles`, `allowed_emails`, `user_roles`, `sisters_circles`, `quran_goals`, `hifz_goals`, `notification_preferences`, `push_subscriptions`, `reading_reminders`
- **Batch 2** : `quran_progress`, `hifz_sessions`, `hifz_memorized_verses`, `hifz_streaks`, `mourad_sessions`, `muraja_sessions`, `khatma_completions`
- **Batch 3** : `circle_members`, `circle_messages`, `circle_message_likes`, `favorite_verses`
- **Batch 4** : `challenge_baqara`, `challenge_kahf`, `challenge_mulk`, `mood_entries`, `ramadan_reading_goals`, `ramadan_daily_tasks`, `ramadan_dhikr_entries`, `ramadan_reviews`, `ramadan_weekly_reports`

## Fichier modifié
- `supabase/functions/export-all-data/index.ts` — ajouter le paramètre `batch` pour exporter par groupes de tables

## Utilisation
1. Ouvrir `…/export-all-data?batch=1` → copier → coller dans SQL Editor → Run
2. Répéter pour `?batch=2`, `?batch=3`, `?batch=4`
3. 4 petits scripts au lieu d'un gros = pas de timeout

