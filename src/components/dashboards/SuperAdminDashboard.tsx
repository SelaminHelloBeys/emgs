import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Users,
  Video,
  FileText,
  Target,
  Loader2,
  Shield,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlatformStats {
  totalUsers: number;
  totalLessons: number;
  totalExams: number;
  totalHomework: number;
}

export const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [profilesRes, lessonsRes, examsRes, homeworkRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('lessons').select('id', { count: 'exact', head: true }),
          supabase.from('trial_exams').select('id', { count: 'exact', head: true }),
          supabase.from('homework_assignments').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
          totalUsers: profilesRes.count || 0,
          totalLessons: lessonsRes.count || 0,
          totalExams: examsRes.count || 0,
          totalHomework: homeworkRes.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const platformStats = [
    { label: 'Toplam Kullanıcı', value: stats?.totalUsers || 0, icon: Users, color: 'text-primary', bg: 'bg-primary/10 dark:bg-primary/20' },
    { label: 'Video İçerik', value: stats?.totalLessons || 0, icon: Video, color: 'text-apple-green', bg: 'bg-green-500/10 dark:bg-green-500/20' },
    { label: 'Sınav', value: stats?.totalExams || 0, icon: Target, color: 'text-apple-orange', bg: 'bg-orange-500/10 dark:bg-orange-500/20' },
    { label: 'Ödev', value: stats?.totalHomework || 0, icon: FileText, color: 'text-apple-purple', bg: 'bg-purple-500/10 dark:bg-purple-500/20' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with animation */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Platform Yönetimi</h1>
        <p className="text-muted-foreground">EMG Sistem Yöneticisi Paneli</p>
      </div>

      {/* Stats Grid with staggered animation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {platformStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              variant="stat"
              className="p-5 animate-fade-in hover:scale-[1.02] transition-transform duration-300"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                  <Icon className={cn("w-5 h-5", stat.color)} />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
        <Card
          className="p-6 cursor-pointer group border-0 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/5 hover:shadow-xl transition-all duration-500"
          onClick={() => navigate('/moderation')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 dark:bg-primary/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Moderasyon Paneli</h3>
              <p className="text-sm text-muted-foreground">Platformu yönet ve kontrol et</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
        </Card>

        <Card
          className="p-6 cursor-pointer group border-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/5 hover:shadow-xl transition-all duration-500"
          onClick={() => navigate('/analytics')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 dark:bg-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Analitik</h3>
              <p className="text-sm text-muted-foreground">Platform istatistiklerini görüntüle</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
        </Card>
      </div>

      {/* Platform Status */}
      <Card variant="elevated" className="p-6 animate-fade-in" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
        <h3 className="font-semibold mb-4">Platform Durumu</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Kayıtlı Kullanıcı', value: stats?.totalUsers || 0, color: 'text-primary' },
            { label: 'Video Ders', value: stats?.totalLessons || 0, color: 'text-apple-green' },
            { label: 'Sınav', value: stats?.totalExams || 0, color: 'text-apple-orange' },
            { label: 'Ödev', value: stats?.totalHomework || 0, color: 'text-apple-purple' },
          ].map((item) => (
            <div key={item.label} className="text-center p-4 rounded-xl bg-surface-secondary hover:scale-105 transition-transform duration-300">
              <div className={cn("text-2xl font-bold mb-1", item.color)}>{item.value}</div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
