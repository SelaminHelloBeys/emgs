import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Clock, Plus, Trash2, Loader2, Megaphone, Send } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface ScheduledAnnouncement {
  id: string;
  title: string;
  content: string;
  type: string;
  scheduled_at: string | null;
  is_published: boolean;
  created_at: string;
}

export const ScheduledAnnouncementsPanel: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<ScheduledAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('info');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    setAnnouncements((data || []) as ScheduledAnnouncement[]);
    setIsLoading(false);
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleCreate = async () => {
    if (!title || !content) return;

    let scheduled_at: string | null = null;
    let is_published = true;

    if (scheduledDate && scheduledTime) {
      scheduled_at = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      is_published = false;
    }

    const { error } = await supabase.from('announcements').insert({
      title,
      content,
      type,
      created_by: user!.id,
      scheduled_at,
      is_published,
    } as any);

    if (error) {
      toast.error('Duyuru oluşturulamadı');
      return;
    }

    toast.success(scheduled_at ? 'Duyuru zamanlandı' : 'Duyuru yayınlandı');
    setTitle(''); setContent(''); setType('info'); setScheduledDate(''); setScheduledTime('');
    setIsDialogOpen(false);
    fetchAnnouncements();
  };

  const handlePublishNow = async (id: string) => {
    await supabase.from('announcements').update({ is_published: true, scheduled_at: null } as any).eq('id', id);
    toast.success('Duyuru şimdi yayınlandı');
    fetchAnnouncements();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    toast.success('Duyuru silindi');
    fetchAnnouncements();
  };

  const scheduled = announcements.filter(a => !a.is_published && a.scheduled_at);
  const published = announcements.filter(a => a.is_published);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Zamanlı Duyurular</h3>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="w-3 h-3" /> Yeni Duyuru</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Duyuru Oluştur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Başlık" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea placeholder="İçerik..." value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Bilgi</SelectItem>
                  <SelectItem value="warning">Uyarı</SelectItem>
                  <SelectItem value="success">Başarı</SelectItem>
                  <SelectItem value="error">Hata</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Tarih (opsiyonel)</label>
                  <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Saat (opsiyonel)</label>
                  <Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Tarih ve saat belirtmezseniz duyuru hemen yayınlanır.</p>
              <Button onClick={handleCreate} className="w-full" disabled={!title || !content}>
                {scheduledDate ? 'Zamanla' : 'Şimdi Yayınla'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Scheduled */}
      {scheduled.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">⏳ Zamanlanmış ({scheduled.length})</h4>
          {scheduled.map(a => (
            <Card key={a.id} className="p-4 border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="font-semibold text-sm">{a.title}</h5>
                  <p className="text-xs text-muted-foreground mt-1">{a.content.slice(0, 100)}</p>
                  <p className="text-xs text-amber-600 mt-2">
                    📅 {new Date(a.scheduled_at!).toLocaleString('tr-TR')}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => handlePublishNow(a.id)} className="gap-1 text-xs">
                    <Send className="w-3 h-3" /> Şimdi Yayınla
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(a.id)}>
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Published */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground">✅ Yayınlanmış ({published.length})</h4>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : published.length === 0 ? (
          <Card className="p-8 text-center">
            <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Henüz duyuru yok</p>
          </Card>
        ) : (
          published.slice(0, 10).map(a => (
            <Card key={a.id} className="p-4 border border-border/50">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-semibold text-sm">{a.title}</h5>
                    <Badge variant="secondary" className="text-[10px]">{a.type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{a.content.slice(0, 80)}...</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(a.created_at).toLocaleString('tr-TR')}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(a.id)}>
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
