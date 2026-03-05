CREATE TABLE public.khatma_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  display_name TEXT,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.khatma_completions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read completions (for the announcement)
CREATE POLICY "Anyone can read khatma completions" ON public.khatma_completions
  FOR SELECT TO authenticated USING (true);

-- Users can insert their own completions
CREATE POLICY "Users can insert own completions" ON public.khatma_completions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);