import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { useUserStats } from '@/hooks/useUserStats';
import { useLessons } from '@/hooks/useLessons';
import { useBadges } from '@/hooks/useBadges';
import { useTrialExams } from '@/hooks/useTrialExams';
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
  Search,
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

// LGS Scoring
const calcLGSPuan = (net: number) => Math.max(0, (net / 90) * 500);

export const StudentDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { watchedVideos, isLoading: progressLoading } = useVideoProgress();
  const { stats, isLoading: statsLoading } = useUserStats();
  const { lessons, isLoading: lessonsLoading } = useLessons();
  const { userBadges, isLoading: badgesLoading } = useBadges();
  const { exams, isLoading: examsLoading } = useTrialExams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Trial exam stats
  const participatedExams = exams.filter(e => e.participation?.participated);
  const avgNet = participatedExams.length > 0
    ? participatedExams.reduce((acc, e) => acc + (e.participation?.net_score || 0), 0) / participatedExams.length
    : 0;
  const bestNet = participatedExams.length > 0
    ? Math.max(...participatedExams.map(e => e.participation?.net_score || 0))
    : 0;
  const avgLGS = calcLGSPuan(avgNet);
  const bestLGS = calcLGSPuan(bestNet);

  // Trend data sorted by date
  const trendData = participatedExams
    .sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime())
    .map(e => ({
      name: e.title.length > 12 ? e.title.slice(0, 12) + '...' : e.title,
      net: e.participation?.net_score || 0,
      lgs: calcLGSPuan(e.participation?.net_score || 0),
      dogru: e.participation?.correct_count || 0,
      yanlis: e.participation?.wrong_count || 0,
      bos: e.participation?.blank_count || 0,
    }));

  const netTrend = trendData.length >= 2
    ? trendData[trendData.length - 1].net - trendData[trendData.length - 2].net
    : 0;

  // Performance analysis
  const totalCorrect = participatedExams.reduce((a, e) => a + (e.participation?.correct_count || 0), 0);
  const totalWrong = participatedExams.reduce((a, e) => a + (e.participation?.wrong_count || 0), 0);
  const totalBlank = participatedExams.reduce((a, e) => a + (e.participation?.blank_count || 0), 0);
  const totalQuestions = totalCorrect + totalWrong + totalBlank;
  const successRate = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100) : 0;

  // Risk analysis - warning if wrong answers > 30% or blank > 20%
  const wrongRate = totalQuestions > 0 ? (totalWrong / totalQuestions) * 100 : 0;
  const blankRate = totalQuestions > 0 ? (totalBlank / totalQuestions) * 100 : 0;
  const riskWarnings: string[] = [];
  if (wrongRate > 30) riskWarnings.push(`Yanlış oranı yüksek (%${wrongRate.toFixed(0)}). Emin olmadığın soruları boş bırakmayı düşün.`);
  if (blankRate > 25) riskWarnings.push(`Boş bırakma oranı yüksek (%${blankRate.toFixed(0)}). Daha fazla konu çalışman gerekebilir.`);
  if (participatedExams.length >= 3 && netTrend < -5) riskWarnings.push('Son denemelerde düşüş trendi var. Çalışma planını gözden geçir.');

  // Doğru/Yanlış/Boş dağılımı chart data
  const distributionData = [
    { name: 'Doğru', value: totalCorrect, color: '#22c55e' },
    { name: 'Yanlış', value: totalWrong, color: '#ef4444' },
    { name: 'Boş', value: totalBlank, color: '#a1a1aa' },
  ];

  // Continue learning
  const continueLearning = watchedVideos
    .filter(v => v.progress > 0 && v.progress < 100 && v.lesson)
    .slice(0, 3);

  const newLessons = lessons
    .filter(lesson => !watchedVideos.some(w => w.lesson_id === lesson.id))
    .slice(0, 3);

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

  const filteredLessons = searchQuery
    ? lessons.filter(l => 
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.subject.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const completedVideos = watchedVideos.filter(v => v.completed).length;
  const recentBadges = userBadges.slice(0, 3);

  const statsData = [
    { label: 'İzlenen Ders', value: completedVideos, icon: Video, change: 'ders' },
    { label: 'Girilen Deneme', value: participatedExams.length, icon: Target, change: 'deneme' },
    { label: 'Teslim Edilen Ödev', value: stats?.homework_submitted || 0, icon: Flame, change: 'ödev' },
    { label: 'Kazanılan Rozet', value: userBadges.length, icon: Award, change: 'rozet' },
  ];

  const isLoading = progressLoading || statsLoading || lessonsLoading || badgesLoading || examsLoading;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
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
                  className="w-full p-3 text-left hover:bg-muted flex items-center gap-3"
                  onClick={() => { navigate('/konu-anlatimi'); setSearchQuery(''); }}
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
            </Card>
          );
        })}
      </div>

      {/* Deneme Stats & LGS */}
      {participatedExams.length > 0 && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="p-5 text-center">
              <p className="text-2xl font-bold text-primary">{avgNet.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-1">Ort. Net</p>
            </Card>
            <Card className="p-5 text-center">
              <p className="text-2xl font-bold text-green-600">{bestNet.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-1">En İyi Net</p>
            </Card>
            <Card className="p-5 text-center">
              <p className="text-2xl font-bold text-blue-600">{avgLGS.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-1">Ort. LGS Puan</p>
            </Card>
            <Card className="p-5 text-center">
              <p className="text-2xl font-bold text-emerald-600">{bestLGS.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-1">En İyi LGS</p>
            </Card>
            <Card className="p-5 text-center">
              <div className="flex items-center justify-center gap-1">
                <p className="text-2xl font-bold">{netTrend >= 0 ? '+' : ''}{netTrend.toFixed(1)}</p>
                {netTrend >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Son Değişim</p>
            </Card>
          </div>

          {/* Risk Warnings */}
          {riskWarnings.length > 0 && (
            <Card className="p-4 border-amber-200 bg-amber-50/50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-amber-800">Riskli Kazanım Uyarıları</h4>
                  {riskWarnings.map((w, i) => (
                    <p key={i} className="text-sm text-amber-700">• {w}</p>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Net & LGS Trend */}
            {trendData.length >= 2 && (
              <Card className="p-5">
                <h3 className="font-semibold mb-4">Zaman Bazlı Gelişim</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                      formatter={(value: number, name: string) => {
                        const labels: Record<string, string> = { net: 'Net', lgs: 'LGS Puan', dogru: 'Doğru', yanlis: 'Yanlış' };
                        return [typeof value === 'number' ? value.toFixed(1) : value, labels[name] || name];
                      }}
                    />
                    <Line type="monotone" dataKey="net" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="net" />
                    <Line type="monotone" dataKey="lgs" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} name="lgs" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* D/Y/B Distribution */}
            {totalQuestions > 0 && (
              <Card className="p-5">
                <h3 className="font-semibold mb-4">Doğru / Yanlış / Boş Dağılımı</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={distributionData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {distributionData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-2 text-sm">
                  <span className="text-green-600 font-medium">Başarı: %{successRate.toFixed(0)}</span>
                  <span className="text-red-500">Yanlış: %{wrongRate.toFixed(0)}</span>
                  <span className="text-muted-foreground">Boş: %{blankRate.toFixed(0)}</span>
                </div>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
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
              <Button variant="apple" onClick={() => navigate('/konu-anlatimi')}>Derslere Git</Button>
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
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{lesson.subject}</span>
                        {lesson.duration && <span className="text-xs text-muted-foreground">{lesson.duration}</span>}
                      </div>
                      <h3 className="font-medium truncate">{lesson.title}</h3>
                    </div>
                    <div className="hidden sm:block">
                      {lesson.progress > 0 ? (
                        <div className="w-24">
                          <div className="text-xs text-muted-foreground mb-1 text-right">%{lesson.progress}</div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${lesson.progress}%` }} />
                          </div>
                        </div>
                      ) : (
                        <Button variant="apple" size="sm" onClick={() => navigate('/konu-anlatimi')}>Başla</Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {recentBadges.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Son Kazanılan Rozetler</h2>
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/rozetler')}>
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
          <Card variant="elevated" className="p-5">
            <h3 className="font-semibold mb-4">İlerleme Özeti</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">İzlenen Videolar</span>
                  <span className="font-medium">{completedVideos}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min((completedVideos / 10) * 100, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Girilen Denemeler</span>
                  <span className="font-medium">{participatedExams.length}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min((participatedExams.length / 5) * 100, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Kazanılan Rozetler</span>
                  <span className="font-medium">{userBadges.length}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min((userBadges.length / 10) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
