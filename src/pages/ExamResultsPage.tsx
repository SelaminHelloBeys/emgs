import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useExamResults, ExamResultDetail } from '@/hooks/useExamResults';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Trophy,
  Target,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const ExamResultsPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { getExamResult, isLoading } = useExamResults();
  const [result, setResult] = useState<ExamResultDetail | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<number>(0);

  useEffect(() => {
    const loadResult = async () => {
      if (!examId) return;
      const data = await getExamResult(examId);
      setResult(data);
    };
    loadResult();
  }, [examId]);

  if (isLoading || !result) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const percentage = Math.round((result.result.score / result.result.total_questions) * 100);
  const currentQuestion = result.questions[selectedQuestion];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/denemeler')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{result.exam.title}</h1>
          <p className="text-muted-foreground">{result.exam.subject} - Sonuç Detayı</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className={cn(
            "w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center",
            percentage >= 70 ? "bg-green-500/10" : percentage >= 50 ? "bg-yellow-500/10" : "bg-red-500/10"
          )}>
            <Trophy className={cn(
              "w-6 h-6",
              percentage >= 70 ? "text-green-500" : percentage >= 50 ? "text-yellow-500" : "text-red-500"
            )} />
          </div>
          <p className="text-2xl font-bold">%{percentage}</p>
          <p className="text-sm text-muted-foreground">Başarı Oranı</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center bg-green-500/10">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-2xl font-bold">{result.result.score}</p>
          <p className="text-sm text-muted-foreground">Doğru</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center bg-red-500/10">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-2xl font-bold">{result.result.total_questions - result.result.score}</p>
          <p className="text-sm text-muted-foreground">Yanlış</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center bg-primary/10">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <p className="text-2xl font-bold">{result.result.total_questions}</p>
          <p className="text-sm text-muted-foreground">Toplam Soru</p>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Doğru / Yanlış Oranı</span>
          <span className="text-sm text-muted-foreground">
            {result.result.score} / {result.result.total_questions}
          </span>
        </div>
        <Progress value={percentage} className="h-3" />
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Question Navigation */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Soru Listesi</h3>
          <div className="grid grid-cols-5 gap-2">
            {result.questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setSelectedQuestion(i)}
                className={cn(
                  "w-full aspect-square rounded-lg text-sm font-medium transition-all flex items-center justify-center",
                  selectedQuestion === i && "ring-2 ring-primary ring-offset-2",
                  q.is_correct 
                    ? "bg-green-500/10 text-green-600" 
                    : "bg-red-500/10 text-red-600"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500/20" />
              <span className="text-muted-foreground">Doğru</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500/20" />
              <span className="text-muted-foreground">Yanlış</span>
            </div>
          </div>
        </Card>

        {/* Question Detail */}
        <Card className="lg:col-span-2 p-6">
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn(
                "px-2 py-1 rounded-lg text-xs font-medium",
                currentQuestion.is_correct 
                  ? "bg-green-500/10 text-green-600" 
                  : "bg-red-500/10 text-red-600"
              )}>
                {currentQuestion.is_correct ? 'Doğru' : 'Yanlış'}
              </span>
            </div>
            <CardTitle className="text-lg">
              <span className="text-primary mr-2">Soru {selectedQuestion + 1}:</span>
              {currentQuestion.question_text}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="px-0 pb-0 space-y-3">
            {['A', 'B', 'C', 'D'].map(option => {
              const optionKey = `option_${option.toLowerCase()}` as keyof typeof currentQuestion;
              const isCorrect = currentQuestion.correct_option === option;
              const isUserAnswer = currentQuestion.user_answer === option;
              
              return (
                <div
                  key={option}
                  className={cn(
                    "p-4 rounded-xl border-2 flex items-center gap-3",
                    isCorrect && "border-green-500 bg-green-500/5",
                    !isCorrect && isUserAnswer && "border-red-500 bg-red-500/5",
                    !isCorrect && !isUserAnswer && "border-border"
                  )}
                >
                  <span className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                    isCorrect && "bg-green-500 text-white",
                    !isCorrect && isUserAnswer && "bg-red-500 text-white",
                    !isCorrect && !isUserAnswer && "bg-muted"
                  )}>
                    {option}
                  </span>
                  <span className="flex-1">{currentQuestion[optionKey]}</span>
                  {isCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {!isCorrect && isUserAnswer && <XCircle className="w-5 h-5 text-red-500" />}
                </div>
              );
            })}
          </CardContent>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setSelectedQuestion(prev => Math.max(0, prev - 1))}
              disabled={selectedQuestion === 0}
            >
              Önceki Soru
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedQuestion(prev => Math.min(result.questions.length - 1, prev + 1))}
              disabled={selectedQuestion === result.questions.length - 1}
            >
              Sonraki Soru
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
