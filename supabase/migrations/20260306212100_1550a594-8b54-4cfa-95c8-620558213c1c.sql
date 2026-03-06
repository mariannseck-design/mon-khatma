
-- Table: hifz_sessions
CREATE TABLE public.hifz_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  surah_number integer NOT NULL,
  start_verse integer NOT NULL,
  end_verse integer NOT NULL,
  repetition_level integer NOT NULL DEFAULT 20,
  current_step integer NOT NULL DEFAULT 0,
  step_status jsonb DEFAULT '{}'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hifz_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hifz_sessions" ON public.hifz_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hifz_sessions" ON public.hifz_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hifz_sessions" ON public.hifz_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own hifz_sessions" ON public.hifz_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Table: hifz_memorized_verses
CREATE TABLE public.hifz_memorized_verses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  surah_number integer NOT NULL,
  verse_start integer NOT NULL,
  verse_end integer NOT NULL,
  memorized_at timestamptz NOT NULL DEFAULT now(),
  last_reviewed_at timestamptz,
  sm2_interval real NOT NULL DEFAULT 1,
  sm2_ease_factor real NOT NULL DEFAULT 2.5,
  sm2_repetitions integer NOT NULL DEFAULT 0,
  next_review_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hifz_memorized_verses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memorized_verses" ON public.hifz_memorized_verses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memorized_verses" ON public.hifz_memorized_verses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memorized_verses" ON public.hifz_memorized_verses FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memorized_verses" ON public.hifz_memorized_verses FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Table: muraja_sessions
CREATE TABLE public.muraja_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_type text NOT NULL DEFAULT 'rabt',
  verses_reviewed jsonb DEFAULT '[]'::jsonb,
  difficulty_rating text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.muraja_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own muraja_sessions" ON public.muraja_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own muraja_sessions" ON public.muraja_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own muraja_sessions" ON public.muraja_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own muraja_sessions" ON public.muraja_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Table: hifz_streaks
CREATE TABLE public.hifz_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_active_date date,
  total_tours_completed integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hifz_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hifz_streaks" ON public.hifz_streaks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hifz_streaks" ON public.hifz_streaks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hifz_streaks" ON public.hifz_streaks FOR UPDATE TO authenticated USING (auth.uid() = user_id);
