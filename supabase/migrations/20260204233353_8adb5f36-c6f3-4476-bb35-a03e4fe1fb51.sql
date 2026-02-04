-- Add surah and ayah tracking to quran_progress
ALTER TABLE public.quran_progress
ADD COLUMN surah_name text,
ADD COLUMN ayah_number integer;