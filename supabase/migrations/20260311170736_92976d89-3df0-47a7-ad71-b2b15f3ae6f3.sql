
CREATE TABLE public.mourad_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  surah_number INTEGER NOT NULL,
  verse_start INTEGER NOT NULL,
  verse_end INTEGER NOT NULL,
  current_phase INTEGER NOT NULL DEFAULT 1,
  phase_status JSONB NOT NULL DEFAULT '{}'::jsonb,
  listen_count INTEGER NOT NULL DEFAULT 0,
  repetition_40_count INTEGER NOT NULL DEFAULT 0,
  maintenance_day INTEGER NOT NULL DEFAULT 0,
  maintenance_start_date DATE,
  reciter_id TEXT NOT NULL DEFAULT 'ar.alafasy',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.mourad_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mourad_sessions" ON public.mourad_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mourad_sessions" ON public.mourad_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mourad_sessions" ON public.mourad_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mourad_sessions" ON public.mourad_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);
