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
import { useAuth } from '@/contexts/AuthContext';
import {
  Megaphone,
  Bell,
  Calendar,
  ChevronRight,
  AlertCircle,
  Info,
  CheckCircle,
  Plus,
  FileText,
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

const typeConfig = {
  info: { icon: Info, color: 'text-apple-blue bg-apple-blue/10', borderColor: 'border-l-apple-blue' },
  warning: { icon: AlertCircle, color: 'text-apple-orange bg-apple-orange/10', borderColor: 'border-l-apple-orange' },
  success: { icon: CheckCircle, color: 'text-apple-green bg-apple-green/10', borderColor: 'border-l-apple-green' },
};

// Roles that can create announcements
const canCreateRoles = ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi'];

export const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<'info' | 'warning' | 'success'>('info');

  const canCreate = user?.role && canCreateRoles.includes(user.role);

  const handleCreateAnnouncement = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    const newAnnouncement: Announcement = {
      id: Date.now(),
      title: newTitle,
      content: newContent,
      date: 'Az önce',
      type: newType,
      source: user?.name || 'Yönetim',
      isNew: true,
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    setNewTitle('');
    setNewContent('');
    setNewType('info');
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold mb-2">Duyurular</h1>
          <p className="text-muted-foreground">Okul ve sınıf duyuruları</p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="apple" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Duyuru Oluştur
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Yeni Duyuru</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Başlık</label>
                    <Input
                      placeholder="Duyuru başlığı"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">İçerik</label>
                    <Textarea
                      placeholder="Duyuru içeriği..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tür</label>
                    <Select value={newType} onValueChange={(v) => setNewType(v as typeof newType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Bilgi</SelectItem>
                        <SelectItem value="warning">Uyarı</SelectItem>
                        <SelectItem value="success">Başarı</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="apple"
                    className="w-full"
                    onClick={handleCreateAnnouncement}
                    disabled={!newTitle.trim() || !newContent.trim()}
                  >
                    Duyuruyu Yayınla
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button variant="outline" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Bildirimleri Yönet</span>
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {announcements.length === 0 && (
        <Card variant="elevated" className="p-12 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-muted mx-auto flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Duyuru bulunamadı</h3>
          <p className="text-muted-foreground mb-4">
            {canCreate 
              ? 'İlk duyurunuzu oluşturmak için yukarıdaki butonu kullanın.'
              : 'Henüz yayınlanmış bir duyuru yok.'}
          </p>
        </Card>
      )}

      {/* Announcements List */}
      {announcements.length > 0 && (
        <div className="space-y-4 stagger-children">
          {announcements.map((announcement) => {
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
      )}
    </div>
  );
};
