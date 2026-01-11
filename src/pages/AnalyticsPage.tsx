import React from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/hooks/useUserStats';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { useBadges } from '@/hooks/useBadges';
import {
  Award,
  Video,
  FileText,
  Target,
  Loader2,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { stats, isLoading: statsLoading } = useUserStats();
  const { watchedVideos, isLoading: videosLoading } = useVideoProgress();
  const { userBadges, isLoading: badgesLoading } = useBadges();

  const isLoading = statsLoading || videosLoading || badgesLoading;

  // Calculate real stats
  const completedVideos = watchedVideos.filter(v => v.completed).length;
  const inProgressVideos = watchedVideos.filter(v => v.progress > 0 && !v.completed).length;

  // Subject progress based on watched videos
  const subjectProgress = React.useMemo(() => {
    const subjects: Record<string, { watched: number; total: number }> = {};
    
    watchedVideos.forEach(v => {
      if (v.lesson?.subject) {
        const subject = v.lesson.subject;
        if (!subjects[subject]) {
          subjects[subject] = { watched: 0, total: 0 };
        }
        subjects[subject].total++;
        if (v.completed) {
          subjects[subject].watched++;
        }
      }
    });

    return Object.entries(subjects).map(([subject, data]) => ({
      subject,
      progress: data.total > 0 ? Math.round((data.watched / data.total) * 100) : 0,
      count: data.total,
    })).slice(0, 5);
  }, [watchedVideos]);

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
        <h1 className="text-3xl font-bold mb-2">Analitik</h1>
        <p className="text-muted-foreground">Öğrenme performansını takip et</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <Card variant="stat" className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Video className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold">{completedVideos}</div>
          <div className="text-sm text-muted-foreground">Tamamlanan Ders</div>
          {inProgressVideos > 0 && (
            <div className="text-xs text-apple-orange mt-1">+{inProgressVideos} devam ediyor</div>
          )}
        </Card>

        <Card variant="stat" className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-apple-green/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-apple-green" />
            </div>
          </div>
          <div className="text-2xl font-bold">{stats?.exams_completed || 0}</div>
          <div className="text-sm text-muted-foreground">Çözülen Sınav</div>
        </Card>

        <Card variant="stat" className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-apple-orange/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-apple-orange" />
            </div>
          </div>
          <div className="text-2xl font-bold">{stats?.homework_submitted || 0}</div>
          <div className="text-sm text-muted-foreground">Teslim Edilen Ödev</div>
        </Card>

        <Card variant="stat" className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-apple-purple/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-apple-purple" />
            </div>
          </div>
          <div className="text-2xl font-bold">{userBadges.length}</div>
          <div className="text-sm text-muted-foreground">Kazanılan Rozet</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Subject Progress */}
        <Card variant="elevated" className="p-6">
          <h3 className="font-semibold mb-6">Ders Bazlı İlerleme</h3>
          {subjectProgress.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Henüz ders izlemediniz</p>
          ) : (
            <div className="space-y-4">
              {subjectProgress.map((item) => (
                <div key={item.subject} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.subject}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.progress}%</span>
                      <span className="text-xs text-muted-foreground">({item.count} ders)</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Stats Summary */}
        <Card variant="elevated" className="p-6">
          <h3 className="font-semibold mb-6">Performans Özeti</h3>
          <div className="space-y-4">
            <div className="text-center p-6 rounded-xl bg-surface-secondary">
              <div className="text-4xl font-bold text-primary mb-2">{stats?.exams_completed || 0}</div>
              <div className="text-sm text-muted-foreground">Tamamlanan Sınav</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-surface-secondary">
              <div className="text-4xl font-bold text-apple-green mb-2">{stats?.homework_submitted || 0}</div>
              <div className="text-sm text-muted-foreground">Teslim Edilen Ödev</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card variant="elevated" className="p-6">
        <h3 className="font-semibold mb-6">Genel Özet</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 rounded-xl bg-surface-secondary">
            <div className="text-3xl font-bold text-primary mb-1">{completedVideos}</div>
            <div className="text-sm text-muted-foreground">Video Ders</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-surface-secondary">
            <div className="text-3xl font-bold text-apple-green mb-1">{stats?.exams_completed || 0}</div>
            <div className="text-sm text-muted-foreground">Sınav</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-surface-secondary">
            <div className="text-3xl font-bold text-apple-orange mb-1">{stats?.homework_submitted || 0}</div>
            <div className="text-sm text-muted-foreground">Ödev Teslim</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-surface-secondary">
            <div className="text-3xl font-bold text-apple-purple mb-1">{userBadges.length}</div>
            <div className="text-sm text-muted-foreground">Rozet</div>
          </div>
        </div>
      </Card>
    </div>
  );
};