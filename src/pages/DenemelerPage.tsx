import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useExams, ExamQuestion } from '@/hooks/useExams';
import { FileText, Clock, CheckCircle, PlayCircle, Plus, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const subjects = [
  'Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 'Edebiyat',
  'Tarih', 'Coğrafya', 'İngilizce', 'Almanca', 'Felsefe', 'Din Kültürü'
];

const grades = ['5', '6', '7', '8'];

interface QuestionForm {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
}

export const DenemelerPage: React.FC = () => {
  const navigate = useNavigate();
  const { canCreateContent, isAdmin } = useAuth();
  const { exams, isLoading, createExam } = useExams();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [duration, setDuration] = useState('60');
  const [questions, setQuestions] = useState<QuestionForm[]>([{
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A'
  }]);

  const canCreate = canCreateContent || isAdmin;

  const completedExams = exams.filter(e => e.result?.status === 'completed');
  const availableExams = exams.filter(e => e.result?.status !== 'completed');

  const addQuestion = () => {
    setQuestions([...questions, {
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'A'
    }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof QuestionForm, value: string) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleCreate = async () => {
    if (!title || !subject || !grade || questions.some(q => !q.question_text || !q.option_a || !q.option_b || !q.option_c || !q.option_d)) {
      return;
    }
    
    setIsSubmitting(true);
    await createExam(title, subject, grade, parseInt(duration), description, questions.map((q, i) => ({
      ...q,
      question_order: i + 1
    })));
    setIsSubmitting(false);
    
    // Reset form
    setTitle('');
    setDescription('');
    setSubject('');
    setGrade('');
    setDuration('60');
    setQuestions([{
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'A'
    }]);
    setIsDialogOpen(false);
  };

  const getExamStatus = (exam: any) => {
    if (exam.result?.status === 'completed') return 'completed';
    if (exam.result?.status === 'in_progress') return 'in_progress';
    return 'available';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Denemeler</h1>
          <p className="text-muted-foreground mt-1">Sınavlara hazırlan, kendini test et</p>
        </div>
        
        {canCreate && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="apple" className="gap-2">
                <Plus className="w-4 h-4" />
                Deneme Oluştur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Yeni Deneme Oluştur</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Başlık</label>
                  <Input
                    placeholder="Deneme başlığı"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Açıklama</label>
                  <Textarea
                    placeholder="Deneme açıklaması..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Ders</label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Ders" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sınıf</label>
                    <Select value={grade} onValueChange={setGrade}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sınıf" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades.map(g => (
                          <SelectItem key={g} value={g}>{g}. Sınıf</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Süre (dk)</label>
                    <Input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Sorular</label>
                    <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                      <Plus className="w-4 h-4 mr-1" />
                      Soru Ekle
                    </Button>
                  </div>
                  
                  {questions.map((q, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-medium">Soru {index + 1}</span>
                        {questions.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(index)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Soru metni..."
                          value={q.question_text}
                          onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                          rows={2}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="A şıkkı"
                            value={q.option_a}
                            onChange={(e) => updateQuestion(index, 'option_a', e.target.value)}
                          />
                          <Input
                            placeholder="B şıkkı"
                            value={q.option_b}
                            onChange={(e) => updateQuestion(index, 'option_b', e.target.value)}
                          />
                          <Input
                            placeholder="C şıkkı"
                            value={q.option_c}
                            onChange={(e) => updateQuestion(index, 'option_c', e.target.value)}
                          />
                          <Input
                            placeholder="D şıkkı"
                            value={q.option_d}
                            onChange={(e) => updateQuestion(index, 'option_d', e.target.value)}
                          />
                        </div>
                        <Select
                          value={q.correct_option}
                          onValueChange={(v) => updateQuestion(index, 'correct_option', v)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">Doğru: A</SelectItem>
                            <SelectItem value="B">Doğru: B</SelectItem>
                            <SelectItem value="C">Doğru: C</SelectItem>
                            <SelectItem value="D">Doğru: D</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </Card>
                  ))}
                </div>

                <Button
                  variant="apple"
                  className="w-full"
                  onClick={handleCreate}
                  disabled={!title || !subject || !grade || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    'Denemeyi Oluştur'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{exams.length}</p>
                <p className="text-sm text-muted-foreground">Toplam Deneme</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedExams.length}</p>
                <p className="text-sm text-muted-foreground">Tamamlanan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {completedExams.length > 0 
                    ? Math.round(completedExams.reduce((acc, e) => acc + ((e.result?.score || 0) / (e.result?.total_questions || 1) * 100), 0) / completedExams.length)
                    : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Ortalama Başarı</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exams List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Mevcut Denemeler</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : exams.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Henüz deneme yok</h3>
              <p className="text-muted-foreground">
                {canCreate ? 'İlk denemeyi oluşturmak için yukarıdaki butonu kullanın.' : 'Yakında yeni denemeler eklenecek!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam) => {
              const status = getExamStatus(exam);
              
              return (
                <Card key={exam.id} className="glass-card hover-lift">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{exam.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{exam.subject}</p>
                      </div>
                      <Badge
                        variant={
                          status === 'completed' ? 'default' :
                          status === 'in_progress' ? 'secondary' : 'outline'
                        }
                      >
                        {status === 'completed' ? 'Tamamlandı' :
                         status === 'in_progress' ? 'Devam Ediyor' : 'Başla'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {(exam as any).questionCount || 0} Soru
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {exam.duration} dk
                      </span>
                    </div>
                    
                    {status === 'completed' && exam.result ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          Puan: <strong>{Math.round((exam.result.score / exam.result.total_questions) * 100)}%</strong>
                        </span>
                        <Button variant="outline" size="sm">Sonuçları Gör</Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => navigate(`/denemeler/${exam.id}`)}
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        {status === 'in_progress' ? 'Devam Et' : 'Başla'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
