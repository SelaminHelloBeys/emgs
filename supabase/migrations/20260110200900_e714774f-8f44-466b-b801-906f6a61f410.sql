-- Fix 1: platform_settings - only admins can read system configuration
DROP POLICY IF EXISTS "Anyone can view settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Anyone can read platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Platform settings are publicly readable" ON public.platform_settings;

CREATE POLICY "Only admins can read platform settings" 
ON public.platform_settings 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'yonetici') OR public.has_role(auth.uid(), 'admin'));

-- Fix 2: homework_submissions - teachers can only see submissions for their own homework
DROP POLICY IF EXISTS "Teachers can view submissions" ON public.homework_submissions;
DROP POLICY IF EXISTS "Authenticated users can view their own submissions" ON public.homework_submissions;

CREATE POLICY "Users can view their own submissions"
ON public.homework_submissions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view submissions for their homework"
ON public.homework_submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.homework_assignments ha
    WHERE ha.id = homework_submissions.homework_id
    AND ha.created_by = auth.uid()
  )
);

-- Fix 3: exam_questions - hide correct_option from students before completing exam
-- Create a function to check if user has completed the exam
CREATE OR REPLACE FUNCTION public.has_completed_exam(p_exam_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM exam_results
    WHERE exam_id = p_exam_id
    AND user_id = auth.uid()
    AND status = 'completed'
  )
$$;

-- Create a function to check if user is exam creator
CREATE OR REPLACE FUNCTION public.is_exam_creator(p_exam_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM exams
    WHERE id = p_exam_id
    AND created_by = auth.uid()
  )
$$;

-- Update exam_questions policies - remove direct read access
DROP POLICY IF EXISTS "Anyone can view exam questions" ON public.exam_questions;
DROP POLICY IF EXISTS "Published exam questions are viewable" ON public.exam_questions;
DROP POLICY IF EXISTS "Exam questions are viewable for published exams" ON public.exam_questions;

-- Students can only see questions (without correct_option) through the secure function
-- This policy allows querying but the secure function already filters out correct_option
CREATE POLICY "Exam creators can view all question data"
ON public.exam_questions
FOR SELECT
TO authenticated
USING (
  public.is_exam_creator(exam_id)
);