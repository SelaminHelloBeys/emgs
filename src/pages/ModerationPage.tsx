import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { PlatformModesPanel } from '@/components/admin/PlatformModesPanel';
import { PageMaintenancePanel } from '@/components/admin/PageMaintenancePanel';
import { UserManagementPanel } from '@/components/admin/UserManagementPanel';
import { ContentManagementPanel } from '@/components/admin/ContentManagementPanel';
import { NotificationManagementPanel } from '@/components/admin/NotificationManagementPanel';
import { ExamParticipationPanel } from '@/components/admin/ExamParticipationPanel';
import { supabase } from '@/integrations/supabase/client';
import {
  Shield,
  Users,
  Video,
  Bell,
  Settings,
  FileText,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  user?: string;
}

export const ModerationPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    // Generate system logs from platform activity
    const generateLogs = async () => {
      const entries: LogEntry[] = [];
      
      const [profilesRes, lessonsRes, homeworkRes, announcementsRes] = await Promise.all([
        supabase.from('profiles').select('name, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('lessons').select('title, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('homework_assignments').select('title, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('announcements').select('title, created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      profilesRes.data?.forEach(p => {
        entries.push({
          id: `user-${p.created_at}`,
          timestamp: p.created_at,
          type: 'info',
          message: `Yeni kullanıcı kaydı: ${p.name}`,
        });
      });

      lessonsRes.data?.forEach(l => {
        entries.push({
          id: `lesson-${l.created_at}`,
          timestamp: l.created_at,
          type: 'success',
          message: `Yeni video yüklendi: ${l.title}`,
        });
      });

      homeworkRes.data?.forEach(h => {
        entries.push({
          id: `hw-${h.created_at}`,
          timestamp: h.created_at,
          type: 'info',
          message: `Yeni ödev oluşturuldu: ${h.title}`,
        });
      });

      announcementsRes.data?.forEach(a => {
        entries.push({
          id: `ann-${a.created_at}`,
          timestamp: a.created_at,
          type: 'warning',
          message: `Duyuru yayınlandı: ${a.title}`,
        });
      });

      entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLogs(entries.slice(0, 20));
    };

    generateLogs();
  }, []);

  if (!isAdmin) return null;

  const logIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Moderasyon Paneli</h1>
            <p className="text-muted-foreground">Platform yönetimi ve kontrol merkezi</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex flex-wrap gap-1 h-auto p-1">
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="w-4 h-4" />
            Genel Bakış
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            Kullanıcılar
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <Video className="w-4 h-4" />
            İçerikler
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Bildirimler
          </TabsTrigger>
          <TabsTrigger value="platform" className="gap-2">
            <Settings className="w-4 h-4" />
            Platform Modları
          </TabsTrigger>
          <TabsTrigger value="exams" className="gap-2">
            <FileText className="w-4 h-4" />
            Denemeler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Activity Logs */}
          <Card className="p-6 border-0 bg-card/80 dark:bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Platform Aktivite Logları</h3>
            </div>
            
            {logs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Henüz log kaydı yok</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl transition-colors",
                      "bg-muted/30 dark:bg-muted/10 hover:bg-muted/50 dark:hover:bg-muted/20"
                    )}
                  >
                    <div className="mt-0.5">{logIcon(log.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{log.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(log.timestamp).toLocaleString('tr-TR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UserManagementPanel />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <ContentManagementPanel />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationManagementPanel />
        </TabsContent>

        <TabsContent value="platform" className="mt-6 space-y-6">
          <PlatformModesPanel />
          <PageMaintenancePanel />
        </TabsContent>

        <TabsContent value="exams" className="mt-6">
          <ExamParticipationPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};
