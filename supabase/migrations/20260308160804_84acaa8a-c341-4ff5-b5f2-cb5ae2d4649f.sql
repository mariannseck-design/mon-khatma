CREATE OR REPLACE FUNCTION public.get_hifz_collective_stats()
RETURNS json
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT json_build_object(
    'active_memorizers', (
      SELECT COUNT(DISTINCT user_id) FROM public.hifz_sessions
      WHERE completed_at >= now() - interval '7 days'
    ),
    'total_verses_memorized', (
      SELECT COALESCE(SUM(verse_end - verse_start + 1), 0) FROM public.hifz_memorized_verses
    )
  );
$$;