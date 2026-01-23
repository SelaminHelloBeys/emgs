import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { useTrialExams } from '@/hooks/useTrialExams';
import { FileText, Calendar, Plus, Loader2, Upload, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const grades = ['5', '6', '7', '8'];

export const DenemelerPage: React.FC = () => {
  const navigate = useNavigate();
  const { canCreateContent, isAdmin } = useAuth();
  const { exams, isLoading, createExam } = useTrialExams();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [grade, setGrade] = useState('');
  const [examDate, setExamDate] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const canCreate = canCreateContent || isAdmin;

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    if (!title || !grade || !examDate || !pdfFile) {
      return;
    }
    
    setIsSubmitting(true);
    await createExam({
      title,
      description,
      grade,
      exam_date: examDate,
      pdf_file: pdfFile,
      cover_image: coverImage || undefined
    });
    setIsSubmitting(false);
    
    // Reset form
    setTitle('');
    setDescription('');
    setGrade('');
    setExamDate('');
    setPdfFile(null);
    setCoverImage(null);
    setCoverPreview(null);
    setIsDialogOpen(false);
  };

  const participatedExams = exams.filter(e => e.participation?.participated);
  const notParticipatedExams = exams.filter(e => !e.participation?.participated);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Denemeler</h1>
          <p className="text-muted-foreground mt-1">Deneme sınavlarını incele ve analiz verilerini gör</p>
        </div>
        
        {canCreate && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="apple" className="gap-2">
                <Plus className="w-4 h-4" />
                Deneme Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Yeni Deneme Ekle</DialogTitle>
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
                
                <div className="grid grid-cols-2 gap-4">
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
                    <label className="text-sm font-medium mb-2 block">Deneme Tarihi</label>
                    <Input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* PDF Upload */}
                <div>
                  <label className="text-sm font-medium mb-2 block">PDF Dosyası</label>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handlePdfSelect}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => pdfInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    {pdfFile ? pdfFile.name : 'PDF Seç'}
                  </Button>
                </div>

                {/* Cover Image Upload */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Kapak Fotoğrafı (Opsiyonel)</label>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <div 
                    className={cn(
                      "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                      "hover:border-primary/50 hover:bg-primary/5",
                      coverPreview ? "border-primary" : "border-muted"
                    )}
                    onClick={() => imageInputRef.current?.click()}
                  >
                    {coverPreview ? (
                      <img 
                        src={coverPreview} 
                        alt="Kapak önizleme" 
                        className="w-full h-32 object-cover rounded"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Image className="w-8 h-8" />
                        <span className="text-sm">Kapak fotoğrafı ekle</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="apple"
                  className="w-full"
                  onClick={handleCreate}
                  disabled={!title || !grade || !examDate || !pdfFile || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Yükleniyor...
                    </>
                  ) : (
                    'Denemeyi Ekle'
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
                <Calendar className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{participatedExams.length}</p>
                <p className="text-sm text-muted-foreground">Girilen Deneme</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {participatedExams.length > 0 
                    ? (participatedExams.reduce((acc, e) => acc + (e.participation?.net_score || 0), 0) / participatedExams.length).toFixed(2)
                    : '0'}
                </p>
                <p className="text-sm text-muted-foreground">Ortalama Net</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exams List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Denemeler</h2>
        
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
                {canCreate ? 'İlk denemeyi eklemek için yukarıdaki butonu kullanın.' : 'Yakında yeni denemeler eklenecek!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {exams.map((exam) => (
              <Card 
                key={exam.id} 
                className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
                onClick={() => navigate(`/denemeler/${exam.id}`)}
              >
                {/* Cover Image */}
                <div className="aspect-[3/4] relative bg-gradient-to-br from-primary/20 to-primary/5">
                  {exam.cover_image_url ? (
                    <img 
                      src={exam.cover_image_url} 
                      alt={exam.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="w-12 h-12 text-primary/30" />
                    </div>
                  )}
                  
                  {/* Participation Badge */}
                  {exam.participation?.participated && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Girdi
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(exam.exam_date), 'd MMMM yyyy', { locale: tr })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {exam.grade}. Sınıf
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
