import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLessons } from '@/hooks/useLessons';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  FileText,
  Users,
  BarChart3,
  Play,
  ChevronRight,
  Plus,
  Eye,
  Heart,
  Loader2,
  Target,
} from 'lucide-react';

interface TeacherStats {
  totalLessons: number;
  totalExams: number;
  totalHomework: number;
}

export const TeacherDashboard: React.FC = () => {
  const { profile, user } = useAuth();
  const { lessons, isLoading: lessonsLoading } = useLessons();
  const navigate = useNavigate();
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        // Fetch lessons created by this teacher
        const [lessonsRes, examsRes, homeworkRes] = await Promise.all([
          supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('created_by', user.id),
          supabase.from('exams').select('id', { count: 'exact', head: true }).eq('created_by', user.id),
          supabase.from('homework_assignments').select('id', { count: 'exact', head: true }).eq('created_by', user.id),
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
  }, [user]);

  // Get my lessons (created by this user)
  const myLessons = lessons.filter(l => l.created_by === user?.id).slice(0, 3);

  const statsData = [
    { label: 'Oluşturduğum Ders', value: stats?.totalLessons || 0, icon: Video, color: 'text-primary' },
    { label: 'Oluşturduğum Sınav', value: stats?.totalExams || 0, icon: Target, color: 'text-apple-green' },
    { label: 'Oluşturduğum Ödev', value: stats?.totalHomework || 0, icon: FileText, color: 'text-apple-orange' },
  ];

  if (isLoading || lessonsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-start justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Hoş Geldiniz, {profile?.name || 'Öğretmen'} 👋
          </h1>
          <p className="text-muted-foreground">
            {profile?.subjects?.join(', ') || 'Öğretmen'} • {profile?.school_name || 'Okul'}
          </p>
        </div>
        <Button variant="apple" className="gap-2" onClick={() => navigate('/upload')}>
          <Plus className="w-4 h-4" />
          Yeni İçerik
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 stagger-children">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="stat" className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="interactive" className="p-5 text-center" onClick={() => navigate('/upload')}>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Video className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-medium mb-1">Ders Yükle</h3>
          <p className="text-xs text-muted-foreground">Video ders ekle</p>
        </Card>
        <Card variant="interactive" className="p-5 text-center" onClick={() => navigate('/upload')}>
          <div className="w-12 h-12 rounded-2xl bg-apple-orange/10 flex items-center justify-center mx-auto mb-3">
            <Play className="w-6 h-6 text-apple-orange" />
          </div>
          <h3 className="font-medium mb-1">Short Yükle</h3>
          <p className="text-xs text-muted-foreground">Kısa video ekle</p>
        </Card>
        <Card variant="interactive" className="p-5 text-center" onClick={() => navigate('/upload')}>
          <div className="w-12 h-12 rounded-2xl bg-apple-green/10 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-apple-green" />
          </div>
          <h3 className="font-medium mb-1">PDF Yükle</h3>
          <p className="text-xs text-muted-foreground">Doküman ekle</p>
        </Card>
        <Card variant="interactive" className="p-5 text-center" onClick={() => navigate('/denemeler')}>
          <div className="w-12 h-12 rounded-2xl bg-apple-purple/10 flex items-center justify-center mx-auto mb-3">
            <BarChart3 className="w-6 h-6 text-apple-purple" />
          </div>
          <h3 className="font-medium mb-1">Sınav Oluştur</h3>
          <p className="text-xs text-muted-foreground">Test hazırla</p>
        </Card>
      </div>

      {/* My Lessons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Son Yüklemelerim</h2>
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/konu-anlatimi')}>
            Tümünü Gör
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {myLessons.length === 0 ? (
          <Card variant="elevated" className="p-8 text-center">
            <Video className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium mb-1">Henüz içerik yüklemediniz</h3>
            <p className="text-sm text-muted-foreground mb-4">İlk dersinizi yükleyerek başlayın</p>
            <Button variant="apple" onClick={() => navigate('/upload')}>
              İçerik Yükle
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {myLessons.map((item) => (
              <Card key={item.id} variant="default" className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    item.content_type === 'video' ? 'bg-primary/10' :
                    item.content_type === 'short' ? 'bg-apple-orange/10' : 'bg-apple-green/10'
                  }`}>
                    {item.content_type === 'video' ? <Video className="w-5 h-5 text-primary" /> :
                     item.content_type === 'short' ? <Play className="w-5 h-5 text-apple-orange" /> :
                     <FileText className="w-5 h-5 text-apple-green" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{item.subject}</span>
                      <span>{item.duration || ''}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};