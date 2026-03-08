ALTER TABLE public.hifz_memorized_verses
  ADD COLUMN IF NOT EXISTS liaison_status text NOT NULL DEFAULT 'tour',
  ADD COLUMN IF NOT EXISTS liaison_start_date date;