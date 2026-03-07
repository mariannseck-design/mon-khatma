
CREATE OR REPLACE FUNCTION public.get_defis_collective_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT json_build_object(
    'mulk_participants', (
      SELECT COUNT(DISTINCT user_id) FROM public.challenge_mulk
      WHERE week_key = (
        'mulk_week_' || EXTRACT(YEAR FROM now())::text || '_' ||
        CEIL((EXTRACT(DOY FROM now()) + EXTRACT(DOW FROM (DATE_TRUNC('year', now())))::int) / 7.0)::text
      )
    ),
    'baqara_participants', (
      SELECT COUNT(DISTINCT user_id) FROM public.challenge_baqara
    )
  );
$$;
