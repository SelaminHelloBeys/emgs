
-- Allow admins to delete user_badges
CREATE POLICY "Admins can delete user badges"
ON public.user_badges
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'yonetici'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete user_stats
CREATE POLICY "Admins can delete user stats"
ON public.user_stats
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'yonetici'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete video_watch_progress
CREATE POLICY "Admins can delete watch progress"
ON public.video_watch_progress
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'yonetici'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete homework_submissions
CREATE POLICY "Admins can delete submissions"
ON public.homework_submissions
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'yonetici'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
