
-- Table for Al-Mulk weekly challenge
CREATE TABLE public.challenge_mulk (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  week_key text NOT NULL,
  days boolean[] NOT NULL DEFAULT '{false,false,false,false,false,false,false}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_key)
);

ALTER TABLE public.challenge_mulk ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mulk" ON public.challenge_mulk FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mulk" ON public.challenge_mulk FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mulk" ON public.challenge_mulk FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mulk" ON public.challenge_mulk FOR DELETE USING (auth.uid() = user_id);

-- Table for Al-Baqara challenge
CREATE TABLE public.challenge_baqara (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_days integer NOT NULL,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  checked_days date[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.challenge_baqara ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own baqara" ON public.challenge_baqara FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own baqara" ON public.challenge_baqara FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own baqara" ON public.challenge_baqara FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own baqara" ON public.challenge_baqara FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_challenge_mulk_updated_at BEFORE UPDATE ON public.challenge_mulk FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenge_baqara_updated_at BEFORE UPDATE ON public.challenge_baqara FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
