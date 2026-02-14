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

// LGS Scoring: Net = D - Y/3, Puan = Net/90 * 500
const calcNet = (correct: number, wrong: number) => correct - (wrong / 3);
const calcLGSPuan = (net: number) => (net / 90) * 500;

export const ExamParticipationPanel: React.FC = () => {
  const { exams, isLoading: examsLoading, getAllParticipations, updateParticipation, bulkImportParticipations } = useTrialExams();
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [participations, setParticipations] = useState<StudentParticipation[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    correct_count: 0,
    wrong_count: 0,
    blank_count: 0,
    net_score: 0,
    lgs_puan: 0,
    class_rank: 0,
    general_rank: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      const { data } = await supabase
        .from('profiles')
        .select('user_id, name, school_name, class');
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
    const correct = p?.correct_count || 0;
    const wrong = p?.wrong_count || 0;
    const net = calcNet(correct, wrong);
    setFormData({
      correct_count: correct,
      wrong_count: wrong,
      blank_count: p?.blank_count || 0,
      net_score: p?.net_score || parseFloat(net.toFixed(2)),
      lgs_puan: parseFloat(calcLGSPuan(p?.net_score || net).toFixed(2)),
      class_rank: p?.class_rank || 0,
      general_rank: p?.general_rank || 0,
    });
    setEditingStudent(userId);
  };

  const updateFormWithAutoCalc = (correct: number, wrong: number, blank: number) => {
    const net = calcNet(correct, wrong);
    const puan = calcLGSPuan(net);
    setFormData(prev => ({
      ...prev,
      correct_count: correct,
      wrong_count: wrong,
      blank_count: blank,
      net_score: parseFloat(net.toFixed(2)),
      lgs_puan: parseFloat(Math.max(0, puan).toFixed(2)),
    }));
  };

  const handleSaveAnalysis = async () => {
    if (!selectedExamId || !editingStudent) return;
    await updateParticipation(selectedExamId, editingStudent, {
      participated: true,
      correct_count: formData.correct_count,
      wrong_count: formData.wrong_count,
      blank_count: formData.blank_count,
      net_score: formData.net_score,
      class_rank: formData.class_rank || undefined,
      general_rank: formData.general_rank || undefined,
    });
    setEditingStudent(null);
    await loadParticipations();
  };

  // Auto-rank by net score, tiebreaker: net count
  const handleAutoRank = async () => {
    if (!selectedExamId) return;
    
    const participated = participations.filter(p => p.participated);
    if (participated.length === 0) {
      toast.error('Sıralamak için katılımcı yok');
      return;
    }

    // Sort by net_score DESC
    const sorted = [...participated].sort((a, b) => {
      if (b.net_score !== a.net_score) return b.net_score - a.net_score;
      // Tiebreaker: higher correct count wins
      return (b.correct_count || 0) - (a.correct_count || 0);
    });

    // Group by class for class ranking
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

  // CSV Import
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedExamId) return;

    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim());
    
    if (lines.length < 2) {
      toast.error('Dosya en az 2 satır içermelidir (başlık + veri)');
      return;
    }

    const header = lines[0].split(/[,;\t]/).map(h => h.trim().toLowerCase());
    const nameIdx = header.findIndex(h => h.includes('isim') || h.includes('ad') || h.includes('name'));
    const correctIdx = header.findIndex(h => h.includes('doğru') || h.includes('dogru') || h.includes('correct'));
    const wrongIdx = header.findIndex(h => h.includes('yanlış') || h.includes('yanlis') || h.includes('wrong'));
    const blankIdx = header.findIndex(h => h.includes('boş') || h.includes('bos') || h.includes('blank'));

    if (nameIdx === -1) {
      toast.error('Dosyada "isim" veya "ad" sütunu bulunamadı');
      return;
    }

    const importData: Array<{
      user_id: string;
      participated: boolean;
      correct_count: number;
      wrong_count: number;
      blank_count: number;
      net_score: number;
    }> = [];

    let matched = 0;
    let unmatched = 0;

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
        const net = calcNet(correct, wrong);

        importData.push({
          user_id: student.user_id,
          participated: true,
          correct_count: correct,
          wrong_count: wrong,
          blank_count: blank,
          net_score: parseFloat(net.toFixed(2)),
        });
        matched++;
      } else {
        unmatched++;
      }
    }

    if (importData.length > 0) {
      await bulkImportParticipations(selectedExamId, importData);
      await loadParticipations();
      toast.success(`${matched} öğrenci eşleştirildi${unmatched > 0 ? `, ${unmatched} eşleşmedi` : ''}`);
    } else {
      toast.error('Hiçbir öğrenci eşleştirilemedi');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.class || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Öğrenci Katılım Yönetimi</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label>Deneme Seç</Label>
          <Select value={selectedExamId} onValueChange={setSelectedExamId}>
            <SelectTrigger>
              <SelectValue placeholder="Bir deneme seçin" />
            </SelectTrigger>
            <SelectContent>
              {exams.map(exam => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.title} ({exam.grade}. Sınıf)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedExamId && (
          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={handleFileImport}
            />
            <Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
              <FileSpreadsheet className="w-4 h-4" />
              CSV İçe Aktar
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleAutoRank}>
              <Calculator className="w-4 h-4" />
              Otomatik Sırala
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
                        const lgsPuan = p?.participated ? calcLGSPuan(p.net_score) : 0;
                        return (
                          <tr key={student.user_id} className="border-t hover:bg-muted/30">
                            <td className="p-3 font-medium">{student.name}</td>
                            <td className="p-3 text-muted-foreground">{student.class || '-'}</td>
                            <td className="p-3 text-center">
                              <Switch
                                checked={p?.participated || false}
                                onCheckedChange={(checked) => handleToggleParticipation(student.user_id, checked)}
                              />
                            </td>
                            <td className="p-3 text-center">
                              {p?.participated ? `${p.correct_count}/${p.wrong_count}/${p.blank_count}` : '-'}
                            </td>
                            <td className="p-3 text-center font-medium">
                              {p?.participated ? p.net_score.toFixed(2) : '-'}
                            </td>
                            <td className="p-3 text-center font-medium text-primary">
                              {p?.participated ? Math.max(0, lgsPuan).toFixed(1) : '-'}
                            </td>
                            <td className="p-3 text-center text-xs">
                              {p?.participated && p.class_rank ? (
                                <span>Şube: {p.class_rank} / Genel: {p.general_rank || '-'}</span>
                              ) : '-'}
                            </td>
                            <td className="p-3 text-center">
                              <Button variant="ghost" size="sm" onClick={() => handleEditStudent(student.user_id)}>
                                Düzenle
                              </Button>
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

      {/* Edit Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Analiz Verisi Gir (LGS Hesaplaması)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Net = Doğru - (Yanlış / 3) | LGS Puan = (Net / 90) × 500
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Doğru</Label>
                <Input
                  type="number"
                  min={0}
                  max={90}
                  value={formData.correct_count}
                  onChange={(e) => {
                    const correct = parseInt(e.target.value) || 0;
                    updateFormWithAutoCalc(correct, formData.wrong_count, formData.blank_count);
                  }}
                />
              </div>
              <div>
                <Label>Yanlış</Label>
                <Input
                  type="number"
                  min={0}
                  max={90}
                  value={formData.wrong_count}
                  onChange={(e) => {
                    const wrong = parseInt(e.target.value) || 0;
                    updateFormWithAutoCalc(formData.correct_count, wrong, formData.blank_count);
                  }}
                />
              </div>
              <div>
                <Label>Boş</Label>
                <Input
                  type="number"
                  min={0}
                  max={90}
                  value={formData.blank_count}
                  onChange={(e) => {
                    const blank = parseInt(e.target.value) || 0;
                    updateFormWithAutoCalc(formData.correct_count, formData.wrong_count, blank);
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Net Puan</Label>
                <Input type="number" step="0.01" value={formData.net_score} readOnly className="bg-muted" />
              </div>
              <div>
                <Label>LGS Puan (500'lük)</Label>
                <Input type="number" value={formData.lgs_puan} readOnly className="bg-muted font-bold text-primary" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Şube Sıralaması</Label>
                <Input type="number" min={0} value={formData.class_rank} onChange={(e) => setFormData(prev => ({ ...prev, class_rank: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>Genel Sıralama</Label>
                <Input type="number" min={0} value={formData.general_rank} onChange={(e) => setFormData(prev => ({ ...prev, general_rank: parseInt(e.target.value) || 0 }))} />
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
