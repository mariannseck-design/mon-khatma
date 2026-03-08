
-- Create hifz_goals table
CREATE TABLE public.hifz_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  goal_period text NOT NULL,
  goal_unit text NOT NULL,
  goal_value numeric NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add validation trigger instead of CHECK constraints
CREATE OR REPLACE FUNCTION public.validate_hifz_goal()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.goal_period NOT IN ('daily', 'weekly') THEN
    RAISE EXCEPTION 'goal_period must be daily or weekly';
  END IF;
  IF NEW.goal_unit NOT IN ('verses', 'pages') THEN
    RAISE EXCEPTION 'goal_unit must be verses or pages';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_hifz_goal
  BEFORE INSERT OR UPDATE ON public.hifz_goals
  FOR EACH ROW EXECUTE FUNCTION public.validate_hifz_goal();

-- Create unique index for one active goal per user
CREATE UNIQUE INDEX unique_active_hifz_goal ON public.hifz_goals (user_id) WHERE (is_active = true);

-- Enable RLS
ALTER TABLE public.hifz_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own hifz_goals" ON public.hifz_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hifz_goals" ON public.hifz_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hifz_goals" ON public.hifz_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own hifz_goals" ON public.hifz_goals FOR DELETE USING (auth.uid() = user_id);
