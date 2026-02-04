-- Add DELETE policy for circle_members so users can leave circles
CREATE POLICY "Users can leave circles" 
ON public.circle_members 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Also restrict sisters_circles visibility to authenticated users only
DROP POLICY IF EXISTS "Anyone can view circles" ON public.sisters_circles;

CREATE POLICY "Authenticated users can view circles" 
ON public.sisters_circles 
FOR SELECT 
TO authenticated
USING (true);