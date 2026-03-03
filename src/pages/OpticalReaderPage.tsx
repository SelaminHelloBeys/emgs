import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useTrialExams } from '@/hooks/useTrialExams';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Camera,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  ScanLine,
  Eye,
  Save,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Tesseract from 'tesseract.js';

interface ScanResult {
  studentNumber: string;
  answers: Record<number, string>;
  totalQuestions: number;
}

interface GradingResult {
  correct: number;
  wrong: number;
  blank: number;
  net: number;
  answers: { question: number; selected: string; correct: string; status: 'correct' | 'wrong' | 'blank' }[];
}

// Answer key: maps question number to correct option (A/B/C/D)
const EMPTY_ANSWER_KEY: Record<number, string> = {};

export const OpticalReaderPage: React.FC = () => {
  const { canCreateContent, user } = useAuth();
  const { exams } = useTrialExams();
  const [selectedExamId, setSelectedExamId] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const [answerKey, setAnswerKey] = useState<Record<number, string>>(EMPTY_ANSWER_KEY);
  const [questionCount, setQuestionCount] = useState(20);
  const [manualStudentNumber, setManualStudentNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize answer key when question count changes
  useEffect(() => {
    const key: Record<number, string> = {};
    for (let i = 1; i <= questionCount; i++) {
      key[i] = answerKey[i] || '';
    }
    setAnswerKey(key);
  }, [questionCount]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      toast.error('Kamera erişimi sağlanamadı');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/png');
    setCapturedImage(imageData);
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen bir resim dosyası seçin');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Dosya boyutu 10MB\'dan küçük olmalı');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCapturedImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!capturedImage) return;
    setIsProcessing(true);
    setOcrProgress(0);

    try {
      const result = await Tesseract.recognize(capturedImage, 'tur+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      const text = result.data.text;
      console.log('OCR Result:', text);

      // Try to extract student number (look for patterns like "No: 123" or just numbers)
      const numberMatch = text.match(/(?:no|numara|öğrenci)\s*:?\s*(\d{1,6})/i) 
        || text.match(/^(\d{3,6})$/m);
      const studentNumber = numberMatch ? numberMatch[1] : '';

      // Try to extract marked answers
      // Look for patterns like "1-A", "1.A", "1) A", etc.
      const answers: Record<number, string> = {};
      const answerPattern = /(\d{1,2})\s*[-.)]\s*([A-Da-d])/g;
      let match;
      while ((match = answerPattern.exec(text)) !== null) {
        const qNum = parseInt(match[1]);
        const answer = match[2].toUpperCase();
        if (qNum >= 1 && qNum <= questionCount) {
          answers[qNum] = answer;
        }
      }

      // Also look for bubble-style patterns (consecutive A/B/C/D)
      const lines = text.split('\n').filter(l => l.trim());
      let qCounter = Object.keys(answers).length > 0 ? 0 : 1;
      if (Object.keys(answers).length === 0) {
        for (const line of lines) {
          const bubbleMatch = line.trim().match(/^[A-Da-d]$/);
          if (bubbleMatch && qCounter <= questionCount) {
            answers[qCounter] = bubbleMatch[0].toUpperCase();
            qCounter++;
          }
        }
      }

      setScanResult({
        studentNumber,
        answers,
        totalQuestions: questionCount,
      });

      if (studentNumber) {
        setManualStudentNumber(studentNumber);
      }

      toast.success(`OCR tamamlandı. ${Object.keys(answers).length} cevap tespit edildi.`);
    } catch (err) {
      console.error('OCR Error:', err);
      toast.error('Görüntü işlenirken hata oluştu');
    }

    setIsProcessing(false);
  };

  const gradeAnswers = useCallback(() => {
    if (!scanResult) return;

    const hasAnswerKey = Object.values(answerKey).some(v => v !== '');
    if (!hasAnswerKey) {
      toast.error('Lütfen cevap anahtarını doldurun');
      return;
    }

    const results: GradingResult['answers'] = [];
    let correct = 0, wrong = 0, blank = 0;

    for (let i = 1; i <= questionCount; i++) {
      const selected = scanResult.answers[i] || '';
      const correctAnswer = answerKey[i] || '';
      
      if (!selected) {
        blank++;
        results.push({ question: i, selected: '-', correct: correctAnswer, status: 'blank' });
      } else if (selected === correctAnswer) {
        correct++;
        results.push({ question: i, selected, correct: correctAnswer, status: 'correct' });
      } else {
        wrong++;
        results.push({ question: i, selected, correct: correctAnswer, status: 'wrong' });
      }
    }

    const net = correct - (wrong * 0.25);

    setGradingResult({ correct, wrong, blank, net, answers: results });
    toast.success('Notlandırma tamamlandı!');
  }, [scanResult, answerKey, questionCount]);

  const saveResult = async () => {
    if (!gradingResult || !selectedExamId || !manualStudentNumber) {
      toast.error('Lütfen sınav, öğrenci numarası ve notlandırma sonuçlarını kontrol edin');
      return;
    }

    setIsSaving(true);
    try {
      // Find student by school number (looking in profiles)
      const { data: studentProfiles } = await supabase
        .from('profiles')
        .select('user_id, name')
        .ilike('grade', `%${manualStudentNumber}%`)
        .limit(1);

      // Try to save as exam participation
      const studentUserId = studentProfiles?.[0]?.user_id;
      
      if (!studentUserId) {
        toast.error('Öğrenci bulunamadı. Lütfen öğrenci numarasını kontrol edin.');
        setIsSaving(false);
        return;
      }

      const { error } = await supabase
        .from('student_exam_participation')
        .upsert({
          exam_id: selectedExamId,
          user_id: studentUserId,
          participated: true,
          correct_count: gradingResult.correct,
          wrong_count: gradingResult.wrong,
          blank_count: gradingResult.blank,
          net_score: gradingResult.net,
        }, { onConflict: 'exam_id,user_id' });

      if (error) throw error;
      toast.success(`${studentProfiles[0].name} için sonuç kaydedildi!`);
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Sonuç kaydedilirken hata oluştu');
    }
    setIsSaving(false);
  };

  const resetAll = () => {
    setCapturedImage(null);
    setScanResult(null);
    setGradingResult(null);
    setManualStudentNumber('');
    setOcrProgress(0);
    stopCamera();
  };

  if (!canCreateContent) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erişim Engellendi</h2>
          <p className="text-muted-foreground">Bu sayfaya yalnızca öğretmen ve yöneticiler erişebilir.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Optik Okuyucu</h1>
            <p className="text-muted-foreground">Optik formları kamera ile tarayın ve otomatik notlandırın</p>
          </div>
        </div>
      </div>

      {/* Step 1: Configuration */}
      <Card className="p-6 border-0 bg-card/80 dark:bg-card/50 backdrop-blur-sm space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">1</span>
          Ayarlar
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Sınav Seçin</label>
            <Select value={selectedExamId} onValueChange={setSelectedExamId}>
              <SelectTrigger>
                <SelectValue placeholder="Sınav seçin..." />
              </SelectTrigger>
              <SelectContent>
                {exams.map(exam => (
                  <SelectItem key={exam.id} value={exam.id}>{exam.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Soru Sayısı</label>
            <Select value={String(questionCount)} onValueChange={v => setQuestionCount(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 15, 20, 25, 30, 40, 50, 60, 90].map(n => (
                  <SelectItem key={n} value={String(n)}>{n} Soru</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Step 2: Answer Key */}
      <Card className="p-6 border-0 bg-card/80 dark:bg-card/50 backdrop-blur-sm space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">2</span>
          Cevap Anahtarı
        </h3>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {Array.from({ length: questionCount }, (_, i) => i + 1).map(qNum => (
            <div key={qNum} className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{qNum}</p>
              <Select value={answerKey[qNum] || ''} onValueChange={v => setAnswerKey(prev => ({ ...prev, [qNum]: v }))}>
                <SelectTrigger className="h-8 text-xs px-1">
                  <SelectValue placeholder="-" />
                </SelectTrigger>
                <SelectContent>
                  {['A', 'B', 'C', 'D'].map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </Card>

      {/* Step 3: Capture */}
      <Card className="p-6 border-0 bg-card/80 dark:bg-card/50 backdrop-blur-sm space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">3</span>
          Optik Form Tarama
        </h3>

        {!capturedImage && !cameraActive && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={startCamera} variant="apple" className="gap-2 flex-1">
              <Camera className="w-4 h-4" /> Kamerayı Aç
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="gap-2 flex-1">
              <Upload className="w-4 h-4" /> Dosya Yükle
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {cameraActive && (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3]">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <div className="absolute inset-0 border-2 border-primary/30 rounded-xl pointer-events-none">
                <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary" />
                <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={capturePhoto} variant="apple" className="gap-2 flex-1">
                <Camera className="w-4 h-4" /> Fotoğraf Çek
              </Button>
              <Button onClick={stopCamera} variant="outline" className="gap-2">
                <X className="w-4 h-4" /> İptal
              </Button>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-muted">
              <img src={capturedImage} alt="Captured" className="w-full max-h-[400px] object-contain" />
            </div>
            <div className="flex gap-3">
              <Button onClick={processImage} variant="apple" className="gap-2 flex-1" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    İşleniyor... %{ocrProgress}
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" /> OCR ile Tara
                  </>
                )}
              </Button>
              <Button onClick={resetAll} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" /> Yeniden
              </Button>
            </div>
            {isProcessing && (
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${ocrProgress}%` }} />
              </div>
            )}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </Card>

      {/* Step 4: Results & Manual Edit */}
      {scanResult && (
        <Card className="p-6 border-0 bg-card/80 dark:bg-card/50 backdrop-blur-sm space-y-4 animate-slide-up">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">4</span>
            Sonuçları Doğrula
          </h3>

          <div>
            <label className="text-sm font-medium mb-2 block">Öğrenci Numarası</label>
            <Input
              value={manualStudentNumber}
              onChange={e => setManualStudentNumber(e.target.value)}
              placeholder="Öğrenci numarasını girin veya düzeltin..."
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Tespit Edilen Cevaplar ({Object.keys(scanResult.answers).length}/{questionCount})</p>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {Array.from({ length: questionCount }, (_, i) => i + 1).map(qNum => {
                const answer = scanResult.answers[qNum] || '';
                return (
                  <div key={qNum} className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">{qNum}</p>
                    <Select
                      value={answer}
                      onValueChange={v => {
                        setScanResult(prev => {
                          if (!prev) return prev;
                          return { ...prev, answers: { ...prev.answers, [qNum]: v } };
                        });
                      }}
                    >
                      <SelectTrigger className={cn("h-8 text-xs px-1", answer ? 'border-primary' : 'border-muted')}>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=" ">-</SelectItem>
                        {['A', 'B', 'C', 'D'].map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          </div>

          <Button onClick={gradeAnswers} variant="apple" className="w-full gap-2">
            <CheckCircle className="w-4 h-4" /> Notlandır
          </Button>
        </Card>
      )}

      {/* Step 5: Grading Result */}
      {gradingResult && (
        <Card className="p-6 border-0 bg-card/80 dark:bg-card/50 backdrop-blur-sm space-y-4 animate-slide-up">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">5</span>
            Notlandırma Sonucu
          </h3>

          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 rounded-xl bg-green-500/10 dark:bg-green-500/20">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{gradingResult.correct}</p>
              <p className="text-xs text-muted-foreground">Doğru</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-red-500/10 dark:bg-red-500/20">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{gradingResult.wrong}</p>
              <p className="text-xs text-muted-foreground">Yanlış</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <p className="text-2xl font-bold text-muted-foreground">{gradingResult.blank}</p>
              <p className="text-xs text-muted-foreground">Boş</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-primary/10 dark:bg-primary/20">
              <p className="text-2xl font-bold text-primary">{gradingResult.net.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Net</p>
            </div>
          </div>

          {/* Detailed answer grid */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {gradingResult.answers.map(a => (
              <div
                key={a.question}
                className={cn(
                  "text-center p-1.5 rounded-lg text-xs font-medium",
                  a.status === 'correct' && 'bg-green-500/10 text-green-600 dark:text-green-400',
                  a.status === 'wrong' && 'bg-red-500/10 text-red-600 dark:text-red-400',
                  a.status === 'blank' && 'bg-muted text-muted-foreground',
                )}
              >
                <div className="text-[10px] opacity-60">{a.question}</div>
                <div>{a.selected}</div>
              </div>
            ))}
          </div>

          <Button onClick={saveResult} variant="apple" className="w-full gap-2" disabled={isSaving || !selectedExamId}>
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Kaydediliyor...</>
            ) : (
              <><Save className="w-4 h-4" /> Sonucu Kaydet</>
            )}
          </Button>
        </Card>
      )}
    </div>
  );
};
