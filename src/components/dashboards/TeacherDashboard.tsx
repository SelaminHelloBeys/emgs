import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Stagger, MotionItem, HoverLift, appleSpring } from '@/components/motion/MotionElements';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLessons } from '@/hooks/useLessons';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import {
  Video, FileText, Users, BarChart3, Play, ChevronRight, Plus, Eye, Heart, Loader2, Target,
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
        const [lessonsRes, examsRes, homeworkRes] = await Promise.all([
          supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('created_by', user.id),
          supabase.from('trial_exams').select('id', { count: 'exact', head: true }).eq('created_by', user.id),
          supabase.from('homework_assignments').select('id', { count: 'exact', head: true }).eq('created_by', user.id),
        ]);
        setStats({ totalLessons: lessonsRes.count || 0, totalExams: examsRes.count || 0, totalHomework: homeworkRes.count || 0 });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [user]);

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
      <motion.div
        className="flex items-start justify-between"
        initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={appleSpring}
      >
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
      </motion.div>

      {/* Stats Grid */}
      <Stagger className="grid grid-cols-3 gap-4" staggerDelay={0.08}>
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <MotionItem key={stat.label}>
              <HoverLift>
                <Card variant="stat" className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              </HoverLift>
            </MotionItem>
          );
        })}
      </Stagger>

      {/* Quick Actions */}
      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.06} delay={0.1}>
        {[
          { title: 'Ders Yükle', desc: 'Video ders ekle', icon: Video, color: 'text-primary', bg: 'bg-primary/10', route: '/upload' },
          { title: 'Short Yükle', desc: 'Kısa video ekle', icon: Play, color: 'text-apple-orange', bg: 'bg-apple-orange/10', route: '/upload' },
          { title: 'PDF Yükle', desc: 'Doküman ekle', icon: FileText, color: 'text-apple-green', bg: 'bg-apple-green/10', route: '/upload' },
          { title: 'Sınav Oluştur', desc: 'Test hazırla', icon: BarChart3, color: 'text-apple-purple', bg: 'bg-apple-purple/10', route: '/denemeler' },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <MotionItem key={action.title} variant="scale">
              <HoverLift>
                <Card variant="interactive" className="p-5 text-center cursor-pointer" onClick={() => navigate(action.route)}>
                  <div className={`w-12 h-12 rounded-2xl ${action.bg} flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <h3 className="font-medium mb-1">{action.title}</h3>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </Card>
              </HoverLift>
            </MotionItem>
          );
        })}
      </Stagger>

      {/* My Lessons */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...appleSpring, delay: 0.3 }}
      >
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
            <Button variant="apple" onClick={() => navigate('/upload')}>İçerik Yükle</Button>
          </Card>
        ) : (
          <Stagger className="space-y-3">
            {myLessons.map((item) => (
              <MotionItem key={item.id} variant="slideRight">
                <Card variant="default" className="p-4">
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
              </MotionItem>
            ))}
          </Stagger>
        )}
      </motion.div>
    </div>
  );
};
