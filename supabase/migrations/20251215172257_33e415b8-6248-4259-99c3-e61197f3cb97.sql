-- Drop the SECURITY DEFINER view and recreate as SECURITY INVOKER
DROP VIEW IF EXISTS exam_questions_secure;

-- Recreate with SECURITY INVOKER (default, uses querying user's permissions)
CREATE VIEW exam_questions_secure 
WITH (security_invoker = true)
AS
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

GRANT SELECT ON exam_questions_secure TO authenticated;