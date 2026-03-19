
CREATE OR REPLACE FUNCTION public.apply_invite_code(_user_id uuid, _code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  code_record RECORD;
BEGIN
  -- Find valid, unused code
  SELECT * INTO code_record
  FROM public.admin_access_codes
  WHERE code = _code
    AND is_used = false
    AND expires_at > now();

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Update user role
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, code_record.target_role);

  -- Update profile with target info
  UPDATE public.profiles
  SET 
    name = COALESCE(NULLIF(code_record.target_name, ''), name),
    school_name = COALESCE(code_record.target_school, school_name),
    class = COALESCE(code_record.target_class, class)
  WHERE user_id = _user_id;

  -- Mark code as used
  UPDATE public.admin_access_codes
  SET is_used = true, used_by = _user_id
  WHERE id = code_record.id;

  RETURN true;
END;
$$;
