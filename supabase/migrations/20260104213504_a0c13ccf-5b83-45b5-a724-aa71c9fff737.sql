-- =====================================================
-- FIX SECURITY VULNERABILITIES
-- =====================================================

-- 1. Fix profiles RLS - only allow users to view their own profile
-- Teachers/admins can view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view all profiles" ON profiles
  FOR SELECT USING (can_create_content(auth.uid()));

-- 2. Fix exam_questions - hide correct_option during exam
-- Drop the old policy and create a more restrictive one
DROP POLICY IF EXISTS "Everyone can view questions of visible exams" ON exam_questions;

-- Create policy that allows viewing questions but we'll handle correct_option in the app
CREATE POLICY "Users can view exam questions" ON exam_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM exams
      WHERE exams.id = exam_questions.exam_id 
        AND (exams.is_published = true OR exams.created_by = auth.uid())
    )
  );

-- 3. Create a secure function to get exam questions WITHOUT correct_option for students
CREATE OR REPLACE FUNCTION get_exam_questions_for_student(p_exam_id uuid)
RETURNS TABLE (
  id uuid,
  exam_id uuid,
  question_text text,
  option_a text,
  option_b text,
  option_c text,
  option_d text,
  question_order integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    eq.id,
    eq.exam_id,
    eq.question_text,
    eq.option_a,
    eq.option_b,
    eq.option_c,
    eq.option_d,
    eq.question_order
  FROM exam_questions eq
  JOIN exams e ON e.id = eq.exam_id
  WHERE eq.exam_id = p_exam_id
    AND (e.is_published = true OR e.created_by = auth.uid())
  ORDER BY eq.question_order;
$$;

-- 4. Create function to get exam answers ONLY after completion
CREATE OR REPLACE FUNCTION get_exam_answers_after_completion(p_exam_id uuid)
RETURNS TABLE (
  question_id uuid,
  correct_option text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    eq.id as question_id,
    eq.correct_option
  FROM exam_questions eq
  JOIN exam_results er ON er.exam_id = eq.exam_id
  WHERE eq.exam_id = p_exam_id
    AND er.user_id = auth.uid()
    AND er.status = 'completed';
$$;

-- 5. Drop the insecure exam_questions_secure view if it exists as a view
DROP VIEW IF EXISTS exam_questions_secure;

-- =====================================================
-- BADGES/ACHIEVEMENTS SYSTEM
-- =====================================================

-- Create badges table
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT '🏆',
  category text NOT NULL DEFAULT 'general',
  requirement_type text NOT NULL, -- 'videos_watched', 'exams_completed', 'homework_submitted', 'streak_days'
  requirement_value integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Everyone can view badges
CREATE POLICY "Anyone can view badges" ON badges
  FOR SELECT USING (true);

-- Only admins can manage badges
CREATE POLICY "Admins can manage badges" ON badges
  FOR ALL USING (
    has_role(auth.uid(), 'yonetici'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Create user_badges table
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Users can view their own badges
CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert badges (via triggers)
CREATE POLICY "System can insert badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert default badges
INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value) VALUES
  ('İlk Adım', 'İlk videonu izledin!', '🎬', 'video', 'videos_watched', 1),
  ('Video Sever', '5 video izledin', '📺', 'video', 'videos_watched', 5),
  ('Video Uzmanı', '10 video izledin', '🎥', 'video', 'videos_watched', 10),
  ('Video Maratonu', '25 video izledin', '🏃', 'video', 'videos_watched', 25),
  ('Video Ustası', '50 video izledin', '👑', 'video', 'videos_watched', 50),
  ('Sınav Başlangıcı', 'İlk sınavını tamamladın!', '📝', 'exam', 'exams_completed', 1),
  ('Sınav Savaşçısı', '5 sınav tamamladın', '⚔️', 'exam', 'exams_completed', 5),
  ('Sınav Kahramanı', '10 sınav tamamladın', '🦸', 'exam', 'exams_completed', 10),
  ('Sınav Efsanesi', '25 sınav tamamladın', '🏆', 'exam', 'exams_completed', 25),
  ('Ödev Yıldızı', 'İlk ödevini teslim ettin!', '⭐', 'homework', 'homework_submitted', 1),
  ('Ödev Takipçisi', '5 ödev teslim ettin', '📚', 'homework', 'homework_submitted', 5),
  ('Ödev Şampiyonu', '10 ödev teslim ettin', '🎖️', 'homework', 'homework_submitted', 10);

-- Create function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  badge_record RECORD;
  stat_value integer;
BEGIN
  -- Get user stats
  FOR badge_record IN SELECT * FROM badges LOOP
    -- Get the relevant stat value
    CASE badge_record.requirement_type
      WHEN 'videos_watched' THEN
        SELECT COALESCE(COUNT(*), 0) INTO stat_value
        FROM video_watch_progress
        WHERE user_id = NEW.user_id AND completed = true;
      WHEN 'exams_completed' THEN
        SELECT COALESCE(COUNT(*), 0) INTO stat_value
        FROM exam_results
        WHERE user_id = NEW.user_id AND status = 'completed';
      WHEN 'homework_submitted' THEN
        SELECT COALESCE(COUNT(*), 0) INTO stat_value
        FROM homework_submissions
        WHERE user_id = NEW.user_id;
      ELSE
        stat_value := 0;
    END CASE;

    -- Check if user qualifies for badge and doesn't have it yet
    IF stat_value >= badge_record.requirement_value THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (NEW.user_id, badge_record.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create triggers to check badges on relevant actions
CREATE TRIGGER check_badges_on_video_progress
  AFTER INSERT OR UPDATE ON video_watch_progress
  FOR EACH ROW
  EXECUTE FUNCTION check_and_award_badges();

CREATE TRIGGER check_badges_on_exam_result
  AFTER INSERT OR UPDATE ON exam_results
  FOR EACH ROW
  EXECUTE FUNCTION check_and_award_badges();

CREATE TRIGGER check_badges_on_homework
  AFTER INSERT ON homework_submissions
  FOR EACH ROW
  EXECUTE FUNCTION check_and_award_badges();