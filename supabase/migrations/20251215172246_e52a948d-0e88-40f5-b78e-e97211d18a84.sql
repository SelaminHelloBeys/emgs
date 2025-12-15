-- 1. Fix user_roles: Remove self-assign policy, add admin-only insert
DROP POLICY IF EXISTS "Users can insert own roles" ON user_roles;

-- Admin-only role assignment
CREATE POLICY "Only admins can assign roles" 
  ON user_roles FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'yonetici'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Admin-only role deletion
CREATE POLICY "Only admins can delete roles" 
  ON user_roles FOR DELETE
  USING (
    has_role(auth.uid(), 'yonetici'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- 2. Teachers can grade homework submissions
CREATE POLICY "Teachers can grade submissions"
  ON homework_submissions FOR UPDATE
  USING (can_create_content(auth.uid()))
  WITH CHECK (can_create_content(auth.uid()));

-- 3. Update handle_new_user to auto-assign default student role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email));
  
  -- Auto-assign default student role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'ogrenci'::app_role);
  
  RETURN NEW;
END;
$$;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Create secure view for exam questions (hide answers for students)
CREATE OR REPLACE VIEW exam_questions_secure AS
SELECT 
  eq.id,
  eq.exam_id,
  eq.question_text,
  eq.option_a,
  eq.option_b,
  eq.option_c,
  eq.option_d,
  eq.question_order,
  eq.created_at,
  CASE 
    -- Show correct answer if: user is creator OR exam is completed by user
    WHEN EXISTS (
      SELECT 1 FROM exams e WHERE e.id = eq.exam_id AND e.created_by = auth.uid()
    ) THEN eq.correct_option
    WHEN EXISTS (
      SELECT 1 FROM exam_results er 
      WHERE er.exam_id = eq.exam_id 
        AND er.user_id = auth.uid() 
        AND er.status = 'completed'
    ) THEN eq.correct_option
    ELSE NULL
  END as correct_option
FROM exam_questions eq
WHERE EXISTS (
  SELECT 1 FROM exams e 
  WHERE e.id = eq.exam_id 
    AND (e.is_published = true OR e.created_by = auth.uid())
);

-- Grant access to the secure view
GRANT SELECT ON exam_questions_secure TO authenticated;