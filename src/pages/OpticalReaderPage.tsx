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
  const [ocrProgress, setOcrProgress] = useState(0);

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
      // Set cameraActive first, then useEffect will attach stream to video
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

      // Try to extract name from "Ad" or "İsim" field
      const nameMatch = text.match(/(?:ad[ıi]?\s*(?:soyad[ıi]?)?|isim|name)\s*:?\s*([A-Za-zÇçĞğİıÖöŞşÜü\s]{3,40})/i);
      const detectedName = nameMatch ? nameMatch[1].trim() : '';

      // Try to extract answers
      const answers: Record<number, string> = {};
      const answerPattern = /(\d{1,2})\s*[-.)]\s*([A-Da-d])/g;
      let match;
      while ((match = answerPattern.exec(text)) !== null) {
        const qNum = parseInt(match[1]);
        const answer = match[2].toUpperCase();
        if (qNum >= 1 && qNum <= TOTAL_QUESTIONS) {
          answers[qNum] = answer;
        }
      }

      // Bubble-style fallback
      if (Object.keys(answers).length === 0) {
        const lines = text.split('\n').filter(l => l.trim());
        let qCounter = 1;
        for (const line of lines) {
          const bubbleMatch = line.trim().match(/^[A-Da-d]$/);
          if (bubbleMatch && qCounter <= TOTAL_QUESTIONS) {
            answers[qCounter] = bubbleMatch[0].toUpperCase();
            qCounter++;
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
    // LGS Puan = (Ağırlıklı Net / 270) × 500
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
      const subjectScoresJson = gradingResult.subjects;

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
          subject_scores: subjectScoresJson as any,
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
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Optik Okuyucu</h1>
            <p className="text-muted-foreground">LGS optik formlarını tarayın ve otomatik notlandırın (90 soru)</p>
          </div>
        </div>
      </div>

      {/* Step 1: Configuration */}
      <Card className="p-6 border-0 bg-card/80 dark:bg-card/50 backdrop-blur-sm space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">1</span>
          Sınav Seçimi
        </h3>
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
      </Card>

      {/* Step 2: LGS Answer Key by Subject */}
      <Card className="p-6 border-0 bg-card/80 dark:bg-card/50 backdrop-blur-sm space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">2</span>
          Cevap Anahtarı (LGS - 90 Soru)
        </h3>
        
        {LGS_SUBJECTS.map(subject => (
          <div key={subject.key} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{subject.label}</span>
              <span className="text-xs text-muted-foreground">({subject.count} soru, x{subject.coefficient} katsayı)</span>
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
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
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
                  <><Loader2 className="w-4 h-4 animate-spin" /> İşleniyor... %{ocrProgress}</>
                ) : (
                  <><Eye className="w-4 h-4" /> OCR ile Tara</>
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

      {/* Step 4: Results & Student Match */}
      {scanResult && (
        <Card className="p-6 border-0 bg-card/80 dark:bg-card/50 backdrop-blur-sm space-y-4 animate-slide-up">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">4</span>
            Sonuçları Doğrula
          </h3>

          {/* Detected name & matched student */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tespit Edilen İsim (OCR)</label>
              <Input value={scanResult.detectedName || '(tespit edilemedi)'} readOnly className="bg-muted" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Eşleşen Öğrenci</label>
              <Select
                value={matchedStudent?.user_id || ''}
                onValueChange={v => {
                  const p = allProfiles.find(p => p.user_id === v);
                  setMatchedStudent(p || null);
                }}
              >
                <SelectTrigger className={matchedStudent ? 'border-green-500' : 'border-destructive'}>
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
                          <SelectTrigger className={cn("h-7 text-xs px-1", answer ? 'border-primary' : 'border-muted')}>
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

          {/* LGS Total Score */}
          <div className="text-center p-4 rounded-2xl bg-primary/10 dark:bg-primary/20">
            <p className="text-4xl font-bold text-primary">{gradingResult.lgsPuan.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">LGS Puan (500 üzerinden)</p>
          </div>

          {/* Overall stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 rounded-xl bg-green-500/10 dark:bg-green-500/20">
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{gradingResult.totalCorrect}</p>
              <p className="text-xs text-muted-foreground">Doğru</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-red-500/10 dark:bg-red-500/20">
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{gradingResult.totalWrong}</p>
              <p className="text-xs text-muted-foreground">Yanlış</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <p className="text-xl font-bold text-muted-foreground">{gradingResult.totalBlank}</p>
              <p className="text-xs text-muted-foreground">Boş</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-primary/10 dark:bg-primary/20">
              <p className="text-xl font-bold text-primary">{gradingResult.weightedNet.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Ağırlıklı Net</p>
            </div>
          </div>

          {/* Per-subject breakdown */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Ders Bazlı Analiz</p>
            <div className="grid gap-2">
              {LGS_SUBJECTS.map(subject => {
                const s = gradingResult.subjects[subject.key];
                if (!s) return null;
                return (
                  <div key={subject.key} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 dark:bg-muted/10">
                    <span className="text-sm font-medium w-28 shrink-0">{subject.label}</span>
                    <span className="text-xs text-green-600">D:{s.correct}</span>
                    <span className="text-xs text-red-600">Y:{s.wrong}</span>
                    <span className="text-xs text-muted-foreground">B:{s.blank}</span>
                    <span className="text-xs font-bold text-primary ml-auto">Net: {s.net.toFixed(2)} (×{subject.coefficient})</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed answer grid */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
            {gradingResult.answers.map(a => (
              <div
                key={a.question}
                className={cn(
                  "text-center p-1 rounded-md text-xs font-medium",
                  a.status === 'correct' && 'bg-green-500/10 text-green-600 dark:text-green-400',
                  a.status === 'wrong' && 'bg-red-500/10 text-red-600 dark:text-red-400',
                  a.status === 'blank' && 'bg-muted text-muted-foreground',
                )}
              >
                <div className="text-[9px] opacity-60">{a.question}</div>
                <div>{a.selected}</div>
              </div>
            ))}
          </div>

          <Button onClick={saveResult} variant="apple" className="w-full gap-2" disabled={isSaving || !selectedExamId || !matchedStudent}>
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
