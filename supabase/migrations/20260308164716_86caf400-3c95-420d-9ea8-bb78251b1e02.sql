
-- Create parent_codes table for linking parents to students
CREATE TABLE public.parent_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_user_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  is_used BOOLEAN NOT NULL DEFAULT false,
  parent_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.parent_codes ENABLE ROW LEVEL SECURITY;

-- Students can view their own parent code
CREATE POLICY "Students can view own parent code"
ON public.parent_codes FOR SELECT
USING (auth.uid() = student_user_id);

-- Parents can view codes they used
CREATE POLICY "Parents can view linked codes"
ON public.parent_codes FOR SELECT
USING (auth.uid() = parent_user_id);

-- Admins can manage all codes
CREATE POLICY "Admins can manage parent codes"
ON public.parent_codes FOR ALL
USING (has_role(auth.uid(), 'yonetici') OR has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'yonetici') OR has_role(auth.uid(), 'admin'));

-- Anyone authenticated can read codes (for registration validation)
CREATE POLICY "Authenticated can read codes for validation"
ON public.parent_codes FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create verification_status table for tick system
CREATE TABLE public.user_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_verifications ENABLE ROW LEVEL SECURITY;

-- Anyone can view verifications (ticks are public)
CREATE POLICY "Anyone can view verifications"
ON public.user_verifications FOR SELECT
USING (true);

-- Admins can manage verifications
CREATE POLICY "Admins can manage verifications"
ON public.user_verifications FOR ALL
USING (has_role(auth.uid(), 'yonetici') OR has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'yonetici') OR has_role(auth.uid(), 'admin'));

-- System can insert verifications (for auto-verification)
CREATE POLICY "System can insert verifications"
ON public.user_verifications FOR INSERT
WITH CHECK (auth.uid() = user_id);
