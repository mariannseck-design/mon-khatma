
-- Add tahajjud prayer to ramadan_daily_tasks
ALTER TABLE public.ramadan_daily_tasks ADD COLUMN IF NOT EXISTS prayer_tahajjud boolean NOT NULL DEFAULT false;

-- Create dhikr entries table for custom dhikr tracking
CREATE TABLE public.ramadan_dhikr_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entry_date TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  dhikr_name TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ramadan_dhikr_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own dhikr entries" ON public.ramadan_dhikr_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own dhikr entries" ON public.ramadan_dhikr_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own dhikr entries" ON public.ramadan_dhikr_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own dhikr entries" ON public.ramadan_dhikr_entries FOR DELETE USING (auth.uid() = user_id);
