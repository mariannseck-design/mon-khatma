
CREATE OR REPLACE FUNCTION public.get_today_collective_stats()
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT json_build_object(
    'total_pages', COALESCE(SUM(pages_read), 0),
    'readers_count', COUNT(DISTINCT user_id)
  )
  FROM public.quran_progress
  WHERE date = CURRENT_DATE;
$$;
