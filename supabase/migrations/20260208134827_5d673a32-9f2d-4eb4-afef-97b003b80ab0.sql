-- Create storage bucket for voice messages
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-messages', 'voice-messages', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload voice messages
CREATE POLICY "Users can upload voice messages"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'voice-messages' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to view voice messages
CREATE POLICY "Users can view voice messages"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'voice-messages');

-- Allow users to delete their own voice messages
CREATE POLICY "Users can delete their own voice messages"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'voice-messages' AND auth.uid()::text = (storage.foldername(name))[1]);