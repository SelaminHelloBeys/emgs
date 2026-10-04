CREATE OR REPLACE FUNCTION public.ensure_user_setup()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); em text;
BEGIN
  IF uid IS NULL THEN RETURN; END IF;
  SELECT email INTO em FROM auth.users WHERE id = uid;
  INSERT INTO public.profiles (user_id, name) SELECT uid, COALESCE(em, 'Kullanıcı')
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = uid);
  INSERT INTO public.user_roles (user_id, role) SELECT uid, 'ogrenci'::app_role
    WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = uid);
  INSERT INTO public.user_verifications (user_id, is_verified) SELECT uid, false
    WHERE NOT EXISTS (SELECT 1 FROM public.user_verifications WHERE user_id = uid);
END $$;
REVOKE ALL ON FUNCTION public.ensure_user_setup() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_user_setup() TO authenticated;