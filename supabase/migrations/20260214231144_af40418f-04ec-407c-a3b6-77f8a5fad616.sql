
-- Table for Ramadan reading goals (daily commitment)
CREATE TABLE public.ramadan_reading_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  first_name TEXT NOT NULL,
  daily_pages INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.ramadan_reading_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reading goal"
  ON public.ramadan_reading_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reading goal"
  ON public.ramadan_reading_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading goal"
  ON public.ramadan_reading_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading goal"
  ON public.ramadan_reading_goals FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_ramadan_reading_goals_updated_at
  BEFORE UPDATE ON public.ramadan_reading_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Table for weekly reports
CREATE TABLE public.ramadan_weekly_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  goal_met BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE public.ramadan_weekly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own weekly reports"
  ON public.ramadan_weekly_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weekly reports"
  ON public.ramadan_weekly_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly reports"
  ON public.ramadan_weekly_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly reports"
  ON public.ramadan_weekly_reports FOR DELETE
  USING (auth.uid() = user_id);
