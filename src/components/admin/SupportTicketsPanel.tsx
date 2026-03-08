import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { MessageCircle, Clock, CheckCircle, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  admin_response: string | null;
  created_at: string;
  user_name?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open: { label: 'Açık', color: 'bg-amber-500/10 text-amber-600', icon: Clock },
  in_progress: { label: 'İşleniyor', color: 'bg-blue-500/10 text-blue-600', icon: AlertTriangle },
  resolved: { label: 'Çözüldü', color: 'bg-emerald-500/10 text-emerald-600', icon: CheckCircle },
  closed: { label: 'Kapatıldı', color: 'bg-muted text-muted-foreground', icon: CheckCircle },
};

export const SupportTicketsPanel: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const fetchTickets = async () => {
    const { data: ticketsData, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tickets:', error);
      setIsLoading(false);
      return;
    }

    const userIds = [...new Set((ticketsData || []).map(t => t.user_id))];
    const profilesMap = new Map<string, string>();

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', userIds);
      profiles?.forEach(p => profilesMap.set(p.user_id, p.name));
    }

    setTickets((ticketsData || []).map(t => ({
      ...t,
      user_name: profilesMap.get(t.user_id) || 'Bilinmiyor',
    })));
    setIsLoading(false);
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleRespond = async (ticketId: string) => {
    if (!responseText.trim()) return;
    setResponding(ticketId);

    const { error } = await supabase
      .from('support_tickets')
      .update({
        admin_response: responseText,
        status: 'resolved',
        responded_by: user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticketId);

    if (error) {
      toast.error('Yanıt gönderilemedi');
    } else {
      toast.success('Yanıt gönderildi');
      setResponseText('');
      fetchTickets();
    }
    setResponding(null);
  };

  const handleStatusChange = async (ticketId: string, status: string) => {
    await supabase.from('support_tickets').update({ status, updated_at: new Date().toISOString() }).eq('id', ticketId);
    fetchTickets();
  };

  const filtered = tickets.filter(t => filter === 'all' || t.status === filter);

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Destek Talepleri</h3>
          <Badge variant="secondary">{tickets.length}</Badge>
        </div>
        <div className="flex gap-2">
          {['all', 'open', 'in_progress', 'resolved', 'closed'].map(s => (
            <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" onClick={() => setFilter(s)} className="text-xs">
              {s === 'all' ? 'Tümü' : statusConfig[s]?.label || s}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Destek talebi bulunamadı</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(ticket => {
            const config = statusConfig[ticket.status] || statusConfig.open;
            const StatusIcon = config.icon;
            return (
              <Card key={ticket.id} className="p-5 border border-border/50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{ticket.subject}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ticket.user_name} · {new Date(ticket.created_at).toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1", config.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {config.label}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">{ticket.message}</p>

                {ticket.admin_response && (
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 mb-3">
                    <p className="text-xs font-medium text-primary mb-1">Admin Yanıtı:</p>
                    <p className="text-sm">{ticket.admin_response}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  {ticket.status === 'open' && (
                    <Button size="sm" variant="outline" onClick={() => handleStatusChange(ticket.id, 'in_progress')}>İşleme Al</Button>
                  )}
                  {ticket.status !== 'closed' && (
                    <Button size="sm" variant="outline" onClick={() => handleStatusChange(ticket.id, 'closed')}>Kapat</Button>
                  )}
                  {responding === ticket.id ? null : (
                    <Button size="sm" variant="default" onClick={() => { setResponding(ticket.id); setResponseText(ticket.admin_response || ''); }}>
                      Yanıtla
                    </Button>
                  )}
                </div>

                {responding === ticket.id && (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Yanıtınızı yazın..."
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleRespond(ticket.id)} className="gap-1">
                        <Send className="w-3 h-3" /> Gönder
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setResponding(null)}>İptal</Button>
                    </div>
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
