import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { useUserStats } from '@/hooks/useUserStats';
import { useLessons } from '@/hooks/useLessons';
import { useBadges } from '@/hooks/useBadges';
import { useNavigate } from 'react-router-dom';
import { LastMinuteMode } from '@/components/LastMinuteMode';
import { LearningStyleQuickButton } from '@/components/LearningStyleSelector';
import {
  Video,
  Target,
  Flame,
  Award,
  Play,
  ChevronRight,
  BookOpen,
  FileText,
  Search,
  Loader2,
  Trophy,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const StudentDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { watchedVideos, isLoading: progressLoading } = useVideoProgress();
  const { stats, isLoading: statsLoading } = useUserStats();
  const { lessons, isLoading: lessonsLoading } = useLessons();
  const { userBadges, isLoading: badgesLoading } = useBadges();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Get continue learning lessons (in progress)
  const continueLearning = watchedVideos
    .filter(v => v.progress > 0 && v.progress < 100 && v.lesson)
    .slice(0, 3);

  // Get new lessons user hasn't started
  const newLessons = lessons
    .filter(lesson => !watchedVideos.some(w => w.lesson_id === lesson.id))
    .slice(0, 3);

  // Combine for display
  const displayLessons = [
    ...continueLearning.map(v => ({
      id: v.lesson_id,
      title: v.lesson?.title || '',
      subject: v.lesson?.subject || '',
      duration: v.lesson?.duration || '',
      progress: v.progress
    })),
    ...newLessons.map(l => ({
      id: l.id,
      title: l.title,
      subject: l.subject,
      duration: l.duration || '',
      progress: 0
    }))
  ].slice(0, 3);

  // Filter lessons by search
  const filteredLessons = searchQuery
    ? lessons.filter(l => 
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.subject.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Get completed videos count
  const completedVideos = watchedVideos.filter(v => v.completed).length;

  // Get recent badges (last 3)
  const recentBadges = userBadges.slice(0, 3);

  const statsData = [
    { label: 'İzlenen Ders', value: completedVideos, icon: Video, change: 'ders' },
    { label: 'Çözülen Deneme', value: stats?.exams_completed || 0, icon: Target, change: 'deneme' },
    { label: 'Teslim Edilen Ödev', value: stats?.homework_submitted || 0, icon: Flame, change: 'ödev' },
    { label: 'Kazanılan Rozet', value: userBadges.length, icon: Award, change: 'rozet' },
  ];

  const isLoading = progressLoading || statsLoading || lessonsLoading || badgesLoading;

  return (
    <div className="space-y-8">
      {/* Welcome Header with Actions */}
      <div className="animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Merhaba, {profile?.name?.split(' ')[0] || 'Öğrenci'} 👋
            </h1>
            <p className="text-muted-foreground">
              Bugün öğrenmeye hazır mısın? {profile?.class && `${profile.class} sınıfı`}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <LearningStyleQuickButton />
            <LastMinuteMode />
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Ders, video veya konu ara..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && filteredLessons.length > 0 && (
            <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-60 overflow-auto">
              {filteredLessons.slice(0, 5).map(lesson => (
                <button
                  key={lesson.id}
                  className="w-full p-3 text-left hover:bg-surface-secondary flex items-center gap-3"
                  onClick={() => {
                    navigate('/lessons');
                    setSearchQuery('');
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Play className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground">{lesson.subject}</p>
                  </div>
                </button>
              ))}
            </Card>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="stat" className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className="text-xs text-apple-green mt-1">{stat.change}</div>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Öğrenmeye Devam Et</h2>
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/konu-anlatimi')}>
              Tümünü Gör
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : displayLessons.length === 0 ? (
            <Card variant="elevated" className="p-8 text-center">
              <Video className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium mb-1">Henüz ders izlemediniz</h3>
              <p className="text-sm text-muted-foreground mb-4">Derslere göz atarak öğrenmeye başlayın</p>
              <Button variant="apple" onClick={() => navigate('/konu-anlatimi')}>
                Derslere Git
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {displayLessons.map((lesson) => (
                <Card key={lesson.id} variant="interactive" className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <Play className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {lesson.subject}
                        </span>
                        {lesson.duration && (
                          <span className="text-xs text-muted-foreground">
                            {lesson.duration}
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium truncate">{lesson.title}</h3>
                    </div>
                    <div className="hidden sm:block">
                      {lesson.progress > 0 ? (
                        <div className="w-24">
                          <div className="text-xs text-muted-foreground mb-1 text-right">
                            %{lesson.progress}
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${lesson.progress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <Button variant="apple" size="sm" onClick={() => navigate('/konu-anlatimi')}>
                          Başla
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Recent Badges Section */}
          {recentBadges.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Son Kazanılan Rozetler</h2>
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/badges')}>
                  Tümünü Gör
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {recentBadges.map((ub) => (
                  <Card key={ub.id} className="p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mx-auto flex items-center justify-center text-2xl mb-2">
                      {ub.badge?.icon || '🏆'}
                    </div>
                    <p className="font-medium text-sm truncate">{ub.badge?.name}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Progress Summary */}
          <Card variant="elevated" className="p-5">
            <h3 className="font-semibold mb-4">İlerleme Özeti</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">İzlenen Videolar</span>
                  <span className="font-medium">{completedVideos}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${Math.min((completedVideos / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Tamamlanan Sınavlar</span>
                  <span className="font-medium">{stats?.exams_completed || 0}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${Math.min(((stats?.exams_completed || 0) / 5) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Kazanılan Rozetler</span>
                  <span className="font-medium">{userBadges.length}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full transition-all"
                    style={{ width: `${Math.min((userBadges.length / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};
