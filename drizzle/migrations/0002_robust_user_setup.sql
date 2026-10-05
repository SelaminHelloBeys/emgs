CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, school_name, class)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', NEW.email),
          NEW.raw_user_meta_data->>'school_name', NEW.raw_user_meta_data->>'class')
  ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'ogrenci'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  BEGIN
    INSERT INTO public.parent_codes (student_user_id, code) VALUES (NEW.id, public.generate_parent_code());
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
  INSERT INTO public.user_verifications (user_id, is_verified) VALUES (NEW.id, false)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END $$;