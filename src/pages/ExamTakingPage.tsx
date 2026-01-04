import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useExams } from '@/hooks/useExams';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExamQuestion {
  id: string;
  exam_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  question_order: number;
}

interface ExamWithQuestions {
  id: string;
  title: string;
  subject: string;
  duration: number;
  questions: ExamQuestion[];
}

export const ExamTakingPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { getExamWithQuestions, submitExamResult } = useExams();
  
  const [exam, setExam] = useState<ExamWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const loadExam = async () => {
      if (!examId) return;
      const data = await getExamWithQuestions(examId);
      if (data && data.questions) {
        setExam(data as ExamWithQuestions);
        setTimeLeft(data.duration * 60);
      }
      setIsLoading(false);
    };
    loadExam();
  }, [examId, getExamWithQuestions]);

  useEffect(() => {
    if (timeLeft <= 0 || showResults) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = useCallback(async () => {
    if (!exam || isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Submit answers first - backend will calculate the score
    await submitExamResult(exam.id, answers, 0, exam.questions.length);
    
    // Navigate to results page to see the score
    navigate(`/denemeler/${exam.id}/sonuc`);
    
    setIsSubmitting(false);
  }, [exam, answers, isSubmitting, submitExamResult, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!exam || !exam.questions.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="w-16 h-16 text-destructive" />
        <h2 className="text-xl font-semibold">Sınav bulunamadı</h2>
        <Button onClick={() => navigate('/denemeler')}>Geri Dön</Button>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / exam.questions.length) * 100);
    
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <Card className="text-center p-8">
          <div className={cn(
            "w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center",
            percentage >= 70 ? "bg-green-500/10" : percentage >= 50 ? "bg-yellow-500/10" : "bg-red-500/10"
          )}>
            <CheckCircle className={cn(
              "w-12 h-12",
              percentage >= 70 ? "text-green-500" : percentage >= 50 ? "text-yellow-500" : "text-red-500"
            )} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Sınav Tamamlandı!</h1>
          <p className="text-muted-foreground mb-6">{exam.title}</p>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-muted">
              <p className="text-2xl font-bold">{score}</p>
              <p className="text-sm text-muted-foreground">Doğru</p>
            </div>
            <div className="p-4 rounded-xl bg-muted">
              <p className="text-2xl font-bold">{exam.questions.length - score}</p>
              <p className="text-sm text-muted-foreground">Yanlış</p>
            </div>
            <div className="p-4 rounded-xl bg-muted">
              <p className="text-2xl font-bold">%{percentage}</p>
              <p className="text-sm text-muted-foreground">Başarı</p>
            </div>
          </div>
          
          <Button variant="apple" onClick={() => navigate('/denemeler')}>
            Denemelere Dön
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / exam.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{exam.title}</h1>
          <p className="text-sm text-muted-foreground">{exam.subject}</p>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold",
          timeLeft < 60 ? "bg-red-500/10 text-red-500" : "bg-muted"
        )}>
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>İlerleme: {answeredCount}/{exam.questions.length}</span>
          <span>Soru {currentQuestionIndex + 1}/{exam.questions.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg">
            <span className="text-primary mr-2">Soru {currentQuestionIndex + 1}:</span>
            {currentQuestion.question_text}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0 space-y-3">
          {['A', 'B', 'C', 'D'].map(option => {
            const optionKey = `option_${option.toLowerCase()}` as keyof ExamQuestion;
            const isSelected = answers[currentQuestion.id] === option;
            
            return (
              <button
                key={option}
                onClick={() => handleAnswer(currentQuestion.id, option)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3",
                  isSelected 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <span className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  {option}
                </span>
                <span>{currentQuestion[optionKey]}</span>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Önceki
        </Button>
        
        <div className="flex gap-2 flex-wrap justify-center">
          {exam.questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(i)}
              className={cn(
                "w-8 h-8 rounded-lg text-sm font-medium transition-all",
                currentQuestionIndex === i && "ring-2 ring-primary ring-offset-2",
                answers[q.id] ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
        
        {currentQuestionIndex < exam.questions.length - 1 ? (
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(prev => Math.min(exam.questions.length - 1, prev + 1))}
          >
            Sonraki
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            variant="apple"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Sınavı Bitir
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
