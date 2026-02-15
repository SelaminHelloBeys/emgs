-- Allow all authenticated users to read platform_settings (needed for danger mode check)
DROP POLICY IF EXISTS "Only admins can read platform settings" ON public.platform_settings;

CREATE POLICY "Authenticated users can read platform settings"
ON public.platform_settings
FOR SELECT
USING (auth.uid() IS NOT NULL);
