-- Fix: Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Anyone can read page maintenance" ON public.page_maintenance;
DROP POLICY IF EXISTS "Admins can manage page maintenance" ON public.page_maintenance;

-- Permissive SELECT for all authenticated users
CREATE POLICY "Anyone can read page maintenance"
  ON public.page_maintenance FOR SELECT
  TO authenticated
  USING (true);

-- Permissive ALL for admins
CREATE POLICY "Admins can manage page maintenance"
  ON public.page_maintenance FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('yonetici', 'admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('yonetici', 'admin'))
  );
