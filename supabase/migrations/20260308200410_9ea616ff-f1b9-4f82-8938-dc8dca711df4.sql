CREATE TABLE public.challenge_kahf (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_key TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week_key)
);

ALTER TABLE public.challenge_kahf ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own kahf" ON public.challenge_kahf FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own kahf" ON public.challenge_kahf FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own kahf" ON public.challenge_kahf FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own kahf" ON public.challenge_kahf FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.get_defis_collective_stats()
 RETURNS json
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT json_build_object(
    'mulk_participants', (
      SELECT COUNT(DISTINCT user_id) FROM public.challenge_mulk
      WHERE week_key = (
        'mulk_week_' || EXTRACT(YEAR FROM now())::text || '_' ||
        CEIL((EXTRACT(DOY FROM now()) + EXTRACT(DOW FROM (DATE_TRUNC('year', now())))::int) / 7.0)::text
      )
    ),
    'baqara_participants', (
      SELECT COUNT(DISTINCT user_id) FROM public.challenge_baqara
    ),
    'kahf_participants', (
      SELECT COUNT(DISTINCT user_id) FROM public.challenge_kahf
      WHERE week_key = (
        'kahf_week_' || EXTRACT(YEAR FROM now())::text || '_' ||
        EXTRACT(WEEK FROM now())::text
      )
      AND completed = true
    )
  );
$$;