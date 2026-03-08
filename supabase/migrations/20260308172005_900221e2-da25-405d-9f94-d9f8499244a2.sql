-- Drop the old restrictive policy that requires authentication
DROP POLICY IF EXISTS "Authenticated can read codes for validation" ON public.parent_codes;

-- Create a new policy that allows anyone (including unauthenticated) to read codes for validation
CREATE POLICY "Anyone can read codes for validation"
ON public.parent_codes FOR SELECT
USING (true);

-- Also fix teacher_parent_codes for the same issue
DROP POLICY IF EXISTS "Authenticated can read teacher codes for validation" ON public.teacher_parent_codes;

CREATE POLICY "Anyone can read teacher codes for validation"
ON public.teacher_parent_codes FOR SELECT
USING (true);