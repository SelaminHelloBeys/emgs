
-- Function to generate cryptographic random parent code
CREATE OR REPLACE FUNCTION public.generate_parent_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $function$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN substr(result, 1, 4) || '-' || substr(result, 5, 4) || '-' || substr(result, 9, 4);
END;
$function$;

-- Update handle_new_user to also create parent code for students
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  parent_code_val TEXT;
BEGIN
  INSERT INTO public.profiles (user_id, name, school_name, class)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.raw_user_meta_data ->> 'school_name',
    NEW.raw_user_meta_data ->> 'class'
  );
  
  -- Auto-assign default student role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'ogrenci'::app_role);

  -- Auto-generate parent code for student accounts
  parent_code_val := public.generate_parent_code();
  INSERT INTO public.parent_codes (student_user_id, code)
  VALUES (NEW.id, parent_code_val);

  -- Auto-create verification record
  INSERT INTO public.user_verifications (user_id, is_verified)
  VALUES (NEW.id, false);
  
  RETURN NEW;
END;
$function$;
