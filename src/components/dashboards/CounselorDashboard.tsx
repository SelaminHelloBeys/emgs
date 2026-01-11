import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Heart,
  Users,
  MessageCircle,
  Video,
  FileText,
  ChevronRight,
  Loader2,
} from 'lucide-react';

interface CounselorStats {
  totalLessons: number;
  totalHomework: number;
}

export const CounselorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<CounselorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [lessonsRes, homeworkRes] = await Promise.all([
          supabase.from('lessons').select('id', { count: 'exact', head: true }),
          supabase.from('homework_assignments').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
          totalLessons: lessonsRes.count || 0,
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
          <h1 className="text-3xl font-bold mb-2">Rehberlik Paneli</h1>
          <p className="text-muted-foreground">Öğrenci Gelişim ve Destek Merkezi</p>
        </div>
        <Button variant="apple" className="gap-2">
          <MessageCircle className="w-4 h-4" />
          Yeni Görüşme
        </Button>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 gap-4 stagger-children">
        <Card variant="stat" className="p-5 text-center">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-primary/10">
            <Video className="w-6 h-6 text-primary" />
          </div>
          <div className="text-2xl font-bold mb-1">{stats?.totalLessons || 0}</div>
          <div className="text-sm text-muted-foreground">Video Ders</div>
        </Card>
        <Card variant="stat" className="p-5 text-center">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-apple-orange/10">
            <FileText className="w-6 h-6 text-apple-orange" />
          </div>
          <div className="text-2xl font-bold mb-1">{stats?.totalHomework || 0}</div>
          <div className="text-sm text-muted-foreground">Ödev</div>
        </Card>
      </div>

      <Card variant="elevated" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Heart className="w-5 h-5 text-apple-red" />
            Rehberlik Bilgileri
          </h3>
        </div>
        <p className="text-muted-foreground">
          Platformda {stats?.totalLessons || 0} video ders ve {stats?.totalHomework || 0} ödev bulunmaktadır. 
          Öğrenci gelişimini takip etmek için bu içerikleri inceleyebilirsiniz.
        </p>
      </Card>
    </div>
  );
};