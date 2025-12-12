import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  TrendingUp,
  Users,
  Video,
  FileText,
  Clock,
  Award,
  Play,
  ChevronRight,
  BookOpen,
  Target,
  Flame,
} from 'lucide-react';

// Mock data
const recentLessons = [
  { id: 1, title: 'Türev ve İntegral', subject: 'Matematik', teacher: 'Ahmet Yılmaz', duration: '45 dk', progress: 75 },
  { id: 2, title: 'Elektrik Devreleri', subject: 'Fizik', teacher: 'Ayşe Demir', duration: '30 dk', progress: 40 },
  { id: 3, title: 'Organik Kimya', subject: 'Kimya', teacher: 'Mehmet Kaya', duration: '50 dk', progress: 0 },
];

const upcomingQuizzes = [
  { id: 1, title: 'Trigonometri Testi', subject: 'Matematik', date: 'Bugün', questions: 20 },
  { id: 2, title: 'Newton Kanunları', subject: 'Fizik', date: 'Yarın', questions: 15 },
];

const stats = [
  { label: 'İzlenen Ders', value: '24', icon: Video, change: '+3 bu hafta' },
  { label: 'Çözülen Quiz', value: '12', icon: Target, change: '+2 bu hafta' },
  { label: 'Öğrenme Serisi', value: '7', icon: Flame, change: 'gün' },
  { label: 'Toplam Puan', value: '850', icon: Award, change: '+120 bu ay' },
];

export const StudentDashboard: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">
          Merhaba, {profile?.name?.split(' ')[0] || 'Öğrenci'} 👋
        </h1>
        <p className="text-muted-foreground">
          Bugün öğrenmeye hazır mısın? {profile?.class && `${profile.class} sınıfı`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {stats.map((stat, index) => {
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
            <Button variant="ghost" size="sm" className="gap-1">
              Tümünü Gör
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {recentLessons.map((lesson) => (
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
                      <span className="text-xs text-muted-foreground">
                        {lesson.duration}
                      </span>
                    </div>
                    <h3 className="font-medium truncate">{lesson.title}</h3>
                    <p className="text-sm text-muted-foreground">{lesson.teacher}</p>
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
                      <Button variant="apple" size="sm">
                        Başla
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Quizzes */}
          <Card variant="elevated" className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Yaklaşan Quizler
            </h3>
            <div className="space-y-3">
              {upcomingQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-secondary"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{quiz.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {quiz.subject} • {quiz.questions} soru
                    </p>
                  </div>
                  <div className="text-xs font-medium text-apple-orange">
                    {quiz.date}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card variant="elevated" className="p-5">
            <h3 className="font-semibold mb-4">Hızlı Erişim</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="appleSecondary" className="h-auto py-4 flex-col gap-2">
                <Video className="w-5 h-5" />
                <span className="text-xs">Shorts</span>
              </Button>
              <Button variant="appleSecondary" className="h-auto py-4 flex-col gap-2">
                <BookOpen className="w-5 h-5" />
                <span className="text-xs">Dersler</span>
              </Button>
              <Button variant="appleSecondary" className="h-auto py-4 flex-col gap-2">
                <FileText className="w-5 h-5" />
                <span className="text-xs">PDF'ler</span>
              </Button>
              <Button variant="appleSecondary" className="h-auto py-4 flex-col gap-2">
                <Target className="w-5 h-5" />
                <span className="text-xs">Quizler</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
