-- Add unique constraint for homework submissions to enable upsert
ALTER TABLE public.homework_submissions
ADD CONSTRAINT homework_submissions_homework_user_unique
UNIQUE (homework_id, user_id);
