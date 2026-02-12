
-- Add custom_good_deeds column to ramadan_daily_tasks
ALTER TABLE public.ramadan_daily_tasks ADD COLUMN custom_good_deeds text[] DEFAULT '{}';
