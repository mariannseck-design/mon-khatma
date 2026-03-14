CREATE OR REPLACE FUNCTION public.get_admin_email_stats(days_back integer DEFAULT 7)
RETURNS json
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result json;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NULL;
  END IF;

  SELECT json_build_object(
    'stats', (
      SELECT json_build_object(
        'total', count(*),
        'sent', count(*) FILTER (WHERE status = 'sent'),
        'pending', count(*) FILTER (WHERE status = 'pending'),
        'failed', count(*) FILTER (WHERE status IN ('failed', 'dlq')),
        'rate_limited', count(*) FILTER (WHERE status = 'rate_limited')
      )
      FROM (
        SELECT DISTINCT ON (COALESCE(message_id, id::text)) status
        FROM public.email_send_log
        WHERE created_at >= now() - (days_back || ' days')::interval
        ORDER BY COALESCE(message_id, id::text), created_at DESC
      ) latest
    ),
    'recent', (
      SELECT COALESCE(json_agg(t), '[]'::json)
      FROM (
        SELECT id, message_id, template_name, recipient_email, status,
               left(error_message, 200) as error_message, created_at
        FROM (
          SELECT DISTINCT ON (COALESCE(message_id, id::text))
            id, message_id, template_name, recipient_email, status,
            error_message, created_at
          FROM public.email_send_log
          WHERE created_at >= now() - (days_back || ' days')::interval
          ORDER BY COALESCE(message_id, id::text), created_at DESC
        ) deduped
        ORDER BY created_at DESC
        LIMIT 30
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$$;