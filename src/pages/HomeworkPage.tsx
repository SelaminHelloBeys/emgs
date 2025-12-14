import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { useHomework } from '@/hooks/useHomework';
import {
  Clock,
  CheckCircle,
  Upload,
  AlertCircle,
  FileText,
  Calendar as CalendarIcon,
  Plus,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { tr } from 'date-fns/locale';

const subjects = [
  'Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 'Edebiyat',
  'Tarih', 'Coğrafya', 'İngilizce', 'Almanca', 'Felsefe', 'Din Kültürü'
];

const grades = ['5', '6', '7', '8'];
const classSections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'J'];

const statusConfig = {
  pending: { label: 'Bekliyor', color: 'text-apple-orange bg-apple-orange/10', icon: Clock },
  submitted: { label: 'Teslim Edildi', color: 'text-apple-green bg-apple-green/10', icon: CheckCircle },
  graded: { label: 'Notlandırıldı', color: 'text-apple-blue bg-apple-blue/10', icon: CheckCircle },
  late: { label: 'Geç', color: 'text-apple-red bg-apple-red/10', icon: AlertCircle },
};

export const HomeworkPage: React.FC = () => {
  const { canCreateContent, profile } = useAuth();
  const { homework, isLoading, createHomework, submitHomework } = useHomework();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [classSection, setClassSection] = useState('');
  const [dueDate, setDueDate] = useState<Date>();

  const pendingHomework = homework.filter(h => !h.submission);
  const completedHomework = homework.filter(h => h.submission);

  const handleCreate = async () => {
    if (!title || !subject || !grade || !dueDate) return;
    
    setIsSubmitting(true);
    await createHomework(title, description, subject, grade, classSection || null, dueDate);
    setIsSubmitting(false);
    
    setTitle('');
    setDescription('');
    setSubject('');
    setGrade('');
    setClassSection('');
    setDueDate(undefined);
    setIsDialogOpen(false);
  };

  const handleSubmit = async (homeworkId: string) => {
    setIsSubmitting(true);
    await submitHomework(homeworkId);
    setIsSubmitting(false);
    setDetailsDialogOpen(false);
  };

  const getStatus = (hw: any) => {
    if (hw.submission) {
      return hw.submission.status === 'graded' ? 'graded' : 'submitted';
    }
    return isPast(new Date(hw.due_date)) ? 'late' : 'pending';
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return 'Süresi doldu';
    if (diffHours < 24) return `Bugün ${format(date, 'HH:mm')}`;
    if (diffHours < 48) return `Yarın ${format(date, 'HH:mm')}`;
    return format(date, 'd MMMM', { locale: tr });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold mb-2">Ödevler</h1>
          <p className="text-muted-foreground">Ödev takibi ve teslim sistemi</p>
        </div>
        
        {canCreateContent && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="apple" className="gap-2">
                <Plus className="w-4 h-4" />
                Ödev Oluştur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Yeni Ödev</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Başlık</label>
                  <Input
                    placeholder="Ödev başlığı"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Açıklama</label>
                  <Textarea
                    placeholder="Ödev açıklaması..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Ders</label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Ders seçin" />
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Şube (Opsiyonel)</label>
                    <Select value={classSection} onValueChange={setClassSection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tümü" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tümü</SelectItem>
                        {classSections.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Son Teslim</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {dueDate ? format(dueDate, 'd MMM', { locale: tr }) : 'Tarih seçin'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <Button
                  variant="apple"
                  className="w-full"
                  onClick={handleCreate}
                  disabled={!title || !subject || !grade || !dueDate || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    'Ödev Oluştur'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : homework.length === 0 ? (
        <Card variant="elevated" className="p-12 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Henüz ödev yok</h3>
          <p className="text-muted-foreground">
            {canCreateContent ? 'İlk ödevi oluşturmak için yukarıdaki butonu kullanın.' : 'Ödevler burada görünecek.'}
          </p>
        </Card>
      ) : (
        <>
          {/* Pending Homework */}
          {pendingHomework.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-apple-orange" />
                Bekleyen Ödevler ({pendingHomework.length})
              </h2>
              <div className="space-y-4">
                {pendingHomework.map((hw) => {
                  const status = getStatus(hw);
                  const config = statusConfig[status as keyof typeof statusConfig];
                  const StatusIcon = config.icon;
                  
                  return (
                    <Card key={hw.id} variant="elevated" className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                              {hw.subject}
                            </span>
                            <span className={cn(
                              "text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1",
                              config.color
                            )}>
                              <StatusIcon className="w-3 h-3" />
                              {formatDueDate(hw.due_date)}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold">{hw.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{hw.creator_name}</p>
                        </div>
                      </div>

                      {hw.description && (
                        <p className="text-muted-foreground mb-4">{hw.description}</p>
                      )}

                      <div className="flex gap-3">
                        <Button 
                          variant="apple" 
                          className="gap-2"
                          onClick={() => handleSubmit(hw.id)}
                          disabled={isSubmitting}
                        >
                          <Upload className="w-4 h-4" />
                          Teslim Et
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setSelectedHomework(hw);
                            setDetailsDialogOpen(true);
                          }}
                        >
                          Detaylar
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Homework */}
          {completedHomework.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-apple-green" />
                Tamamlanan Ödevler
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {completedHomework.map((hw) => {
                  const status = getStatus(hw);
                  const config = statusConfig[status as keyof typeof statusConfig];
                  const StatusIcon = config.icon;
                  
                  return (
                    <Card key={hw.id} variant="default" className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          {hw.subject}
                        </span>
                        <span className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1",
                          config.color
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-1">{hw.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{hw.creator_name}</p>
                      {hw.submission?.grade && (
                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                          <span className="text-sm text-muted-foreground">Not</span>
                          <span className={cn(
                            "text-lg font-bold",
                            hw.submission.grade >= 70 ? "text-apple-green" : "text-apple-orange"
                          )}>
                            {hw.submission.grade}
                          </span>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedHomework?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ders</p>
              <p>{selectedHomework?.subject}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Öğretmen</p>
              <p>{selectedHomework?.creator_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Son Teslim Tarihi</p>
              <p>{selectedHomework?.due_date && format(new Date(selectedHomework.due_date), 'd MMMM yyyy HH:mm', { locale: tr })}</p>
            </div>
            {selectedHomework?.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Açıklama</p>
                <p>{selectedHomework.description}</p>
              </div>
            )}
            {!selectedHomework?.submission && (
              <Button
                variant="apple"
                className="w-full gap-2"
                onClick={() => handleSubmit(selectedHomework?.id)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Teslim Et
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
