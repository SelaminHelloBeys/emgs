import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Users,
  Video,
  FileText,
  Target,
  Search,
  Loader2,
} from 'lucide-react';

interface DashboardStats {
  totalLessons: number;
  totalExams: number;
  totalHomework: number;
}

export const VicePrincipalDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [lessonsRes, examsRes, homeworkRes] = await Promise.all([
          supabase.from('lessons').select('id', { count: 'exact', head: true }),
          supabase.from('exams').select('id', { count: 'exact', head: true }),
          supabase.from('homework_assignments').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold mb-2">Takip Paneli</h1>
          <p className="text-muted-foreground">Müdür Yardımcısı Görünümü</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 stagger-children">
        <Card variant="stat" className="p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-bold">Video Dersler</span>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Video className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="text-3xl font-bold">{stats?.totalLessons || 0}</div>
        </Card>
        
        <Card variant="stat" className="p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-bold">Sınavlar</span>
            <div className="w-10 h-10 rounded-xl bg-apple-green/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-apple-green" />
            </div>
          </div>
          <div className="text-3xl font-bold">{stats?.totalExams || 0}</div>
        </Card>
        
        <Card variant="stat" className="p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-bold">Ödevler</span>
            <div className="w-10 h-10 rounded-xl bg-apple-orange/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-apple-orange" />
            </div>
          </div>
          <div className="text-3xl font-bold">{stats?.totalHomework || 0}</div>
        </Card>
      </div>

      <Card variant="elevated" className="p-6">
        <h3 className="font-semibold mb-4">Platform Özeti</h3>
        <p className="text-muted-foreground">
          Platformda toplam {stats?.totalLessons || 0} video ders, {stats?.totalExams || 0} sınav ve {stats?.totalHomework || 0} ödev bulunmaktadır.
        </p>
      </Card>
    </div>
  );
};