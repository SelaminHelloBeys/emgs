import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Megaphone,
  Bell,
  Calendar,
  ChevronRight,
  AlertCircle,
  Info,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  type: 'info' | 'warning' | 'success';
  source: string;
  isNew: boolean;
}

const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: 'Yarıyıl Tatili Programı',
    content: 'Yarıyıl tatili 20 Ocak - 3 Şubat tarihleri arasında olacaktır. Tüm öğrenci ve öğretmenlerimize iyi tatiller dileriz.',
    date: 'Bugün',
    type: 'info',
    source: 'Okul Yönetimi',
    isNew: true,
  },
  {
    id: 2,
    title: 'Veli Toplantısı Duyurusu',
    content: '25 Ocak Cumartesi günü saat 14:00\'te veli toplantısı yapılacaktır. Tüm velilerimizin katılımını bekliyoruz.',
    date: 'Dün',
    type: 'warning',
    source: 'Müdür Yardımcısı',
    isNew: true,
  },
  {
    id: 3,
    title: 'Matematik Olimpiyatı Sonuçları',
    content: 'Okulumuz matematik olimpiyatında il birincisi olmuştur. Tüm öğrencilerimizi ve öğretmenlerimizi tebrik ederiz.',
    date: '3 gün önce',
    type: 'success',
    source: 'Okul Yönetimi',
    isNew: false,
  },
  {
    id: 4,
    title: 'Kütüphane Çalışma Saatleri',
    content: 'Sınav döneminde kütüphane saat 20:00\'ye kadar açık olacaktır.',
    date: '1 hafta önce',
    type: 'info',
    source: 'Kütüphane',
    isNew: false,
  },
];

const typeConfig = {
  info: { icon: Info, color: 'text-apple-blue bg-apple-blue/10', borderColor: 'border-l-apple-blue' },
  warning: { icon: AlertCircle, color: 'text-apple-orange bg-apple-orange/10', borderColor: 'border-l-apple-orange' },
  success: { icon: CheckCircle, color: 'text-apple-green bg-apple-green/10', borderColor: 'border-l-apple-green' },
};

export const AnnouncementsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold mb-2">Duyurular</h1>
          <p className="text-muted-foreground">Okul ve sınıf duyuruları</p>
        </div>
        <Button variant="apple" className="gap-2">
          <Bell className="w-4 h-4" />
          Bildirimleri Yönet
        </Button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4 stagger-children">
        {mockAnnouncements.map((announcement) => {
          const config = typeConfig[announcement.type];
          const Icon = config.icon;

          return (
            <Card 
              key={announcement.id} 
              variant="elevated" 
              className={cn(
                "p-6 border-l-4 transition-all hover:shadow-apple-lg",
                config.borderColor
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  config.color
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{announcement.title}</h3>
                    {announcement.isNew && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Yeni
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-3">{announcement.content}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Megaphone className="w-4 h-4" />
                      {announcement.source}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {announcement.date}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
