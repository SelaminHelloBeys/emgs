
-- Fix trial_exams: Drop RESTRICTIVE policies and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Everyone can view trial exams" ON public.trial_exams;
DROP POLICY IF EXISTS "Teachers and admins can create trial exams" ON public.trial_exams;
DROP POLICY IF EXISTS "Creators can update their exams" ON public.trial_exams;
DROP POLICY IF EXISTS "Creators can delete their exams" ON public.trial_exams;

CREATE POLICY "Everyone can view trial exams" ON public.trial_exams FOR SELECT USING (true);
CREATE POLICY "Teachers and admins can create trial exams" ON public.trial_exams FOR INSERT WITH CHECK (can_create_content(auth.uid()));
CREATE POLICY "Creators can update their exams" ON public.trial_exams FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Creators can delete their exams" ON public.trial_exams FOR DELETE USING (auth.uid() = created_by);

-- Fix student_exam_participation: Drop RESTRICTIVE policies and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Users can view own participation" ON public.student_exam_participation;
DROP POLICY IF EXISTS "Teachers can view all participation" ON public.student_exam_participation;
DROP POLICY IF EXISTS "Admins can insert participation" ON public.student_exam_participation;
DROP POLICY IF EXISTS "Admins can update participation" ON public.student_exam_participation;
DROP POLICY IF EXISTS "Admins can delete participation" ON public.student_exam_participation;

CREATE POLICY "Users can view own participation" ON public.student_exam_participation FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Teachers can view all participation" ON public.student_exam_participation FOR SELECT USING (can_create_content(auth.uid()));
CREATE POLICY "Admins can insert participation" ON public.student_exam_participation FOR INSERT WITH CHECK (can_create_content(auth.uid()));
CREATE POLICY "Admins can update participation" ON public.student_exam_participation FOR UPDATE USING (can_create_content(auth.uid()));
CREATE POLICY "Admins can delete participation" ON public.student_exam_participation FOR DELETE USING (can_create_content(auth.uid()));

-- Also make exam-pdfs bucket public for PDF viewing
UPDATE storage.buckets SET public = true WHERE id = 'exam-pdfs';
