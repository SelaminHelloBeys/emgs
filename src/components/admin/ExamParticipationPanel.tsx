import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTrialExams, StudentParticipation } from '@/hooks/useTrialExams';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, FileSpreadsheet, Search, Calculator } from 'lucide-react';

interface StudentProfile {
  user_id: string;
  name: string;
  school_name: string | null;
  class: string | null;
}

const LGS_SUBJECTS = [
  { key: 'turkce', label: 'Türkçe', count: 20, coefficient: 4 },
  { key: 'matematik', label: 'Matematik', count: 20, coefficient: 4 },
  { key: 'fen', label: 'Fen', count: 20, coefficient: 4 },
  { key: 'inkilap', label: 'İnkılap', count: 10, coefficient: 1 },
  { key: 'din', label: 'Din', count: 10, coefficient: 1 },
  { key: 'ingilizce', label: 'İngilizce', count: 10, coefficient: 1 },
] as const;

const calcSubjectNet = (correct: number, wrong: number) => correct - (wrong / 3);

const calcLGSFromSubjects = (subjects: Record<string, { correct: number; wrong: number; blank: number }>) => {
  let weightedNet = 0;
  let totalCorrect = 0, totalWrong = 0, totalBlank = 0;

  for (const sub of LGS_SUBJECTS) {
    const s = subjects[sub.key] || { correct: 0, wrong: 0, blank: 0 };
    const net = calcSubjectNet(s.correct, s.wrong);
    weightedNet += net * sub.coefficient;
    totalCorrect += s.correct;
    totalWrong += s.wrong;
    totalBlank += s.blank;
  }

  const totalNet = totalCorrect - (totalWrong / 3);
  const lgsPuan = Math.max(0, (weightedNet / 270) * 500);

  return { totalCorrect, totalWrong, totalBlank, totalNet, weightedNet, lgsPuan };
};

export const ExamParticipationPanel: React.FC = () => {
  const { exams, isLoading: examsLoading, getAllParticipations, updateParticipation, bulkImportParticipations } = useTrialExams();
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [participations, setParticipations] = useState<StudentParticipation[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [subjectForm, setSubjectForm] = useState<Record<string, { correct: number; wrong: number; blank: number }>>({});
  const [rankForm, setRankForm] = useState({ class_rank: 0, general_rank: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      const { data } = await supabase.from('profiles').select('user_id, name, school_name, class');
      setStudents(data || []);
      setIsLoadingStudents(false);
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedExamId) loadParticipations();
  }, [selectedExamId]);

  const loadParticipations = async () => {
    if (!selectedExamId) return;
    const data = await getAllParticipations(selectedExamId);
    setParticipations(data);
  };

  const getParticipation = (userId: string) => participations.find(p => p.user_id === userId);

  const handleToggleParticipation = async (userId: string, participated: boolean) => {
    if (!selectedExamId) return;
    await updateParticipation(selectedExamId, userId, { participated });
    await loadParticipations();
  };

  const handleEditStudent = (userId: string) => {
    const p = getParticipation(userId);
    const subjectScores = (p as any)?.subject_scores as Record<string, { correct: number; wrong: number; blank: number }> | null;

    const form: Record<string, { correct: number; wrong: number; blank: number }> = {};
    for (const sub of LGS_SUBJECTS) {
      form[sub.key] = subjectScores?.[sub.key] || { correct: 0, wrong: 0, blank: 0 };
    }
    setSubjectForm(form);
    setRankForm({ class_rank: p?.class_rank || 0, general_rank: p?.general_rank || 0 });
    setEditingStudent(userId);
  };

  const handleSaveAnalysis = async () => {
    if (!selectedExamId || !editingStudent) return;
    
    const calc = calcLGSFromSubjects(subjectForm);

    await updateParticipation(selectedExamId, editingStudent, {
      participated: true,
      correct_count: calc.totalCorrect,
      wrong_count: calc.totalWrong,
      blank_count: calc.totalBlank,
      net_score: parseFloat(calc.totalNet.toFixed(2)),
      class_rank: rankForm.class_rank || undefined,
      general_rank: rankForm.general_rank || undefined,
    });

    // Save subject_scores as separate update
    await supabase
      .from('student_exam_participation')
      .update({ subject_scores: subjectForm as any })
      .eq('exam_id', selectedExamId)
      .eq('user_id', editingStudent);

    setEditingStudent(null);
    await loadParticipations();
  };

  const handleAutoRank = async () => {
    if (!selectedExamId) return;
    const participated = participations.filter(p => p.participated);
    if (participated.length === 0) {
      toast.error('Sıralamak için katılımcı yok');
      return;
    }

    const sorted = [...participated].sort((a, b) => {
      if (b.net_score !== a.net_score) return b.net_score - a.net_score;
      return (b.correct_count || 0) - (a.correct_count || 0);
    });

    const classGroups: Record<string, typeof sorted> = {};
    sorted.forEach(p => {
      const cls = p.profile?.class || 'unknown';
      if (!classGroups[cls]) classGroups[cls] = [];
      classGroups[cls].push(p);
    });

    const updates = sorted.map((p, idx) => {
      const cls = p.profile?.class || 'unknown';
      const classRank = classGroups[cls].indexOf(p) + 1;
      return {
        user_id: p.user_id,
        participated: true,
        correct_count: p.correct_count || 0,
        wrong_count: p.wrong_count || 0,
        blank_count: p.blank_count || 0,
        net_score: p.net_score,
        general_rank: idx + 1,
        class_rank: classRank,
      };
    });

    await bulkImportParticipations(selectedExamId, updates);
    await loadParticipations();
    toast.success('Sıralama otomatik güncellendi!');
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedExamId) return;
    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) { toast.error('Dosya en az 2 satır içermelidir'); return; }

    const header = lines[0].split(/[,;\t]/).map(h => h.trim().toLowerCase());
    const nameIdx = header.findIndex(h => h.includes('isim') || h.includes('ad') || h.includes('name'));
    const correctIdx = header.findIndex(h => h.includes('doğru') || h.includes('correct'));
    const wrongIdx = header.findIndex(h => h.includes('yanlış') || h.includes('wrong'));
    const blankIdx = header.findIndex(h => h.includes('boş') || h.includes('blank'));

    if (nameIdx === -1) { toast.error('Dosyada "isim" sütunu bulunamadı'); return; }

    const importData: Array<any> = [];
    let matched = 0, unmatched = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(/[,;\t]/).map(c => c.trim());
      const studentName = cols[nameIdx];
      const student = students.find(s =>
        s.name.toLowerCase().includes(studentName.toLowerCase()) ||
        studentName.toLowerCase().includes(s.name.toLowerCase())
      );
      if (student) {
        const correct = correctIdx >= 0 ? parseInt(cols[correctIdx]) || 0 : 0;
        const wrong = wrongIdx >= 0 ? parseInt(cols[wrongIdx]) || 0 : 0;
        const blank = blankIdx >= 0 ? parseInt(cols[blankIdx]) || 0 : 0;
        const net = calcSubjectNet(correct, wrong);
        importData.push({
          user_id: student.user_id, participated: true,
          correct_count: correct, wrong_count: wrong, blank_count: blank,
          net_score: parseFloat(net.toFixed(2)),
        });
        matched++;
      } else { unmatched++; }
    }

    if (importData.length > 0) {
      await bulkImportParticipations(selectedExamId, importData);
      await loadParticipations();
      toast.success(`${matched} öğrenci eşleştirildi${unmatched > 0 ? `, ${unmatched} eşleşmedi` : ''}`);
    } else { toast.error('Hiçbir öğrenci eşleştirilemedi'); }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.class || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calcDisplay = calcLGSFromSubjects(subjectForm);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Öğrenci Katılım Yönetimi</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label>Deneme Seç</Label>
          <Select value={selectedExamId} onValueChange={setSelectedExamId}>
            <SelectTrigger><SelectValue placeholder="Bir deneme seçin" /></SelectTrigger>
            <SelectContent>
              {exams.map(exam => (
                <SelectItem key={exam.id} value={exam.id}>{exam.title} ({exam.grade}. Sınıf)</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedExamId && (
          <div className="flex items-end gap-2">
            <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileImport} />
            <Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
              <FileSpreadsheet className="w-4 h-4" /> CSV İçe Aktar
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleAutoRank}>
              <Calculator className="w-4 h-4" /> Otomatik Sırala
            </Button>
          </div>
        )}
      </div>

      {selectedExamId && (
        <>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Öğrenci ara..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-auto max-h-[500px]">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left p-3 font-medium">Öğrenci</th>
                      <th className="text-left p-3 font-medium">Sınıf</th>
                      <th className="text-center p-3 font-medium">Girdi</th>
                      <th className="text-center p-3 font-medium">D/Y/B</th>
                      <th className="text-center p-3 font-medium">Net</th>
                      <th className="text-center p-3 font-medium">LGS Puan</th>
                      <th className="text-center p-3 font-medium">Sıra</th>
                      <th className="text-center p-3 font-medium">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingStudents ? (
                      <tr><td colSpan={8} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">Öğrenci bulunamadı</td></tr>
                    ) : (
                      filteredStudents.map(student => {
                        const p = getParticipation(student.user_id);
                        // Calculate LGS puan from subject_scores if available, otherwise from totals
                        const subScores = (p as any)?.subject_scores as Record<string, { correct: number; wrong: number; blank: number }> | null;
                        let lgsPuan = 0;
                        if (p?.participated) {
                          if (subScores) {
                            lgsPuan = calcLGSFromSubjects(subScores).lgsPuan;
                          } else {
                            lgsPuan = Math.max(0, (p.net_score / 90) * 500);
                          }
                        }

                        return (
                          <tr key={student.user_id} className="border-t hover:bg-muted/30">
                            <td className="p-3 font-medium">{student.name}</td>
                            <td className="p-3 text-muted-foreground">{student.class || '-'}</td>
                            <td className="p-3 text-center">
                              <Switch checked={p?.participated || false} onCheckedChange={(checked) => handleToggleParticipation(student.user_id, checked)} />
                            </td>
                            <td className="p-3 text-center">
                              {p?.participated ? `${p.correct_count}/${p.wrong_count}/${p.blank_count}` : '-'}
                            </td>
                            <td className="p-3 text-center font-medium">
                              {p?.participated ? p.net_score.toFixed(2) : '-'}
                            </td>
                            <td className="p-3 text-center font-medium text-primary">
                              {p?.participated ? lgsPuan.toFixed(1) : '-'}
                            </td>
                            <td className="p-3 text-center text-xs">
                              {p?.participated && p.class_rank ? (
                                <span>Şube: {p.class_rank} / Genel: {p.general_rank || '-'}</span>
                              ) : '-'}
                            </td>
                            <td className="p-3 text-center">
                              <Button variant="ghost" size="sm" onClick={() => handleEditStudent(student.user_id)}>Düzenle</Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Edit Dialog - Per Subject */}
      <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ders Bazlı Analiz Gir (LGS)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2 max-h-[60vh] overflow-y-auto">
            <p className="text-xs text-muted-foreground">
              Her ders için Doğru/Yanlış/Boş girin. Net ve LGS puanı otomatik hesaplanır.
              Türkçe, Matematik ve Fen x4 katsayılıdır.
            </p>

            {LGS_SUBJECTS.map(subject => {
              const s = subjectForm[subject.key] || { correct: 0, wrong: 0, blank: 0 };
              const net = calcSubjectNet(s.correct, s.wrong);
              return (
                <div key={subject.key} className="p-3 rounded-lg bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{subject.label} ({subject.count} soru, x{subject.coefficient})</span>
                    <span className="text-xs font-bold text-primary">Net: {net.toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Doğru</Label>
                      <Input
                        type="number" min={0} max={subject.count}
                        value={s.correct}
                        onChange={e => {
                          const v = Math.min(parseInt(e.target.value) || 0, subject.count);
                          setSubjectForm(prev => ({ ...prev, [subject.key]: { ...prev[subject.key], correct: v } }));
                        }}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Yanlış</Label>
                      <Input
                        type="number" min={0} max={subject.count}
                        value={s.wrong}
                        onChange={e => {
                          const v = Math.min(parseInt(e.target.value) || 0, subject.count);
                          setSubjectForm(prev => ({ ...prev, [subject.key]: { ...prev[subject.key], wrong: v } }));
                        }}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Boş</Label>
                      <Input
                        type="number" min={0} max={subject.count}
                        value={s.blank}
                        onChange={e => {
                          const v = Math.min(parseInt(e.target.value) || 0, subject.count);
                          setSubjectForm(prev => ({ ...prev, [subject.key]: { ...prev[subject.key], blank: v } }));
                        }}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Summary */}
            <div className="p-3 rounded-lg bg-primary/10 dark:bg-primary/20 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Toplam D/Y/B:</span>
                <span className="font-medium">{calcDisplay.totalCorrect}/{calcDisplay.totalWrong}/{calcDisplay.totalBlank}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Toplam Net:</span>
                <span className="font-medium">{calcDisplay.totalNet.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Ağırlıklı Net:</span>
                <span className="font-medium">{calcDisplay.weightedNet.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>LGS Puan:</span>
                <span className="text-primary">{calcDisplay.lgsPuan.toFixed(1)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Şube Sıralaması</Label>
                <Input type="number" min={0} value={rankForm.class_rank} onChange={e => setRankForm(prev => ({ ...prev, class_rank: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>Genel Sıralama</Label>
                <Input type="number" min={0} value={rankForm.general_rank} onChange={e => setRankForm(prev => ({ ...prev, general_rank: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            
            <Button variant="apple" className="w-full" onClick={handleSaveAnalysis}>
              Kaydet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
