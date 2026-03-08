import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Headphones, Send, Clock, CheckCircle, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const statusLabels: Record<string, { label: string; color: string }> = {
  open: { label: 'Açık', color: 'bg-amber-500/10 text-amber-600' },
  in_progress: { label: 'İşleniyor', color: 'bg-blue-500/10 text-blue-600' },
  resolved: { label: 'Çözüldü', color: 'bg-emerald-500/10 text-emerald-600' },
  closed: { label: 'Kapatıldı', color: 'bg-muted text-muted-foreground' },
};

export const SupportPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal');

  const fetchTickets = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setTickets(data || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchTickets(); }, [user]);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim() || !user) return;

    const { error } = await supabase.from('support_tickets').insert({
      user_id: user.id,
      subject: subject.trim(),
      message: message.trim(),
      priority,
    });

    if (error) {
      toast.error('Talep gönderilemedi');
      return;
    }

    toast.success('Destek talebiniz gönderildi');
    setSubject(''); setMessage(''); setPriority('normal');
    setIsDialogOpen(false);
    fetchTickets();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Headphones className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Destek Merkezi</h1>
            <p className="text-muted-foreground">Sorunlarınızı ve önerilerinizi bize iletin</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Yeni Talep</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Destek Talebi Oluştur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Konu" value={subject} onChange={(e) => setSubject(e.target.value)} />
              <Textarea placeholder="Sorununuzu detaylı açıklayın..." value={message} onChange={(e) => setMessage(e.target.value)} rows={5} />
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Düşük Öncelik</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Yüksek Öncelik</SelectItem>
                  <SelectItem value="urgent">Acil</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSubmit} className="w-full gap-2" disabled={!subject.trim() || !message.trim()}>
                <Send className="w-4 h-4" /> Gönder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : tickets.length === 0 ? (
        <Card className="p-12 text-center">
          <Headphones className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Henüz destek talebiniz yok</h3>
          <p className="text-muted-foreground">Bir sorun yaşıyorsanız "Yeni Talep" butonuyla bize ulaşabilirsiniz.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => {
            const config = statusLabels[ticket.status] || statusLabels.open;
            return (
              <Card key={ticket.id} className="p-5 border border-border/50">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{ticket.subject}</h3>
                  <span className={cn("text-xs font-medium px-2 py-1 rounded-full", config.color)}>
                    {config.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">{ticket.message}</p>
                <p className="text-xs text-muted-foreground">{new Date(ticket.created_at).toLocaleString('tr-TR')}</p>

                {ticket.admin_response && (
                  <div className="mt-3 bg-primary/5 border border-primary/10 rounded-lg p-3">
                    <p className="text-xs font-medium text-primary mb-1">Yanıt:</p>
                    <p className="text-sm">{ticket.admin_response}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
