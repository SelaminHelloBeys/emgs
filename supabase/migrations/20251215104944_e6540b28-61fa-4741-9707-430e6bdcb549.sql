-- Fix lessons ↔ profiles relationship for PostgREST joins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_user_id_key'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'lessons_created_by_fkey'
      AND conrelid = 'public.lessons'::regclass
  ) THEN
    ALTER TABLE public.lessons
      ADD CONSTRAINT lessons_created_by_fkey
      FOREIGN KEY (created_by)
      REFERENCES public.profiles (user_id)
      ON DELETE RESTRICT
      NOT VALID;
  END IF;
END$$;

-- Add optional topic field for lesson filtering (e.g., "Osmanlı Dönemi")
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS topic TEXT;