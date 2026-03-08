
-- Fix search_path for generate_parent_code
CREATE OR REPLACE FUNCTION public.generate_parent_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path TO 'public'
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
