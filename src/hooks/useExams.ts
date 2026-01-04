import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ExamQuestion {
  id: string;
  exam_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  question_order: number;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  description: string;
  duration: number;
  grade: string;
  is_published: boolean;
  created_by: string;
  created_at: string;
  questions?: ExamQuestion[];
  result?: {
    score: number;
    total_questions: number;
    status: string;
  };
}

export const useExams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, profile } = useAuth();

  const fetchExams = async () => {
    if (!user) {
      setExams([]);
      setIsLoading(false);
      return;
    }

    // Fetch exams with questions count
    const { data: examsData, error } = await supabase
      .from('exams')
      .select(`
        *,
        exam_questions(id)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching exams:', error);
      setIsLoading(false);
      return;
    }

    // Fetch user results
    const { data: resultsData } = await supabase
      .from('exam_results')
      .select('*')
      .eq('user_id', user.id);

    const resultsMap = new Map(resultsData?.map(r => [r.exam_id, r]) || []);

    const formattedExams = (examsData || []).map(exam => ({
      ...exam,
      questionCount: exam.exam_questions?.length || 0,
      result: resultsMap.get(exam.id)
    }));

    setExams(formattedExams);
    setIsLoading(false);
  };

  const createExam = async (
    title: string,
    subject: string,
    grade: string,
    duration: number,
    description: string,
    questions: Omit<ExamQuestion, 'id' | 'exam_id' | 'created_at'>[]
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    // Create exam
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .insert({
        title,
        subject,
        grade,
        duration,
        description,
        created_by: user.id,
        is_published: true
      })
      .select()
      .single();

    if (examError) {
      toast.error('Deneme oluşturulurken hata oluştu');
      return { error: examError };
    }

    // Create questions
    if (questions.length > 0) {
      const questionsToInsert = questions.map((q, index) => ({
        ...q,
        exam_id: examData.id,
        question_order: index + 1
      }));

      const { error: questionsError } = await supabase
        .from('exam_questions')
        .insert(questionsToInsert);

      if (questionsError) {
        console.error('Error creating questions:', questionsError);
      }
    }

    toast.success('Deneme başarıyla oluşturuldu');
    fetchExams();
    return { error: null, exam: examData };
  };

  const getExamWithQuestions = async (examId: string) => {
    // Get exam info
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single();

    if (examError) {
      console.error('Error fetching exam:', examError);
      return null;
    }

    // Get questions WITHOUT correct_option using secure function
    const { data: questions, error: questionsError } = await supabase
      .rpc('get_exam_questions_for_student', { p_exam_id: examId });

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return null;
    }

    return {
      ...exam,
      questions: (questions as Array<{
        id: string;
        exam_id: string;
        question_text: string;
        option_a: string;
        option_b: string;
        option_c: string;
        option_d: string;
        question_order: number;
      }>)?.sort((a, b) => a.question_order - b.question_order) || []
    };
  };

  const submitExamResult = async (
    examId: string,
    answers: Record<string, string>,
    _score: number, // Ignored - calculated server side
    totalQuestions: number
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    // First get the correct answers to calculate score
    const { data: correctAnswers, error: answersError } = await supabase
      .from('exam_questions')
      .select('id, correct_option')
      .eq('exam_id', examId);

    if (answersError) {
      toast.error('Sonuçlar hesaplanırken hata oluştu');
      return { error: answersError };
    }

    // Calculate score
    let score = 0;
    correctAnswers?.forEach(q => {
      if (answers[q.id] === q.correct_option) {
        score++;
      }
    });

    const { error } = await supabase
      .from('exam_results')
      .upsert({
        exam_id: examId,
        user_id: user.id,
        answers,
        score,
        total_questions: totalQuestions,
        completed_at: new Date().toISOString(),
        status: 'completed'
      }, {
        onConflict: 'exam_id,user_id'
      });

    if (error) {
      toast.error('Sonuçlar kaydedilirken hata oluştu');
      return { error };
    }

    toast.success('Deneme tamamlandı!');
    fetchExams();
    return { error: null };
  };

  useEffect(() => {
    fetchExams();
  }, [user]);

  return {
    exams,
    isLoading,
    createExam,
    getExamWithQuestions,
    submitExamResult,
    refetch: fetchExams
  };
};
