-- Create enum for theme colors
CREATE TYPE public.theme_color AS ENUM ('emerald', 'ocean', 'sunset', 'midnight');

-- Create enum for prayer types
CREATE TYPE public.prayer_type AS ENUM (
  'fajr_sunnah', 'dhuhr_before', 'dhuhr_after', 'asr_sunnah', 
  'maghrib_after', 'isha_before', 'isha_after', 'witr',
  'duha', 'tahajjud', 'ishraq', 'awwabin'
);

-- Create profiles table with theme preferences
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  theme_color theme_color DEFAULT 'emerald',
  onboarding_completed BOOLEAN DEFAULT false,
  streak_days INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  ramadan_mode BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create daily prayer tracker
CREATE TABLE public.prayer_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  prayer_type prayer_type NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, date, prayer_type)
);

-- Create adhkar/zikr tracker
CREATE TABLE public.adhkar_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  adhkar_type TEXT NOT NULL, -- 'morning', 'evening', 'after_prayer'
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, date, adhkar_type)
);

-- Create Hifz (Quran memorization) tracker
CREATE TABLE public.hifz_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  surah_number INTEGER NOT NULL CHECK (surah_number >= 1 AND surah_number <= 114),
  ayah_start INTEGER NOT NULL,
  ayah_end INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'learning', -- 'learning', 'memorized', 'reviewing'
  last_reviewed TIMESTAMP WITH TIME ZONE,
  next_review DATE, -- For spaced repetition
  review_count INTEGER DEFAULT 0,
  ease_factor NUMERIC(3,2) DEFAULT 2.50, -- For SM-2 algorithm
  interval_days INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create Ramadan journal
CREATE TABLE public.ramadan_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  morning_objectives TEXT,
  evening_reflection TEXT,
  gratitude_notes TEXT,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, date)
);

-- Create badges/rewards table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  points_required INTEGER DEFAULT 0,
  category TEXT NOT NULL, -- 'streak', 'hifz', 'prayer', 'ramadan'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user badges junction table
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, badge_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adhkar_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hifz_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ramadan_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Prayer tracker policies
CREATE POLICY "Users can view their own prayers" ON public.prayer_tracker
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prayers" ON public.prayer_tracker
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prayers" ON public.prayer_tracker
  FOR UPDATE USING (auth.uid() = user_id);

-- Adhkar tracker policies
CREATE POLICY "Users can view their own adhkar" ON public.adhkar_tracker
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own adhkar" ON public.adhkar_tracker
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own adhkar" ON public.adhkar_tracker
  FOR UPDATE USING (auth.uid() = user_id);

-- Hifz progress policies
CREATE POLICY "Users can view their own hifz" ON public.hifz_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hifz" ON public.hifz_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hifz" ON public.hifz_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hifz" ON public.hifz_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Ramadan journal policies
CREATE POLICY "Users can view their own journal" ON public.ramadan_journal
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal" ON public.ramadan_journal
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal" ON public.ramadan_journal
  FOR UPDATE USING (auth.uid() = user_id);

-- Badges are public read
CREATE POLICY "Anyone can view badges" ON public.badges
  FOR SELECT USING (true);

-- User badges policies
CREATE POLICY "Users can view their own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges" ON public.user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hifz_progress_updated_at
  BEFORE UPDATE ON public.hifz_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ramadan_journal_updated_at
  BEFORE UPDATE ON public.ramadan_journal
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default badges
INSERT INTO public.badges (name, description, icon, points_required, category) VALUES
  ('First Step', 'Complete your first prayer tracker entry', 'footprints', 0, 'prayer'),
  ('Week Warrior', 'Maintain a 7-day streak', 'flame', 100, 'streak'),
  ('Month Master', 'Maintain a 30-day streak', 'trophy', 500, 'streak'),
  ('Hifz Beginner', 'Start memorizing your first ayah', 'book-open', 0, 'hifz'),
  ('Surah Complete', 'Complete memorizing a full surah', 'award', 200, 'hifz'),
  ('Morning Light', 'Complete morning adhkar 7 days in a row', 'sunrise', 150, 'prayer'),
  ('Night Devotee', 'Complete evening adhkar 7 days in a row', 'moon', 150, 'prayer'),
  ('Ramadan Spirit', 'Complete all daily goals for a week in Ramadan', 'star', 300, 'ramadan'),
  ('Reflection Master', 'Write 10 evening reflections', 'pen-tool', 200, 'ramadan'),
  ('Istiqamah Champion', 'Maintain consistency for 100 days', 'crown', 1000, 'streak');
