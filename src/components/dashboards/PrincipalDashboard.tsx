import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  TrendingUp,
  Users,
  Video,
  FileText,
  Loader2,
} from 'lucide-react';

interface SchoolMetrics {
  totalLessons: number;
  totalExams: number;
  totalHomework: number;
}

export const PrincipalDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<SchoolMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [lessonsRes, examsRes, homeworkRes] = await Promise.all([
          supabase.from('lessons').select('id', { count: 'exact', head: true }),
          supabase.from('exams').select('id', { count: 'exact', head: true }),
          supabase.from('homework_assignments').select('id', { count: 'exact', head: true }),
        ]);

        setMetrics({
          totalLessons: lessonsRes.count || 0,
          totalExams: examsRes.count || 0,
          totalHomework: homeworkRes.count || 0,
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const schoolMetrics = [
    { label: 'Video Ders', value: metrics?.totalLessons || 0, icon: Video, color: 'text-primary' },
    { label: 'Sınav', value: metrics?.totalExams || 0, icon: TrendingUp, color: 'text-apple-green' },
    { label: 'Ödev', value: metrics?.totalHomework || 0, icon: FileText, color: 'text-apple-orange' },
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
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">Okul Performans Paneli</h1>
        <p className="text-muted-foreground">{profile?.school_name || 'Okul'} - Müdür Görünümü</p>
      </div>

      <div className="grid grid-cols-3 gap-4 stagger-children">
        {schoolMetrics.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="stat" className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      <Card variant="elevated" className="p-6">
        <h3 className="font-semibold mb-4">Platform İçerik Durumu</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-xl bg-surface-secondary">
            <div className="text-3xl font-bold text-primary mb-1">{metrics?.totalLessons || 0}</div>
            <div className="text-sm text-muted-foreground">Video Ders</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-surface-secondary">
            <div className="text-3xl font-bold text-apple-green mb-1">{metrics?.totalExams || 0}</div>
            <div className="text-sm text-muted-foreground">Sınav</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-surface-secondary">
            <div className="text-3xl font-bold text-apple-orange mb-1">{metrics?.totalHomework || 0}</div>
            <div className="text-sm text-muted-foreground">Ödev</div>
          </div>
        </div>
      </Card>
    </div>
  );
};