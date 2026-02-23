import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileWarning, MessageSquare, Check } from 'lucide-react';
import { usePageMaintenance } from '@/hooks/usePageMaintenance';
import { toast } from 'sonner';

export const PageMaintenancePanel: React.FC = () => {
  const { pages, isLoading, togglePage, updateMessage } = usePageMaintenance();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState('');

  const handleToggle = async (id: string, isActive: boolean, pageName: string) => {
    const success = await togglePage(id, isActive);
    if (success) {
      toast.success(`${pageName} ${isActive ? 'bakımdan çıkarıldı' : 'bakıma alındı'}`);
    } else {
      toast.error('Hata oluştu');
    }
  };

  const handleSaveMessage = async (id: string) => {
    const success = await updateMessage(id, editMessage);
    if (success) {
      toast.success('Not kaydedildi');
      setEditingId(null);
    } else {
      toast.error('Not kaydedilemedi');
    }
  };

  const startEditing = (id: string, currentMessage: string | null) => {
    setEditingId(id);
    setEditMessage(currentMessage || '');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-primary" />
            Sayfa Bakım Yönetimi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeCount = pages.filter(p => p.is_active).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileWarning className="h-5 w-5 text-primary" />
          Sayfa Bakım Yönetimi
          {activeCount > 0 && (
            <Badge variant="destructive" className="text-xs ml-2">
              {activeCount} sayfa bakımda
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Sayfaları tek tek bakıma alabilir, özel not ekleyebilirsiniz. Bakımdaki sayfalara yöneticiler hariç kimse erişemez.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {pages.map((page) => (
            <div key={page.id} className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={page.id} className="font-medium text-sm">
                        {page.page_name}
                      </Label>
                      {page.is_active && (
                        <Badge variant="destructive" className="text-xs">
                          Bakımda
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{page.page_route}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => startEditing(page.id, page.message)}
                    title="Not ekle/düzenle"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <Switch
                    id={page.id}
                    checked={page.is_active}
                    onCheckedChange={() => handleToggle(page.id, page.is_active, page.page_name)}
                  />
                </div>
              </div>
              {editingId === page.id && (
                <div className="flex gap-2 pl-3">
                  <Input
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                    placeholder="Geliştirici notu (kullanıcılar görecek)"
                    className="text-sm"
                  />
                  <Button size="sm" onClick={() => handleSaveMessage(page.id)} className="shrink-0 gap-1">
                    <Check className="w-3 h-3" />
                    Kaydet
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
