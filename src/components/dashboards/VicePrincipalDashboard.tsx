import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Stagger, MotionItem, HoverLift, FadeInView, appleSpring } from '@/components/motion/MotionElements';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Users, Video, FileText, Target, Loader2 } from 'lucide-react';

interface DashboardStats { totalLessons: number; totalExams: number; totalHomework: number; }

export const VicePrincipalDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [lessonsRes, examsRes, homeworkRes] = await Promise.all([
          supabase.from('lessons').select('id', { count: 'exact', head: true }),
          supabase.from('trial_exams').select('id', { count: 'exact', head: true }),
          supabase.from('homework_assignments').select('id', { count: 'exact', head: true }),
        ]);
        setStats({ totalLessons: lessonsRes.count || 0, totalExams: examsRes.count || 0, totalHomework: homeworkRes.count || 0 });
      } catch (error) { console.error('Error fetching stats:', error); }
      finally { setIsLoading(false); }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <motion.div
        className="flex items-start justify-between"
        initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={appleSpring}
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Takip Paneli</h1>
          <p className="text-muted-foreground">Müdür Yardımcısı Görünümü</p>
        </div>
      </motion.div>

      <Stagger className="grid grid-cols-3 gap-4" staggerDelay={0.08}>
        {[
          { title: 'Video Dersler', value: stats?.totalLessons || 0, icon: Video, color: 'text-primary', bg: 'bg-primary/10' },
          { title: 'Sınavlar', value: stats?.totalExams || 0, icon: Target, color: 'text-apple-green', bg: 'bg-apple-green/10' },
          { title: 'Ödevler', value: stats?.totalHomework || 0, icon: FileText, color: 'text-apple-orange', bg: 'bg-apple-orange/10' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <MotionItem key={stat.title}>
              <HoverLift>
                <Card variant="stat" className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold">{stat.title}</span>
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </Card>
              </HoverLift>
            </MotionItem>
          );
        })}
      </Stagger>

      <FadeInView>
        <Card variant="elevated" className="p-6">
          <h3 className="font-semibold mb-4">Platform Özeti</h3>
          <p className="text-muted-foreground">
            Platformda toplam {stats?.totalLessons || 0} video ders, {stats?.totalExams || 0} sınav ve {stats?.totalHomework || 0} ödev bulunmaktadır.
          </p>
        </Card>
      </FadeInView>
    </div>
  );
};
