
-- Create teacher_parent_codes table for linking parents to teachers
CREATE TABLE public.teacher_parent_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_user_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  is_used BOOLEAN NOT NULL DEFAULT false,
  parent_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.teacher_parent_codes ENABLE ROW LEVEL SECURITY;

-- Teachers can view their own codes
CREATE POLICY "Teachers can view own parent code"
ON public.teacher_parent_codes FOR SELECT
USING (auth.uid() = teacher_user_id);

-- Parents can view codes they used
CREATE POLICY "Parents can view linked teacher codes"
ON public.teacher_parent_codes FOR SELECT
USING (auth.uid() = parent_user_id);

-- Admins can manage all codes
CREATE POLICY "Admins can manage teacher parent codes"
ON public.teacher_parent_codes FOR ALL
USING (has_role(auth.uid(), 'yonetici') OR has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'yonetici') OR has_role(auth.uid(), 'admin'));

-- Anyone authenticated can read codes for validation
CREATE POLICY "Authenticated can read teacher codes for validation"
ON public.teacher_parent_codes FOR SELECT
USING (auth.uid() IS NOT NULL);
