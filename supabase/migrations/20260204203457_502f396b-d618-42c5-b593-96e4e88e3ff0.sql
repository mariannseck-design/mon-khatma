-- Add DELETE policies for tables that are missing them

-- Allow users to delete their own Quran goals
CREATE POLICY "Users can delete their own goals" 
ON public.quran_goals 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to delete their own progress entries
CREATE POLICY "Users can delete their own progress" 
ON public.quran_progress 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to delete their own profiles (GDPR compliance)
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);