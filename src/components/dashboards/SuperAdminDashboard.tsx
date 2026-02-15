import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PlatformModesPanel } from '@/components/admin/PlatformModesPanel';
import {
  Users,
  Video,
  FileText,
  Target,
  Loader2,
} from 'lucide-react';

interface PlatformStats {
  totalUsers: number;
  totalLessons: number;
  totalExams: number;
  totalHomework: number;
}

export const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch real counts from database
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
    { label: 'Toplam Kullanıcı', value: stats?.totalUsers || 0, icon: Users, color: 'text-primary' },
    { label: 'Video İçerik', value: stats?.totalLessons || 0, icon: Video, color: 'text-apple-green' },
    { label: 'Sınav', value: stats?.totalExams || 0, icon: Target, color: 'text-apple-orange' },
    { label: 'Ödev', value: stats?.totalHomework || 0, icon: FileText, color: 'text-apple-purple' },
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
      {/* Header */}
      <div className="flex items-start justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold mb-2">Platform Yönetimi</h1>
          <p className="text-muted-foreground">
            EMG Sistem Yöneticisi Paneli
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {platformStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="stat" className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Platform Info */}
      <Card variant="elevated" className="p-6">
        <h3 className="font-semibold mb-4">Platform Durumu</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl bg-surface-secondary">
            <div className="text-2xl font-bold text-primary mb-1">{stats?.totalUsers || 0}</div>
            <div className="text-sm text-muted-foreground">Kayıtlı Kullanıcı</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-surface-secondary">
            <div className="text-2xl font-bold text-apple-green mb-1">{stats?.totalLessons || 0}</div>
            <div className="text-sm text-muted-foreground">Video Ders</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-surface-secondary">
            <div className="text-2xl font-bold text-apple-orange mb-1">{stats?.totalExams || 0}</div>
            <div className="text-sm text-muted-foreground">Sınav</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-surface-secondary">
            <div className="text-2xl font-bold text-apple-purple mb-1">{stats?.totalHomework || 0}</div>
            <div className="text-sm text-muted-foreground">Ödev</div>
          </div>
        </div>
      </Card>

      {/* Platform Modes */}
      <PlatformModesPanel />
    </div>
  );
};