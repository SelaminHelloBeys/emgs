import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ClipboardList,
  Clock,
  CheckCircle,
  Upload,
  AlertCircle,
  FileText,
  Video,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Homework {
  id: number;
  title: string;
  subject: string;
  teacher: string;
  dueDate: string;
  description: string;
  attachments: { type: 'pdf' | 'video'; name: string }[];
  status: 'pending' | 'submitted' | 'late';
  grade?: number;
}

const mockHomework: Homework[] = [
  {
    id: 1,
    title: 'Türev Problemleri Çözümü',
    subject: 'Matematik',
    teacher: 'Ahmet Yılmaz',
    dueDate: 'Bugün 23:59',
    description: 'Ders kitabındaki 5.1 ve 5.2 bölümlerindeki soruları çözünüz.',
    attachments: [{ type: 'pdf', name: 'Sorular.pdf' }],
    status: 'pending',
  },
  {
    id: 2,
    title: 'Newton Kanunları Deney Raporu',
    subject: 'Fizik',
    teacher: 'Ayşe Demir',
    dueDate: 'Yarın 18:00',
    description: 'Laboratuvar deneyinin raporunu hazırlayınız.',
    attachments: [{ type: 'pdf', name: 'Deney_Sablonu.pdf' }, { type: 'video', name: 'Deney_Video.mp4' }],
    status: 'pending',
  },
  {
    id: 3,
    title: 'Kimyasal Tepkimeler Araştırması',
    subject: 'Kimya',
    teacher: 'Mehmet Kaya',
    dueDate: '15 Ocak',
    description: 'Ekzotermik ve endotermik tepkimeler hakkında araştırma yapınız.',
    attachments: [],
    status: 'submitted',
    grade: 85,
  },
  {
    id: 4,
    title: 'Osmanlı Dönemi Essay',
    subject: 'Tarih',
    teacher: 'Fatma Özkan',
    dueDate: '10 Ocak',
    description: 'Osmanlı\'nın yükseliş dönemi hakkında 1000 kelimelik essay yazınız.',
    attachments: [],
    status: 'late',
  },
];

const statusConfig = {
  pending: { label: 'Bekliyor', color: 'text-apple-orange bg-apple-orange/10', icon: Clock },
  submitted: { label: 'Teslim Edildi', color: 'text-apple-green bg-apple-green/10', icon: CheckCircle },
  late: { label: 'Geç', color: 'text-apple-red bg-apple-red/10', icon: AlertCircle },
};

export const HomeworkPage: React.FC = () => {
  const pendingHomework = mockHomework.filter(h => h.status === 'pending');
  const completedHomework = mockHomework.filter(h => h.status !== 'pending');

  return (
    <div className="space-y-8">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">Ödevler</h1>
        <p className="text-muted-foreground">Ödev takibi ve teslim sistemi</p>
      </div>

      {/* Pending Homework */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-apple-orange" />
          Bekleyen Ödevler ({pendingHomework.length})
        </h2>
        <div className="space-y-4 stagger-children">
          {pendingHomework.map((hw) => (
            <Card key={hw.id} variant="elevated" className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {hw.subject}
                    </span>
                    <span className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1",
                      statusConfig[hw.status].color
                    )}>
                      {React.createElement(statusConfig[hw.status].icon, { className: 'w-3 h-3' })}
                      {hw.dueDate}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{hw.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{hw.teacher}</p>
                </div>
              </div>

              <p className="text-muted-foreground mb-4">{hw.description}</p>

              {hw.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {hw.attachments.map((att, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-secondary text-sm"
                    >
                      {att.type === 'pdf' ? (
                        <FileText className="w-4 h-4 text-apple-red" />
                      ) : (
                        <Video className="w-4 h-4 text-apple-blue" />
                      )}
                      {att.name}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="apple" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Dosya Yükle
                </Button>
                <Button variant="outline">
                  Detaylar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Completed Homework */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-apple-green" />
          Tamamlanan Ödevler
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {completedHomework.map((hw) => {
            const StatusIcon = statusConfig[hw.status].icon;
            return (
              <Card key={hw.id} variant="default" className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {hw.subject}
                  </span>
                  <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1",
                    statusConfig[hw.status].color
                  )}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig[hw.status].label}
                  </span>
                </div>
                <h3 className="font-semibold mb-1">{hw.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{hw.teacher}</p>
                {hw.grade && (
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <span className="text-sm text-muted-foreground">Not</span>
                    <span className={cn(
                      "text-lg font-bold",
                      hw.grade >= 70 ? "text-apple-green" : "text-apple-orange"
                    )}>
                      {hw.grade}
                    </span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
