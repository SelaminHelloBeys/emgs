-- Function to check if a parent is linked to a student
CREATE OR REPLACE FUNCTION public.is_parent_of(_parent_id uuid, _student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.parent_codes
    WHERE parent_user_id = _parent_id
      AND student_user_id = _student_id
      AND is_used = true
  )
$$;

-- Allow parents to view their child's video watch progress
CREATE POLICY "Parents can view child video progress"
ON public.video_watch_progress
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.parent_codes
    WHERE parent_user_id = auth.uid()
    AND student_user_id = video_watch_progress.user_id
    AND is_used = true
  )
);

-- Allow parents to view their child's stats
CREATE POLICY "Parents can view child stats"
ON public.user_stats
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.parent_codes
    WHERE parent_user_id = auth.uid()
    AND student_user_id = user_stats.user_id
    AND is_used = true
  )
);

-- Allow parents to view their child's exam participation
CREATE POLICY "Parents can view child exam participation"
ON public.student_exam_participation
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.parent_codes
    WHERE parent_user_id = auth.uid()
    AND student_user_id = student_exam_participation.user_id
    AND is_used = true
  )
);

-- Allow parents to view their child's homework submissions
CREATE POLICY "Parents can view child homework submissions"
ON public.homework_submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.parent_codes
    WHERE parent_user_id = auth.uid()
    AND student_user_id = homework_submissions.user_id
    AND is_used = true
  )
);

-- Allow parents to view their child's badges
CREATE POLICY "Parents can view child badges"
ON public.user_badges
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.parent_codes
    WHERE parent_user_id = auth.uid()
    AND student_user_id = user_badges.user_id
    AND is_used = true
  )
);