GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION public.get_my_role() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
SELECT ur.role::text FROM public.user_roles ur WHERE ur.user_id = auth.uid()
ORDER BY CASE ur.role WHEN 'yonetici' THEN 1 WHEN 'admin' THEN 2 WHEN 'mudur' THEN 3 WHEN 'mudur_yardimcisi' THEN 4 WHEN 'rehber' THEN 5 WHEN 'ogretmen' THEN 6 WHEN 'veli' THEN 7 ELSE 8 END LIMIT 1; $$;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_user_setup() TO authenticated;