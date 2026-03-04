
-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'yonetici'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete announcements (currently only creator can)
CREATE POLICY "Admins can delete announcements"
ON public.announcements
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'yonetici'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Add subject_scores JSONB to student_exam_participation
ALTER TABLE public.student_exam_participation
ADD COLUMN IF NOT EXISTS subject_scores jsonb DEFAULT NULL;

-- Create admin access/invite codes table
CREATE TABLE IF NOT EXISTS public.admin_access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  target_role app_role NOT NULL DEFAULT 'ogrenci',
  target_name text NOT NULL,
  target_school text,
  target_class text,
  is_used boolean NOT NULL DEFAULT false,
  used_by uuid,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

ALTER TABLE public.admin_access_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage access codes"
ON public.admin_access_codes
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'yonetici'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'yonetici'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can read codes"
ON public.admin_access_codes
FOR SELECT
TO authenticated
USING (true);
