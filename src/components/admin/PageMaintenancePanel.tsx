import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileWarning } from 'lucide-react';
import { usePageMaintenance } from '@/hooks/usePageMaintenance';
import { toast } from 'sonner';

export const PageMaintenancePanel: React.FC = () => {
  const { pages, isLoading, togglePage } = usePageMaintenance();

  const handleToggle = async (id: string, isActive: boolean, pageName: string) => {
    const success = await togglePage(id, isActive);
    if (success) {
      toast.success(`${pageName} ${isActive ? 'bakımdan çıkarıldı' : 'bakıma alındı'}`);
    } else {
      toast.error('Hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-orange-500" />
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
          <FileWarning className="h-5 w-5 text-orange-500" />
          Sayfa Bakım Yönetimi
          {activeCount > 0 && (
            <Badge variant="destructive" className="text-xs ml-2">
              {activeCount} sayfa bakımda
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Sayfaları tek tek bakıma alabilir veya bakımdan çıkarabilirsiniz. Bakımdaki sayfalara yöneticiler hariç kimse erişemez.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {pages.map((page) => (
            <div
              key={page.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
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
              <Switch
                id={page.id}
                checked={page.is_active}
                onCheckedChange={() => handleToggle(page.id, page.is_active, page.page_name)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
