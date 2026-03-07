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
  Sparkles,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// LGS Subject definitions
const LGS_SUBJECTS = [
  { key: 'turkce', label: 'Türkçe', count: 20, start: 1, coefficient: 4 },
  { key: 'matematik', label: 'Matematik', count: 20, start: 21, coefficient: 4 },
  { key: 'fen', label: 'Fen Bilimleri', count: 20, start: 41, coefficient: 4 },
  { key: 'inkilap', label: 'İnkılap Tarihi', count: 10, start: 61, coefficient: 1 },
  { key: 'din', label: 'Din Kültürü', count: 10, start: 71, coefficient: 1 },
  { key: 'ingilizce', label: 'İngilizce', count: 10, start: 81, coefficient: 1 },
] as const;

const TOTAL_QUESTIONS = 90;

interface ScanResult {
  detectedName: string;
  answers: Record<number, string>;
  totalQuestions: number;
}

interface SubjectScore {
  correct: number;
  wrong: number;
  blank: number;
  net: number;
}

interface GradingResult {
  subjects: Record<string, SubjectScore>;
  totalCorrect: number;
  totalWrong: number;
  totalBlank: number;
  totalNet: number;
  weightedNet: number;
  lgsPuan: number;
  answers: { question: number; selected: string; correct: string; status: 'correct' | 'wrong' | 'blank' }[];
}

// Simple string similarity (Dice coefficient)
function stringSimilarity(a: string, b: string): number {
  const al = a.toLowerCase().trim();
  const bl = b.toLowerCase().trim();
  if (al === bl) return 1;
  if (al.length < 2 || bl.length < 2) return 0;
  const bigrams = new Map<string, number>();
  for (let i = 0; i < al.length - 1; i++) {
    const bi = al.substring(i, i + 2);
    bigrams.set(bi, (bigrams.get(bi) || 0) + 1);
  }
  let intersect = 0;
  for (let i = 0; i < bl.length - 1; i++) {
    const bi = bl.substring(i, i + 2);
    const count = bigrams.get(bi) || 0;
    if (count > 0) {
      bigrams.set(bi, count - 1);
      intersect++;
    }
  }
  return (2 * intersect) / (al.length - 1 + bl.length - 1);
}

const OCR_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ocr-reader`;

export const OpticalReaderPage: React.FC = () => {
  const { canCreateContent, user } = useAuth();
  const { exams } = useTrialExams();
  const [selectedExamId, setSelectedExamId] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const [answerKey, setAnswerKey] = useState<Record<number, string>>({});
  const [matchedStudent, setMatchedStudent] = useState<{ user_id: string; name: string } | null>(null);
  const [allProfiles, setAllProfiles] = useState<{ user_id: string; name: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [processingStage, setProcessingStage] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load all profiles for name matching
  useEffect(() => {
    const loadProfiles = async () => {
      const { data } = await supabase.from('profiles').select('user_id, name');
      setAllProfiles(data || []);
    };
    loadProfiles();
  }, []);

  // Initialize answer key
  useEffect(() => {
    const key: Record<number, string> = {};
    for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
      key[i] = answerKey[i] || '';
    }
    setAnswerKey(key);
  }, []);

  // Set video srcObject after cameraActive renders the video element
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(err => {
        console.error('Video play error:', err);
        toast.error('Kamera başlatılamadı');
      });
    }
  }, [cameraActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      toast.error('Kamera erişimi sağlanamadı. Tarayıcı izinlerini kontrol edin.');
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
    reader.onload = (ev) => setCapturedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const findClosestStudent = (detectedName: string) => {
    if (!detectedName || allProfiles.length === 0) return null;
    let bestMatch: { user_id: string; name: string } | null = null;
    let bestScore = 0;

    for (const profile of allProfiles) {
      const score = stringSimilarity(detectedName, profile.name);
      if (score > bestScore && score > 0.3) {
        bestScore = score;
        bestMatch = profile;
      }
    }
    return bestMatch;
  };

  const processImage = async () => {
    if (!capturedImage) return;
    setIsProcessing(true);
    setProcessingStage('AI modeli görüntüyü analiz ediyor...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Lütfen giriş yapın');
      }

      setProcessingStage('Optik form okunuyor...');
      
      const response = await fetch(OCR_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ imageBase64: capturedImage }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'OCR hatası');
      }

      const result = await response.json();
      
      const detectedName = result.name || '';
      const answers: Record<number, string> = {};
      
      if (result.answers) {
        for (const [key, value] of Object.entries(result.answers)) {
          const qNum = parseInt(key);
          if (qNum >= 1 && qNum <= TOTAL_QUESTIONS && typeof value === 'string') {
            answers[qNum] = value.toUpperCase();
          }
        }
      }

      setScanResult({ detectedName, answers, totalQuestions: TOTAL_QUESTIONS });

      // Find closest matching student
      if (detectedName) {
        const closest = findClosestStudent(detectedName);
        if (closest) {
          setMatchedStudent(closest);
          toast.success(`"${detectedName}" → "${closest.name}" olarak eşleştirildi`);
        } else {
          setMatchedStudent(null);
          toast.warning(`"${detectedName}" ile eşleşen öğrenci bulunamadı`);
        }
      }

      toast.success(`AI tarama tamamlandı. ${Object.keys(answers).length} cevap tespit edildi.`);
    } catch (err) {
      console.error('AI OCR Error:', err);
      toast.error(err instanceof Error ? err.message : 'Görüntü işlenirken hata oluştu');
    }

    setIsProcessing(false);
    setProcessingStage('');
  };

  const gradeAnswers = useCallback(() => {
    if (!scanResult) return;
    const hasAnswerKey = Object.values(answerKey).some(v => v !== '');
    if (!hasAnswerKey) {
      toast.error('Lütfen cevap anahtarını doldurun');
      return;
    }

    const subjectScores: Record<string, SubjectScore> = {};
    const allResults: GradingResult['answers'] = [];
    let totalCorrect = 0, totalWrong = 0, totalBlank = 0;
    let weightedNet = 0;

    for (const subject of LGS_SUBJECTS) {
      let correct = 0, wrong = 0, blank = 0;
      for (let i = subject.start; i < subject.start + subject.count; i++) {
        const selected = scanResult.answers[i] || '';
        const correctAnswer = answerKey[i] || '';

        if (!selected || selected.trim() === '') {
          blank++;
          allResults.push({ question: i, selected: '-', correct: correctAnswer, status: 'blank' });
        } else if (selected === correctAnswer) {
          correct++;
          allResults.push({ question: i, selected, correct: correctAnswer, status: 'correct' });
        } else {
          wrong++;
          allResults.push({ question: i, selected, correct: correctAnswer, status: 'wrong' });
        }
      }

      const net = correct - (wrong / 3);
      subjectScores[subject.key] = { correct, wrong, blank, net: parseFloat(net.toFixed(2)) };
      weightedNet += net * subject.coefficient;
      totalCorrect += correct;
      totalWrong += wrong;
      totalBlank += blank;
    }

    const totalNet = totalCorrect - (totalWrong / 3);
    const lgsPuan = Math.max(0, (weightedNet / 270) * 500);

    setGradingResult({
      subjects: subjectScores,
      totalCorrect,
      totalWrong,
      totalBlank,
      totalNet: parseFloat(totalNet.toFixed(2)),
      weightedNet: parseFloat(weightedNet.toFixed(2)),
      lgsPuan: parseFloat(lgsPuan.toFixed(2)),
      answers: allResults,
    });
    toast.success('Notlandırma tamamlandı!');
  }, [scanResult, answerKey]);

  const saveResult = async () => {
    if (!gradingResult || !selectedExamId || !matchedStudent) {
      toast.error('Lütfen sınav seçin ve öğrenci eşleşmesini kontrol edin');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('student_exam_participation')
        .upsert({
          exam_id: selectedExamId,
          user_id: matchedStudent.user_id,
          participated: true,
          correct_count: gradingResult.totalCorrect,
          wrong_count: gradingResult.totalWrong,
          blank_count: gradingResult.totalBlank,
          net_score: gradingResult.totalNet,
          subject_scores: gradingResult.subjects as any,
        }, { onConflict: 'exam_id,user_id' });

      if (error) throw error;
      toast.success(`${matchedStudent.name} için sonuç kaydedildi!`);
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
    setMatchedStudent(null);
    setProcessingStage('');
    stopCamera();
  };

  if (!canCreateContent) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="p-8 text-center max-w-md animate-scale-in">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erişim Engellendi</h2>
          <p className="text-muted-foreground">Bu sayfaya yalnızca öğretmen ve yöneticiler erişebilir.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="animate-slide-down">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm animate-pulse-soft">
            <ScanLine className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Optik Okuyucu</h1>
            <p className="text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              AI destekli LGS optik form tarayıcı (90 soru)
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Configuration */}
      <Card className="p-6 border-0 bg-card/80 dark:bg-card/50 backdrop-blur-sm space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs flex items-center justify-center font-bold shadow-sm">1</span>
          Sınav Seçimi
        </h3>
        <Select value={selectedExamId} onValueChange={setSelectedExamId}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Sınav seçin..." />
          </SelectTrigger>
          <SelectContent>
            {exams.map(exam => (
              <SelectItem key={exam.id} value={exam.id}>{exam.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {/* Step 2: LGS Answer Key by Subject */}
      <Card className="p-6 border-0 bg-card/80 dark:bg-card/50 backdrop-blur-sm space-y-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs flex items-center justify-center font-bold shadow-sm">2</span>
          Cevap Anahtarı (LGS - 90 Soru)
        </h3>
        
        {LGS_SUBJECTS.map((subject, idx) => (
          <div key={subject.key} className="space-y-2 animate-fade-in" style={{ animationDelay: `${300 + idx * 50}ms` }}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{subject.label}</span>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                subject.coefficient === 4 
                  ? "bg-primary/10 text-primary" 
                  : "bg-muted text-muted-foreground"
              )}>
                ×{subject.coefficient} katsayı
              </span>
              <span className="text-xs text-muted-foreground">({subject.count} soru)</span>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {Array.from({ length: subject.count }, (_, i) => subject.start + i).map(qNum => (
                <div key={qNum} className="text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">{qNum}</p>
                  <Select value={answerKey[qNum] || ''} onValueChange={v => setAnswerKey(prev => ({ ...prev, [qNum]: v }))}>
                    <SelectTrigger className="h-7 text-xs px-1">
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
          </div>
        ))}
      </Card>

      {/* Step 3: Capture */}
      <Card className="p-6 border-0 bg-card/80 dark:bg-card/50 backdrop-blur-sm space-y-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs flex items-center justify-center font-bold shadow-sm">3</span>
          Optik Form Tarama
          <Zap className="w-4 h-4 text-primary ml-1" />
        </h3>

        {!capturedImage && !cameraActive && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={startCamera} variant="apple" className="gap-2 flex-1 h-12 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              <Camera className="w-5 h-5" /> Kamerayı Aç
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="gap-2 flex-1 h-12 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              <Upload className="w-5 h-5" /> Dosya Yükle
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
          <div className="space-y-3 animate-scale-in">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] shadow-lg">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              {/* Scanning overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 border-2 border-primary/40 rounded-xl">
                  <div className="absolute top-0 left-0 w-10 h-10 border-l-3 border-t-3 border-primary rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-10 h-10 border-r-3 border-t-3 border-primary rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-l-3 border-b-3 border-primary rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-r-3 border-b-3 border-primary rounded-br-lg" />
                </div>
                {/* Scanning line animation */}
                <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={capturePhoto} variant="apple" className="gap-2 flex-1 h-11">
                <Camera className="w-4 h-4" /> Fotoğraf Çek
              </Button>
              <Button onClick={stopCamera} variant="outline" className="gap-2 h-11">
                <X className="w-4 h-4" /> İptal
              </Button>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="space-y-3 animate-scale-in">
            <div className="relative rounded-2xl overflow-hidden bg-muted shadow-lg">
              <img src={capturedImage} alt="Captured" className="w-full max-h-[400px] object-contain" />
              {isProcessing && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-8 h-8 text-primary animate-spin-slow" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{processingStage}</p>
                  <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full animate-indeterminate" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button onClick={processImage} variant="apple" className="gap-2 flex-1 h-11" disabled={isProcessing}>
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> AI Analiz Ediyor...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> AI ile Tara</>
                )}
              </Button>
              <Button onClick={resetAll} variant="outline" className="gap-2 h-11">
                <RotateCcw className="w-4 h-4" /> Yeniden
              </Button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </Card>

      {/* Step 4: Results & Student Match */}
      {scanResult && (
        <Card className="p-6 border-0 bg-card/80 dark:bg-card/50 backdrop-blur-sm space-y-4 animate-slide-up">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs flex items-center justify-center font-bold shadow-sm">4</span>
            Sonuçları Doğrula
          </h3>

          {/* Detected name & matched student */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="animate-fade-in">
              <label className="text-sm font-medium mb-2 block">Tespit Edilen İsim (AI)</label>
              <Input value={scanResult.detectedName || '(tespit edilemedi)'} readOnly className="bg-muted h-11" />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <label className="text-sm font-medium mb-2 block">Eşleşen Öğrenci</label>
              <Select
                value={matchedStudent?.user_id || ''}
                onValueChange={v => {
                  const p = allProfiles.find(p => p.user_id === v);
                  setMatchedStudent(p || null);
                }}
              >
                <SelectTrigger className={cn("h-11", matchedStudent ? 'border-green-500 ring-1 ring-green-500/20' : 'border-destructive')}>
                  <SelectValue placeholder="Öğrenci seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {allProfiles.map(p => (
                    <SelectItem key={p.user_id} value={p.user_id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Detected answers by subject */}
          <div>
            <p className="text-sm font-medium mb-2">Tespit Edilen Cevaplar ({Object.keys(scanResult.answers).length}/{TOTAL_QUESTIONS})</p>
            {LGS_SUBJECTS.map(subject => (
              <div key={subject.key} className="mb-3">
                <p className="text-xs font-semibold text-muted-foreground mb-1">{subject.label}</p>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                  {Array.from({ length: subject.count }, (_, i) => subject.start + i).map(qNum => {
                    const answer = scanResult.answers[qNum] || '';
                    return (
                      <div key={qNum} className="text-center">
                        <p className="text-[10px] text-muted-foreground mb-0.5">{qNum}</p>
                        <Select
                          value={answer}
                          onValueChange={v => {
                            setScanResult(prev => {
                              if (!prev) return prev;
                              return { ...prev, answers: { ...prev.answers, [qNum]: v === ' ' ? '' : v } };
                            });
                          }}
                        >
                          <SelectTrigger className={cn("h-7 text-xs px-1 transition-colors", answer ? 'border-primary bg-primary/5' : 'border-muted')}>
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
            ))}
          </div>

          <Button onClick={gradeAnswers} variant="apple" className="w-full gap-2 h-11 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]">
            <CheckCircle className="w-4 h-4" /> Notlandır
          </Button>
        </Card>
      )}

      {/* Step 5: Grading Result */}
      {gradingResult && (
        <Card className="p-6 border-0 bg-card/80 dark:bg-card/50 backdrop-blur-sm space-y-5 animate-slide-up">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs flex items-center justify-center font-bold shadow-sm">5</span>
            Notlandırma Sonucu
          </h3>

          {/* LGS Total Score */}
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 dark:from-primary/25 dark:to-primary/10 animate-scale-in">
            <p className="text-5xl font-bold text-primary tracking-tight">{gradingResult.lgsPuan.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground mt-1">LGS Puan (500 üzerinden)</p>
          </div>

          {/* Overall stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Doğru', value: gradingResult.totalCorrect, color: 'green' },
              { label: 'Yanlış', value: gradingResult.totalWrong, color: 'red' },
              { label: 'Boş', value: gradingResult.totalBlank, color: 'gray' },
              { label: 'Ağırlıklı Net', value: gradingResult.weightedNet.toFixed(2), color: 'primary' },
            ].map((stat, i) => (
              <div 
                key={stat.label} 
                className={cn(
                  "text-center p-3 rounded-xl transition-transform hover:scale-105 animate-fade-in",
                  stat.color === 'green' && 'bg-green-500/10 dark:bg-green-500/20',
                  stat.color === 'red' && 'bg-red-500/10 dark:bg-red-500/20',
                  stat.color === 'gray' && 'bg-muted/50',
                  stat.color === 'primary' && 'bg-primary/10 dark:bg-primary/20',
                )}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <p className={cn(
                  "text-xl font-bold",
                  stat.color === 'green' && 'text-green-600 dark:text-green-400',
                  stat.color === 'red' && 'text-red-600 dark:text-red-400',
                  stat.color === 'gray' && 'text-muted-foreground',
                  stat.color === 'primary' && 'text-primary',
                )}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Per-subject breakdown */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Ders Bazlı Analiz</p>
            <div className="grid gap-2">
              {LGS_SUBJECTS.map((subject, i) => {
                const s = gradingResult.subjects[subject.key];
                if (!s) return null;
                const percentage = s.net / subject.count * 100;
                return (
                  <div 
                    key={subject.key} 
                    className="relative flex items-center gap-3 p-3 rounded-xl bg-muted/30 dark:bg-muted/10 overflow-hidden animate-fade-in"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {/* Progress bar background */}
                    <div 
                      className="absolute inset-y-0 left-0 bg-primary/5 dark:bg-primary/10 transition-all duration-1000 ease-out"
                      style={{ width: `${Math.max(0, percentage)}%` }}
                    />
                    <span className="text-sm font-medium w-28 shrink-0 relative z-10">{subject.label}</span>
                    <span className="text-xs text-green-600 dark:text-green-400 relative z-10">D:{s.correct}</span>
                    <span className="text-xs text-red-600 dark:text-red-400 relative z-10">Y:{s.wrong}</span>
                    <span className="text-xs text-muted-foreground relative z-10">B:{s.blank}</span>
                    <span className="text-xs font-bold text-primary ml-auto relative z-10">Net: {s.net.toFixed(2)} (×{subject.coefficient})</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed answer grid */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
            {gradingResult.answers.map((a, i) => (
              <div
                key={a.question}
                className={cn(
                  "text-center p-1 rounded-lg text-xs font-medium transition-all hover:scale-110 animate-fade-in",
                  a.status === 'correct' && 'bg-green-500/10 text-green-600 dark:text-green-400',
                  a.status === 'wrong' && 'bg-red-500/10 text-red-600 dark:text-red-400',
                  a.status === 'blank' && 'bg-muted text-muted-foreground',
                )}
                style={{ animationDelay: `${i * 10}ms` }}
              >
                <div className="text-[9px] opacity-60">{a.question}</div>
                <div>{a.selected}</div>
              </div>
            ))}
          </div>

          <Button 
            onClick={saveResult} 
            variant="apple" 
            className="w-full gap-2 h-12 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]" 
            disabled={isSaving || !selectedExamId || !matchedStudent}
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Kaydediliyor...</>
            ) : (
              <><Save className="w-4 h-4" /> Sonucu Kaydet ({matchedStudent?.name || 'Öğrenci seçilmedi'})</>
            )}
          </Button>
        </Card>
      )}
    </div>
  );
};
