import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ExamResultDetail {
  exam: {
    id: string;
    title: string;
    subject: string;
  };
  result: {
    score: number;
    total_questions: number;
    answers: Record<string, string>;
    completed_at: string;
  };
  questions: Array<{
    id: string;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    question_order: number;
    correct_option: string;
    user_answer: string;
    is_correct: boolean;
  }>;
}

export const useExamResults = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const getExamResult = async (examId: string): Promise<ExamResultDetail | null> => {
    if (!user) return null;
    
    setIsLoading(true);

    try {
      // Get exam details
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .select('id, title, subject')
        .eq('id', examId)
        .single();

      if (examError) throw examError;

      // Get user's result
      const { data: result, error: resultError } = await supabase
        .from('exam_results')
        .select('score, total_questions, answers, completed_at')
        .eq('exam_id', examId)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .single();

      if (resultError) throw resultError;

      // Get answers (only available after completion)
      const { data: answers, error: answersError } = await supabase
        .rpc('get_exam_answers_after_completion', { p_exam_id: examId });

      if (answersError) throw answersError;

      // Get questions
      const { data: questions, error: questionsError } = await supabase
        .rpc('get_exam_questions_for_student', { p_exam_id: examId });

      if (questionsError) throw questionsError;

      // Create answer map
      const answerMap = new Map(
        (answers as Array<{ question_id: string; correct_option: string }>)
          ?.map(a => [a.question_id, a.correct_option]) || []
      );

      // Combine questions with answers and user responses
      const userAnswers = result.answers as Record<string, string>;
      
      const questionsWithAnswers = (questions as Array<{
        id: string;
        question_text: string;
        option_a: string;
        option_b: string;
        option_c: string;
        option_d: string;
        question_order: number;
      }>)?.map(q => {
        const correctOption = answerMap.get(q.id) || '';
        const userAnswer = userAnswers[q.id] || '';
        return {
          ...q,
          correct_option: correctOption,
          user_answer: userAnswer,
          is_correct: userAnswer === correctOption
        };
      }).sort((a, b) => a.question_order - b.question_order) || [];

      setIsLoading(false);
      
      return {
        exam,
        result: {
          score: result.score,
          total_questions: result.total_questions,
          answers: userAnswers,
          completed_at: result.completed_at
        },
        questions: questionsWithAnswers
      };
    } catch (error) {
      console.error('Error fetching exam result:', error);
      setIsLoading(false);
      return null;
    }
  };

  return {
    getExamResult,
    isLoading
  };
};
