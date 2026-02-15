-- Remove the duplicate SELECT policy
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.homework_submissions;
