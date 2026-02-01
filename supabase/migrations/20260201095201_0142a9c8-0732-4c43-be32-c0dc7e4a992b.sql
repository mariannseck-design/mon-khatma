-- Drop existing tables and types to start fresh
DROP TABLE IF EXISTS public.user_badges CASCADE;
DROP TABLE IF EXISTS public.badges CASCADE;
DROP TABLE IF EXISTS public.ramadan_journal CASCADE;
DROP TABLE IF EXISTS public.hifz_progress CASCADE;
DROP TABLE IF EXISTS public.adhkar_tracker CASCADE;
DROP TABLE IF EXISTS public.prayer_tracker CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS public.prayer_type CASCADE;
DROP TYPE IF EXISTS public.theme_color CASCADE;

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    display_name TEXT,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Admin can view all profiles (for Sisters Space dashboard)
CREATE POLICY "Admin can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Sisters Circles table (groups managed by admin)
CREATE TABLE public.sisters_circles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'Cercle des Sœurs',
    description TEXT,
    max_members INTEGER DEFAULT 30,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sisters_circles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view circles"
ON public.sisters_circles FOR SELECT
USING (true);

CREATE POLICY "Admin can insert circles"
ON public.sisters_circles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update circles"
ON public.sisters_circles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Circle members table
CREATE TABLE public.circle_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id UUID REFERENCES public.sisters_circles(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    accepted_charter BOOLEAN DEFAULT false,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their membership"
ON public.circle_members FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all members"
ON public.circle_members FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can join circles"
ON public.circle_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their membership"
ON public.circle_members FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage members"
ON public.circle_members FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Quran reading goals table
CREATE TABLE public.quran_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    goal_type TEXT NOT NULL CHECK (goal_type IN ('pages_per_day', 'duration_days')),
    target_value INTEGER NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quran_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals"
ON public.quran_goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
ON public.quran_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON public.quran_goals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all goals"
ON public.quran_goals FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Daily Quran reading progress
CREATE TABLE public.quran_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    goal_id UUID REFERENCES public.quran_goals(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    pages_read INTEGER NOT NULL DEFAULT 0,
    juz_completed INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, date)
);

ALTER TABLE public.quran_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
ON public.quran_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON public.quran_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.quran_progress FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all progress"
ON public.quran_progress FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sisters_circles_updated_at
BEFORE UPDATE ON public.sisters_circles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quran_goals_updated_at
BEFORE UPDATE ON public.quran_goals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quran_progress_updated_at
BEFORE UPDATE ON public.quran_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();