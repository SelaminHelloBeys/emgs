import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Loader2, Upload, FileSpreadsheet, Users, Search } from 'lucide-react';

interface StudentProfile {
  user_id: string;
  name: string;
  school_name: string | null;
  class: string | null;
}

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
    class_rank: 0,
    general_rank: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all students
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

  // Fetch participations when exam selected
  useEffect(() => {
    if (selectedExamId) {
      loadParticipations();
    }
  }, [selectedExamId]);

  const loadParticipations = async () => {
    if (!selectedExamId) return;
    const data = await getAllParticipations(selectedExamId);
    setParticipations(data);
  };

  const getParticipation = (userId: string) => {
    return participations.find(p => p.user_id === userId);
  };

  const handleToggleParticipation = async (userId: string, participated: boolean) => {
    if (!selectedExamId) return;
    await updateParticipation(selectedExamId, userId, { participated });
    await loadParticipations();
  };

  const handleEditStudent = (userId: string) => {
    const p = getParticipation(userId);
    setFormData({
      correct_count: p?.correct_count || 0,
      wrong_count: p?.wrong_count || 0,
      blank_count: p?.blank_count || 0,
      net_score: p?.net_score || 0,
      class_rank: p?.class_rank || 0,
      general_rank: p?.general_rank || 0,
    });
    setEditingStudent(userId);
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

    // Parse header
    const header = lines[0].split(/[,;\t]/).map(h => h.trim().toLowerCase());
    const nameIdx = header.findIndex(h => h.includes('isim') || h.includes('ad') || h.includes('name'));
    const correctIdx = header.findIndex(h => h.includes('doğru') || h.includes('dogru') || h.includes('correct'));
    const wrongIdx = header.findIndex(h => h.includes('yanlış') || h.includes('yanlis') || h.includes('wrong'));
    const blankIdx = header.findIndex(h => h.includes('boş') || h.includes('bos') || h.includes('blank'));
    const netIdx = header.findIndex(h => h.includes('net'));
    const classRankIdx = header.findIndex(h => h.includes('şube') || h.includes('sube') || h.includes('class_rank'));
    const generalRankIdx = header.findIndex(h => h.includes('genel') || h.includes('general_rank'));

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
      class_rank?: number;
      general_rank?: number;
    }> = [];

    let matched = 0;
    let unmatched = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(/[,;\t]/).map(c => c.trim());
      const studentName = cols[nameIdx];
      
      // Find student by name (case-insensitive fuzzy match)
      const student = students.find(s => 
        s.name.toLowerCase().includes(studentName.toLowerCase()) ||
        studentName.toLowerCase().includes(s.name.toLowerCase())
      );

      if (student) {
        const correct = correctIdx >= 0 ? parseInt(cols[correctIdx]) || 0 : 0;
        const wrong = wrongIdx >= 0 ? parseInt(cols[wrongIdx]) || 0 : 0;
        const blank = blankIdx >= 0 ? parseInt(cols[blankIdx]) || 0 : 0;
        const net = netIdx >= 0 ? parseFloat(cols[netIdx]) || 0 : correct - (wrong * 0.25);

        importData.push({
          user_id: student.user_id,
          participated: true,
          correct_count: correct,
          wrong_count: wrong,
          blank_count: blank,
          net_score: net,
          class_rank: classRankIdx >= 0 ? parseInt(cols[classRankIdx]) || undefined : undefined,
          general_rank: generalRankIdx >= 0 ? parseInt(cols[generalRankIdx]) || undefined : undefined,
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

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.class || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.school_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Öğrenci Katılım Yönetimi</h2>
      </div>

      {/* Exam Selection */}
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
          <>
            <div className="flex items-end">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.xls,.xlsx"
                className="hidden"
                onChange={handleFileImport}
              />
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileSpreadsheet className="w-4 h-4" />
                CSV/Excel İçe Aktar
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Student List */}
      {selectedExamId && (
        <>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Öğrenci ara..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
                      <th className="text-center p-3 font-medium">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingStudents ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-muted-foreground">
                          Öğrenci bulunamadı
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map(student => {
                        const p = getParticipation(student.user_id);
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
                              {p?.participated ? (
                                <span>{p.correct_count}/{p.wrong_count}/{p.blank_count}</span>
                              ) : '-'}
                            </td>
                            <td className="p-3 text-center font-medium">
                              {p?.participated ? p.net_score.toFixed(2) : '-'}
                            </td>
                            <td className="p-3 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditStudent(student.user_id)}
                              >
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
            <DialogTitle>Analiz Verisi Gir</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Doğru</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.correct_count}
                  onChange={(e) => {
                    const correct = parseInt(e.target.value) || 0;
                    setFormData(prev => ({
                      ...prev,
                      correct_count: correct,
                      net_score: correct - (prev.wrong_count * 0.25),
                    }));
                  }}
                />
              </div>
              <div>
                <Label>Yanlış</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.wrong_count}
                  onChange={(e) => {
                    const wrong = parseInt(e.target.value) || 0;
                    setFormData(prev => ({
                      ...prev,
                      wrong_count: wrong,
                      net_score: prev.correct_count - (wrong * 0.25),
                    }));
                  }}
                />
              </div>
              <div>
                <Label>Boş</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.blank_count}
                  onChange={(e) => setFormData(prev => ({ ...prev, blank_count: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div>
              <Label>Net Puan</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.net_score}
                onChange={(e) => setFormData(prev => ({ ...prev, net_score: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Şube Sıralaması</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.class_rank}
                  onChange={(e) => setFormData(prev => ({ ...prev, class_rank: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Genel Sıralama</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.general_rank}
                  onChange={(e) => setFormData(prev => ({ ...prev, general_rank: parseInt(e.target.value) || 0 }))}
                />
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
