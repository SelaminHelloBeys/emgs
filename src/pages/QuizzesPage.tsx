import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Trophy,
  Target,
  Play,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Quiz {
  id: number;
  title: string;
  subject: string;
  questions: number;
  duration: string;
  teacher: string;
  dueDate?: string;
  completed?: boolean;
  score?: number;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
}

const mockQuizzes: Quiz[] = [
  { id: 1, title: 'Türev Testi', subject: 'Matematik', questions: 15, duration: '20 dk', teacher: 'Ahmet Yılmaz', dueDate: 'Bugün' },
  { id: 2, title: 'Newton Kanunları', subject: 'Fizik', questions: 10, duration: '15 dk', teacher: 'Ayşe Demir', dueDate: 'Yarın' },
  { id: 3, title: 'Organik Kimya Temelleri', subject: 'Kimya', questions: 20, duration: '25 dk', teacher: 'Mehmet Kaya', completed: true, score: 85 },
  { id: 4, title: 'Osmanlı Tarihi', subject: 'Tarih', questions: 15, duration: '20 dk', teacher: 'Fatma Özkan', completed: true, score: 92 },
];

const sampleQuestions: Question[] = [
  {
    id: 1,
    text: 'f(x) = x² + 3x fonksiyonunun türevi nedir?',
    options: ['2x + 3', 'x² + 3', '2x', '3x + 2'],
    correct: 0,
  },
  {
    id: 2,
    text: 'Limit kavramı hangi matematiksel işlemde kullanılır?',
    options: ['Toplama', 'Çıkarma', 'Türev', 'Bölme'],
    correct: 2,
  },
  {
    id: 3,
    text: 'f(x) = sin(x) fonksiyonunun türevi nedir?',
    options: ['-cos(x)', 'cos(x)', '-sin(x)', 'tan(x)'],
    correct: 1,
  },
];

export const QuizzesPage: React.FC = () => {
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const pendingQuizzes = mockQuizzes.filter(q => !q.completed);
  const completedQuizzes = mockQuizzes.filter(q => q.completed);

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsQuizActive(true);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResults(false);
  };

  const submitAnswer = () => {
    if (selectedAnswer !== null) {
      setAnswers([...answers, selectedAnswer]);
      if (currentQuestion < sampleQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResults(true);
      }
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === sampleQuestions[index].correct) {
        correct++;
      }
    });
    return Math.round((correct / sampleQuestions.length) * 100);
  };

  if (isQuizActive && selectedQuiz) {
    if (showResults) {
      const score = calculateScore();
      return (
        <div className="max-w-2xl mx-auto space-y-6 animate-scale-in">
          <Card variant="elevated" className="p-8 text-center">
            <div className={cn(
              "w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center",
              score >= 70 ? "bg-apple-green/10" : "bg-apple-orange/10"
            )}>
              <Trophy className={cn(
                "w-12 h-12",
                score >= 70 ? "text-apple-green" : "text-apple-orange"
              )} />
            </div>
            <h2 className="text-3xl font-bold mb-2">Quiz Tamamlandı!</h2>
            <p className="text-muted-foreground mb-6">{selectedQuiz.title}</p>
            
            <div className="text-6xl font-bold text-primary mb-2">{score}%</div>
            <p className="text-muted-foreground mb-8">
              {answers.filter((a, i) => a === sampleQuestions[i].correct).length} / {sampleQuestions.length} doğru
            </p>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => setIsQuizActive(false)}>
                Quizlere Dön
              </Button>
              <Button variant="apple" onClick={() => startQuiz(selectedQuiz)} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Tekrar Dene
              </Button>
            </div>
          </Card>

          {/* Answer Review */}
          <Card variant="default" className="p-6">
            <h3 className="font-semibold mb-4">Cevap Özeti</h3>
            <div className="space-y-3">
              {sampleQuestions.map((q, index) => (
                <div key={q.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-secondary">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    answers[index] === q.correct ? "bg-apple-green/10" : "bg-apple-red/10"
                  )}>
                    {answers[index] === q.correct ? (
                      <CheckCircle className="w-5 h-5 text-apple-green" />
                    ) : (
                      <XCircle className="w-5 h-5 text-apple-red" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Soru {index + 1}</p>
                    <p className="text-xs text-muted-foreground">
                      Doğru cevap: {q.options[q.correct]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      );
    }

    const question = sampleQuestions[currentQuestion];

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Progress */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            Soru {currentQuestion + 1} / {sampleQuestions.length}
          </span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>15:42</span>
          </div>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all"
            style={{ width: `${((currentQuestion + 1) / sampleQuestions.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <Card variant="elevated" className="p-8">
          <h2 className="text-xl font-semibold mb-6">{question.text}</h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={cn(
                  "w-full p-4 rounded-xl text-left transition-all border-2",
                  selectedAnswer === index
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-surface-secondary"
                )}
                onClick={() => setSelectedAnswer(index)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    selectedAnswer === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setIsQuizActive(false)}
          >
            Çık
          </Button>
          <Button 
            variant="apple" 
            disabled={selectedAnswer === null}
            onClick={submitAnswer}
            className="gap-2"
          >
            {currentQuestion < sampleQuestions.length - 1 ? 'Sonraki' : 'Bitir'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">Quizler</h1>
        <p className="text-muted-foreground">Bilgini test et, kendini geliştir</p>
      </div>

      {/* Pending Quizzes */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Bekleyen Quizler
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {pendingQuizzes.map((quiz) => (
            <Card key={quiz.id} variant="interactive" className="p-5">
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {quiz.subject}
                </span>
                {quiz.dueDate && (
                  <span className="text-xs font-medium text-apple-orange bg-apple-orange/10 px-2 py-1 rounded-full">
                    {quiz.dueDate}
                  </span>
                )}
              </div>
              <h3 className="font-semibold mb-2">{quiz.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{quiz.teacher}</p>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span>{quiz.questions} soru</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {quiz.duration}
                </span>
              </div>
              <Button 
                variant="apple" 
                className="w-full gap-2"
                onClick={() => startQuiz(quiz)}
              >
                <Play className="w-4 h-4" />
                Başla
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Completed Quizzes */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-apple-green" />
          Tamamlanan Quizler
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedQuizzes.map((quiz) => (
            <Card key={quiz.id} variant="default" className="p-5">
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {quiz.subject}
                </span>
                <div className={cn(
                  "text-lg font-bold",
                  quiz.score! >= 70 ? "text-apple-green" : "text-apple-orange"
                )}>
                  {quiz.score}%
                </div>
              </div>
              <h3 className="font-semibold mb-2">{quiz.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{quiz.teacher}</p>
              <Button variant="outline" className="w-full gap-2">
                <RotateCcw className="w-4 h-4" />
                Tekrar Dene
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
