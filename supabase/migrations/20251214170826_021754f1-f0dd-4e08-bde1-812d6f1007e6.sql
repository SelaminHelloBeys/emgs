
-- Create exams table (denemeler)
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 60,
  grade TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_published BOOLEAN NOT NULL DEFAULT false
);

-- Create exam questions table
CREATE TABLE public.exam_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  question_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exam results table (student answers)
CREATE TABLE public.exam_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  UNIQUE(exam_id, user_id)
);

-- Create homework assignments table
CREATE TABLE public.homework_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  class_section TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  attachments TEXT[],
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create homework submissions table
CREATE TABLE public.homework_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  homework_id UUID NOT NULL REFERENCES public.homework_assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_url TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  grade INTEGER,
  feedback TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late')),
  UNIQUE(homework_id, user_id)
);

-- Create video watch progress table
CREATE TABLE public.video_watch_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  last_watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create user stats table
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  lessons_watched INTEGER NOT NULL DEFAULT 0,
  exams_completed INTEGER NOT NULL DEFAULT 0,
  homework_submitted INTEGER NOT NULL DEFAULT 0,
  total_watch_time INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_watch_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Exams policies
CREATE POLICY "Everyone can view published exams" ON public.exams FOR SELECT USING (is_published = true OR auth.uid() = created_by);
CREATE POLICY "Teachers and above can create exams" ON public.exams FOR INSERT WITH CHECK (can_create_content(auth.uid()));
CREATE POLICY "Creators can update their exams" ON public.exams FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Creators can delete their exams" ON public.exams FOR DELETE USING (auth.uid() = created_by);

-- Exam questions policies
CREATE POLICY "Everyone can view questions of visible exams" ON public.exam_questions FOR SELECT USING (EXISTS (SELECT 1 FROM public.exams WHERE id = exam_id AND (is_published = true OR created_by = auth.uid())));
CREATE POLICY "Exam creators can manage questions" ON public.exam_questions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.exams WHERE id = exam_id AND created_by = auth.uid()));
CREATE POLICY "Exam creators can update questions" ON public.exam_questions FOR UPDATE USING (EXISTS (SELECT 1 FROM public.exams WHERE id = exam_id AND created_by = auth.uid()));
CREATE POLICY "Exam creators can delete questions" ON public.exam_questions FOR DELETE USING (EXISTS (SELECT 1 FROM public.exams WHERE id = exam_id AND created_by = auth.uid()));

-- Exam results policies
CREATE POLICY "Users can view own results" ON public.exam_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own results" ON public.exam_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own results" ON public.exam_results FOR UPDATE USING (auth.uid() = user_id);

-- Homework assignments policies
CREATE POLICY "Everyone can view homework" ON public.homework_assignments FOR SELECT USING (true);
CREATE POLICY "Teachers and above can create homework" ON public.homework_assignments FOR INSERT WITH CHECK (can_create_content(auth.uid()));
CREATE POLICY "Creators can update homework" ON public.homework_assignments FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Creators can delete homework" ON public.homework_assignments FOR DELETE USING (auth.uid() = created_by);

-- Homework submissions policies
CREATE POLICY "Users can view own submissions" ON public.homework_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own submissions" ON public.homework_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own submissions" ON public.homework_submissions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Teachers can view all submissions" ON public.homework_submissions FOR SELECT USING (can_create_content(auth.uid()));

-- Video watch progress policies
CREATE POLICY "Users can view own progress" ON public.video_watch_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own progress" ON public.video_watch_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.video_watch_progress FOR UPDATE USING (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "Users can view own stats" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own stats" ON public.user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger to auto-create user stats on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_create_stats
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_stats();

-- Update timestamps trigger for new tables
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON public.exams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_homework_updated_at BEFORE UPDATE ON public.homework_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON public.user_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
