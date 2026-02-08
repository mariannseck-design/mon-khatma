-- Create table for community messages in the circle
CREATE TABLE public.circle_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id UUID NOT NULL REFERENCES public.sisters_circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('inspirations', 'entraide', 'rappels')),
  content TEXT NOT NULL,
  is_voice BOOLEAN DEFAULT false,
  voice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for message likes (hearts)
CREATE TABLE public.circle_message_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.circle_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.circle_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_message_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for circle_messages
CREATE POLICY "Circle members can view messages"
ON public.circle_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.circle_members 
    WHERE circle_members.circle_id = circle_messages.circle_id 
    AND circle_members.user_id = auth.uid()
  )
);

CREATE POLICY "Circle members can create messages"
ON public.circle_messages FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.circle_members 
    WHERE circle_members.circle_id = circle_messages.circle_id 
    AND circle_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own messages"
ON public.circle_messages FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for likes
CREATE POLICY "Circle members can view likes"
ON public.circle_message_likes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.circle_messages cm
    JOIN public.circle_members mem ON mem.circle_id = cm.circle_id
    WHERE cm.id = circle_message_likes.message_id 
    AND mem.user_id = auth.uid()
  )
);

CREATE POLICY "Circle members can like messages"
ON public.circle_message_likes FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.circle_messages cm
    JOIN public.circle_members mem ON mem.circle_id = cm.circle_id
    WHERE cm.id = circle_message_likes.message_id 
    AND mem.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove their own likes"
ON public.circle_message_likes FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.circle_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.circle_message_likes;