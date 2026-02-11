
-- Table for daily Ramadan routine checklist
CREATE TABLE public.ramadan_daily_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_date DATE NOT NULL DEFAULT CURRENT_DATE,
  prayer_fajr BOOLEAN NOT NULL DEFAULT false,
  prayer_dhuhr BOOLEAN NOT NULL DEFAULT false,
  prayer_asr BOOLEAN NOT NULL DEFAULT false,
  prayer_maghrib BOOLEAN NOT NULL DEFAULT false,
  prayer_isha BOOLEAN NOT NULL DEFAULT false,
  prayer_tarawih BOOLEAN NOT NULL DEFAULT false,
  sunnah_duha BOOLEAN NOT NULL DEFAULT false,
  sunnah_rawatib BOOLEAN NOT NULL DEFAULT false,
  sunnah_witr BOOLEAN NOT NULL DEFAULT false,
  reading_quran BOOLEAN NOT NULL DEFAULT false,
  reading_hadith BOOLEAN NOT NULL DEFAULT false,
  reading_dhikr BOOLEAN NOT NULL DEFAULT false,
  sadaqa BOOLEAN NOT NULL DEFAULT false,
  fasting BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_date)
);

-- Table for Taqwa review (gratitude + intentions)
CREATE TABLE public.ramadan_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  gratitude TEXT,
  intention TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, review_date)
);

-- Enable RLS
ALTER TABLE public.ramadan_daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ramadan_reviews ENABLE ROW LEVEL SECURITY;

-- RLS for ramadan_daily_tasks
CREATE POLICY "Users can view their own tasks" ON public.ramadan_daily_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tasks" ON public.ramadan_daily_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.ramadan_daily_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.ramadan_daily_tasks FOR DELETE USING (auth.uid() = user_id);

-- RLS for ramadan_reviews
CREATE POLICY "Users can view their own reviews" ON public.ramadan_reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reviews" ON public.ramadan_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.ramadan_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.ramadan_reviews FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_ramadan_daily_tasks_updated_at
  BEFORE UPDATE ON public.ramadan_daily_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ramadan_reviews_updated_at
  BEFORE UPDATE ON public.ramadan_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
