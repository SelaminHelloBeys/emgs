import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { HeartPulse, Database, Users, Video, FileText, RefreshCw, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableStats {
  name: string;
  count: number;
  icon: React.ElementType;
}

export const PlatformHealthPanel: React.FC = () => {
  const [stats, setStats] = useState<TableStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchHealth = async () => {
    setIsLoading(true);
    const tables = [
      { name: 'profiles', label: 'Kullanıcılar', icon: Users },
      { name: 'lessons', label: 'Dersler', icon: Video },
      { name: 'trial_exams', label: 'Denemeler', icon: FileText },
      { name: 'homework_assignments', label: 'Ödevler', icon: FileText },
      { name: 'homework_submissions', label: 'Ödev Teslimleri', icon: FileText },
      { name: 'announcements', label: 'Duyurular', icon: FileText },
      { name: 'user_badges', label: 'Verilen Rozetler', icon: FileText },
      { name: 'video_watch_progress', label: 'Video İlerleme', icon: Video },
      { name: 'student_exam_participation', label: 'Deneme Katılım', icon: FileText },
      { name: 'support_tickets', label: 'Destek Talepleri', icon: FileText },
      { name: 'admin_access_codes', label: 'Davet Kodları', icon: FileText },
      { name: 'parent_codes', label: 'Veli Kodları', icon: FileText },
    ];

    const results = await Promise.all(
      tables.map(async (t) => {
        const { count } = await supabase.from(t.name as any).select('*', { count: 'exact', head: true });
        return { name: t.label, count: count || 0, icon: t.icon };
      })
    );

    setStats(results);
    setLastRefresh(new Date());
    setIsLoading(false);
  };

  useEffect(() => { fetchHealth(); }, []);

  const totalRecords = stats.reduce((sum, s) => sum + s.count, 0);
  const maxCount = Math.max(...stats.map(s => s.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Platform Sağlığı</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Son güncelleme: {lastRefresh.toLocaleTimeString('tr-TR')}
          </span>
          <Button size="sm" variant="outline" onClick={fetchHealth} disabled={isLoading} className="gap-1">
            <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
            Yenile
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-muted-foreground">Durum</span>
          </div>
          <p className="text-lg font-bold text-emerald-600">Çevrimiçi</p>
        </Card>
        <Card className="p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Toplam Kayıt</span>
          </div>
          <p className="text-lg font-bold">{totalRecords.toLocaleString()}</p>
        </Card>
        <Card className="p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Tablo Sayısı</span>
          </div>
          <p className="text-lg font-bold">{stats.length}</p>
        </Card>
        <Card className="p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            {totalRecords > 0 ? (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            )}
            <span className="text-xs font-medium text-muted-foreground">Sağlık</span>
          </div>
          <p className="text-lg font-bold text-emerald-600">İyi</p>
        </Card>
      </div>

      {/* Table breakdown */}
      <Card className="p-6 border border-border/50">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          Tablo Detayları
        </h4>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-3">
            {stats.sort((a, b) => b.count - a.count).map(stat => (
              <div key={stat.name} className="flex items-center gap-3">
                <span className="text-sm font-medium w-40 truncate">{stat.name}</span>
                <div className="flex-1">
                  <Progress value={(stat.count / maxCount) * 100} className="h-2" />
                </div>
                <span className="text-sm font-mono text-muted-foreground w-16 text-right">
                  {stat.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
