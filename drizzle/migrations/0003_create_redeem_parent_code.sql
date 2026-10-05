CREATE OR REPLACE FUNCTION public.redeem_parent_code(_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  rec record;
BEGIN
  IF uid IS NULL THEN
    RETURN false;
  END IF;

  SELECT * INTO rec
  FROM public.parent_codes
  WHERE code = upper(trim(_code))
    AND is_used = false;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  DELETE FROM public.user_roles WHERE user_id = uid;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'veli'::app_role);

  UPDATE public.parent_codes
  SET is_used = true, parent_user_id = uid
  WHERE id = rec.id;

  RETURN true;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.redeem_parent_code(text) TO authenticated;