
-- Step 1: Delete duplicate active goals, keeping only the most recent per user
DELETE FROM public.quran_goals
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM public.quran_goals
  WHERE is_active = true
  ORDER BY user_id, created_at DESC
)
AND is_active = true;

-- Step 2: Create a unique partial index to prevent future duplicates
CREATE UNIQUE INDEX unique_active_goal_per_user ON public.quran_goals (user_id) WHERE is_active = true;
