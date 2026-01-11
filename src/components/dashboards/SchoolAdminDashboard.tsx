import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Video,
  Megaphone,
  Plus,
  ChevronRight,
  Loader2,
} from 'lucide-react';

interface SchoolStats {
  totalLessons: number;
  totalAnnouncements: number;
}

interface Announcement {
  id: string;
  title: string;
  created_at: string;
}

export const SchoolAdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonsRes, announcementsRes, announcementsListRes] = await Promise.all([
          supabase.from('lessons').select('id', { count: 'exact', head: true }),
          supabase.from('announcements').select('id', { count: 'exact', head: true }),
          supabase.from('announcements').select('id, title, created_at').order('created_at', { ascending: false }).limit(3),
        ]);

        setStats({
          totalLessons: lessonsRes.count || 0,
          totalAnnouncements: announcementsRes.count || 0,
        });

        setAnnouncements(announcementsListRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Bugün';
    if (diffInDays === 1) return 'Dün';
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    return `${Math.floor(diffInDays / 7)} hafta önce`;
  };

  const schoolStats = [
    { label: 'Video İçerik', value: stats?.totalLessons || 0, icon: Video, color: 'text-apple-orange' },
    { label: 'Aktif Duyuru', value: stats?.totalAnnouncements || 0, icon: Megaphone, color: 'text-apple-purple' },
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
          <h1 className="text-3xl font-bold mb-2">Okul Yönetimi</h1>
          <p className="text-muted-foreground">{profile?.school_name || 'Okul'}</p>
        </div>
        <Button variant="apple" className="gap-2" onClick={() => navigate('/announcements')}>
          <Plus className="w-4 h-4" />
          Duyuru Ekle
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 stagger-children">
        {schoolStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="stat" className="p-5">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Recent Announcements */}
      <Card variant="elevated" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Son Duyurular</h3>
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/announcements')}>
            Tümü <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        {announcements.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Henüz duyuru yok</p>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary">
                <div>
                  <p className="font-medium">{ann.title}</p>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(ann.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};