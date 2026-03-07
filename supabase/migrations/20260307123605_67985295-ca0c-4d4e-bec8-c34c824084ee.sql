ALTER TABLE public.hifz_memorized_verses
ADD CONSTRAINT hifz_memorized_verses_user_surah_verses_unique
UNIQUE (user_id, surah_number, verse_start, verse_end);