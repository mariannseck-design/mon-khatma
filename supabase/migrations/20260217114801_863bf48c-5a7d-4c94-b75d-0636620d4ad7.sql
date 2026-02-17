
-- Fix 1: Add server-side input validation constraints
ALTER TABLE profiles ADD CONSTRAINT display_name_length 
  CHECK (display_name IS NULL OR char_length(display_name) <= 100);

ALTER TABLE quran_progress ADD CONSTRAINT pages_read_range
  CHECK (pages_read >= 0 AND pages_read <= 604);

-- Fix 2: Make voice-messages bucket private
UPDATE storage.buckets SET public = false WHERE id = 'voice-messages';

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view voice messages" ON storage.objects;

-- Create a restricted SELECT policy for circle members only
CREATE POLICY "Circle members can view voice messages"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'voice-messages' AND
  EXISTS (
    SELECT 1 FROM circle_messages cm
    JOIN circle_members mem ON mem.circle_id = cm.circle_id
    WHERE cm.voice_url LIKE '%' || name AND mem.user_id = auth.uid()
  )
);
