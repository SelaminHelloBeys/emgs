-- Drop old exam system tables (will be replaced)
DROP TABLE IF EXISTS exam_results CASCADE;
DROP TABLE IF EXISTS exam_questions CASCADE;
DROP TABLE IF EXISTS exams CASCADE;

-- Create new trial exams table
CREATE TABLE public.trial_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  pdf_url TEXT NOT NULL,
  exam_date DATE NOT NULL,
  grade TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create student exam participation table
CREATE TABLE public.student_exam_participation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.trial_exams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  participated BOOLEAN NOT NULL DEFAULT false,
  correct_count INTEGER DEFAULT 0,
  wrong_count INTEGER DEFAULT 0,
  blank_count INTEGER DEFAULT 0,
  net_score DECIMAL(5,2) DEFAULT 0,
  class_rank INTEGER,
  general_rank INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(exam_id, user_id)
);

-- Create storage bucket for exam PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('exam-pdfs', 'exam-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.trial_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_exam_participation ENABLE ROW LEVEL SECURITY;

-- RLS for trial_exams
CREATE POLICY "Everyone can view trial exams"
ON public.trial_exams FOR SELECT
USING (true);

CREATE POLICY "Teachers and admins can create trial exams"
ON public.trial_exams FOR INSERT
WITH CHECK (can_create_content(auth.uid()));

CREATE POLICY "Creators can update their exams"
ON public.trial_exams FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their exams"
ON public.trial_exams FOR DELETE
USING (auth.uid() = created_by);

-- RLS for student_exam_participation
CREATE POLICY "Users can view own participation"
ON public.student_exam_participation FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view all participation"
ON public.student_exam_participation FOR SELECT
USING (can_create_content(auth.uid()));

CREATE POLICY "Admins can insert participation"
ON public.student_exam_participation FOR INSERT
WITH CHECK (can_create_content(auth.uid()));

CREATE POLICY "Admins can update participation"
ON public.student_exam_participation FOR UPDATE
USING (can_create_content(auth.uid()));

CREATE POLICY "Admins can delete participation"
ON public.student_exam_participation FOR DELETE
USING (can_create_content(auth.uid()));

-- Storage policies for exam-pdfs bucket
CREATE POLICY "Authenticated users can view exam PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'exam-pdfs' AND auth.role() = 'authenticated');

CREATE POLICY "Teachers can upload exam PDFs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'exam-pdfs' AND can_create_content(auth.uid()));

CREATE POLICY "Uploaders can update their PDFs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'exam-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Uploaders can delete their PDFs"
ON storage.objects FOR DELETE
USING (bucket_id = 'exam-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Updated timestamp trigger
CREATE TRIGGER update_trial_exams_updated_at
BEFORE UPDATE ON public.trial_exams
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_exam_participation_updated_at
BEFORE UPDATE ON public.student_exam_participation
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();