import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Video, BookOpen, PenTool, ClipboardList, Trophy, Clock, 
  TrendingUp, CheckCircle, XCircle, Minus, Users, BarChart3 
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ChildStats {
  lessonsWatched: number;
  totalWatchTime: number;
  homeworkSubmitted: number;
  examsCompleted: number;
}

interface WatchedVideo {
  lesson_id: string;
  progress: number;
  completed: boolean;
  last_watched_at: string;
  lesson?: { title: string; subject: string; duration: string | null };
}

interface ExamResult {
  exam_id: string;
  participated: boolean;
  correct_count: number | null;
  wrong_count: number | null;
  blank_count: number | null;
  net_score: number | null;
  class_rank: number | null;
  general_rank: number | null;
  exam?: { title: string; exam_date: string };
}

interface HomeworkStatus {
  homework_id: string;
  status: string;
  grade: number | null;
  submitted_at: string;
  homework?: { title: string; subject: string; due_date: string };
}

export const ParentTrackingPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [childName, setChildName] = useState<string>('');
  const [childId, setChildId] = useState<string | null>(null);
  const [stats, setStats] = useState<ChildStats>({ lessonsWatched: 0, totalWatchTime: 0, homeworkSubmitted: 0, examsCompleted: 0 });
  const [videos, setVideos] = useState<WatchedVideo[]>([]);
  const [exams, setExams] = useState<ExamResult[]>([]);
  const [homework, setHomework] = useState<HomeworkStatus[]>([]);
  const [badges, setBadges] = useState<{ name: string; icon: string; earned_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchChildData = async () => {
      setLoading(true);
      
      // Find linked student via parent_codes
      const { data: parentCode } = await supabase
        .from('parent_codes')
        .select('student_user_id')
        .eq('parent_user_id', user.id)
        .eq('is_used', true)
        .maybeSingle();

      if (!parentCode) {
        setLoading(false);
        return;
      }

      const studentId = parentCode.student_user_id;
      setChildId(studentId);

      // Fetch all data in parallel
      const [profileRes, statsRes, videosRes, examsRes, homeworkRes, badgesRes] = await Promise.all([
        supabase.from('profiles').select('name').eq('user_id', studentId).maybeSingle(),
        supabase.from('user_stats').select('*').eq('user_id', studentId).maybeSingle(),
        supabase.from('video_watch_progress').select('*').eq('user_id', studentId).order('last_watched_at', { ascending: false }).limit(20),
        supabase.from('student_exam_participation').select('*').eq('user_id', studentId).order('created_at', { ascending: false }),
        supabase.from('homework_submissions').select('*').eq('user_id', studentId).order('submitted_at', { ascending: false }),
        supabase.from('user_badges').select('badge_id, earned_at').eq('user_id', studentId),
      ]);

      if (profileRes.data) setChildName(profileRes.data.name);
      
      if (statsRes.data) {
        setStats({
          lessonsWatched: statsRes.data.lessons_watched,
          totalWatchTime: statsRes.data.total_watch_time,
          homeworkSubmitted: statsRes.data.homework_submitted,
          examsCompleted: statsRes.data.exams_completed,
        });
      }

      // Enrich videos with lesson info
      if (videosRes.data && videosRes.data.length > 0) {
        const lessonIds = videosRes.data.map(v => v.lesson_id);
        const { data: lessons } = await supabase.from('lessons').select('id, title, subject, duration').in('id', lessonIds);
        const lessonMap = new Map(lessons?.map(l => [l.id, l]) || []);
        setVideos(videosRes.data.map(v => ({ ...v, lesson: lessonMap.get(v.lesson_id) as any })));
      }

      // Enrich exams
      if (examsRes.data && examsRes.data.length > 0) {
        const examIds = examsRes.data.map(e => e.exam_id);
        const { data: examDetails } = await supabase.from('trial_exams').select('id, title, exam_date').in('id', examIds);
        const examMap = new Map(examDetails?.map(e => [e.id, e]) || []);
        setExams(examsRes.data.map(e => ({ ...e, exam: examMap.get(e.exam_id) as any })));
      }

      // Enrich homework
      if (homeworkRes.data && homeworkRes.data.length > 0) {
        const hwIds = homeworkRes.data.map(h => h.homework_id);
        const { data: hwDetails } = await supabase.from('homework_assignments').select('id, title, subject, due_date').in('id', hwIds);
        const hwMap = new Map(hwDetails?.map(h => [h.id, h]) || []);
        setHomework(homeworkRes.data.map(h => ({ ...h, homework: hwMap.get(h.homework_id) as any })));
      }

      // Enrich badges
      if (badgesRes.data && badgesRes.data.length > 0) {
        const badgeIds = badgesRes.data.map(b => b.badge_id);
        const { data: badgeDetails } = await supabase.from('badges').select('id, name, icon').in('id', badgeIds);
        const badgeMap = new Map(badgeDetails?.map(b => [b.id, b]) || []);
        setBadges(badgesRes.data.map(b => {
          const detail = badgeMap.get(b.badge_id);
          return { name: detail?.name || '', icon: detail?.icon || '🏆', earned_at: b.earned_at || '' };
        }));
      }

      setLoading(false);
    };

    fetchChildData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!childId) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Çocuk Takibi</h1>
          <p className="text-muted-foreground">Çocuğunuzun gelişimini buradan takip edebilirsiniz.</p>
        </div>
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Bağlı Öğrenci Bulunamadı</h2>
          <p className="text-muted-foreground">Henüz bir öğrenci hesabına bağlanmamışsınız. Öğrencinizden veli kodunu alarak bağlantı kurabilirsiniz.</p>
        </Card>
      </div>
    );
  }

  const formatWatchTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} dk`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h} sa ${m} dk`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">{childName} - Gelişim Takibi</h1>
        <p className="text-muted-foreground">Çocuğunuzun akademik ilerlemesini buradan izleyebilirsiniz.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Video className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">İzlenen</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold">{stats.lessonsWatched}</p>
          <p className="text-xs text-muted-foreground">video</p>
        </Card>
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">Süre</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold">{formatWatchTime(stats.totalWatchTime)}</p>
          <p className="text-xs text-muted-foreground">toplam izleme</p>
        </Card>
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">Ödev</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold">{stats.homeworkSubmitted}</p>
          <p className="text-xs text-muted-foreground">teslim edildi</p>
        </Card>
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <PenTool className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">Deneme</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold">{stats.examsCompleted}</p>
          <p className="text-xs text-muted-foreground">tamamlandı</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="videos" className="space-y-4">
        <TabsList className="flex flex-wrap gap-1 h-auto p-1">
          <TabsTrigger value="videos" className="gap-1.5 text-xs sm:text-sm">
            <Video className="w-4 h-4" /> İzlenen Videolar
          </TabsTrigger>
          <TabsTrigger value="exams" className="gap-1.5 text-xs sm:text-sm">
            <PenTool className="w-4 h-4" /> Deneme Sonuçları
          </TabsTrigger>
          <TabsTrigger value="homework" className="gap-1.5 text-xs sm:text-sm">
            <ClipboardList className="w-4 h-4" /> Ödevler
          </TabsTrigger>
          <TabsTrigger value="badges" className="gap-1.5 text-xs sm:text-sm">
            <Trophy className="w-4 h-4" /> Rozetler
          </TabsTrigger>
        </TabsList>

        {/* Videos */}
        <TabsContent value="videos" className="space-y-3">
          {videos.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">Henüz izlenen video yok</Card>
          ) : (
            videos.map((v, i) => (
              <Card key={i} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{v.lesson?.title || 'Bilinmeyen Ders'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{v.lesson?.subject}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(v.last_watched_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={v.progress} className="flex-1 h-2" />
                    <span className="text-xs font-medium">{v.progress}%</span>
                  </div>
                </div>
                {v.completed && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
              </Card>
            ))
          )}
        </TabsContent>

        {/* Exams */}
        <TabsContent value="exams" className="space-y-3">
          {exams.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">Henüz deneme verisi yok</Card>
          ) : (
            exams.map((e, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">{e.exam?.title || 'Deneme'}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.exam?.exam_date ? new Date(e.exam.exam_date).toLocaleDateString('tr-TR') : ''}
                    </p>
                  </div>
                  <Badge variant={e.participated ? 'default' : 'secondary'}>
                    {e.participated ? 'Katıldı' : 'Katılmadı'}
                  </Badge>
                </div>
                {e.participated && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <p className="text-xs text-muted-foreground">Doğru</p>
                      <p className="font-bold text-emerald-600">{e.correct_count ?? 0}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <p className="text-xs text-muted-foreground">Yanlış</p>
                      <p className="font-bold text-red-600">{e.wrong_count ?? 0}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">Boş</p>
                      <p className="font-bold">{e.blank_count ?? 0}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-primary/10">
                      <p className="text-xs text-muted-foreground">Net</p>
                      <p className="font-bold text-primary">{e.net_score ?? 0}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <p className="text-xs text-muted-foreground">Sınıf Sıra</p>
                      <p className="font-bold text-amber-600">{e.class_rank ?? '-'}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <p className="text-xs text-muted-foreground">Genel Sıra</p>
                      <p className="font-bold text-purple-600">{e.general_rank ?? '-'}</p>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        {/* Homework */}
        <TabsContent value="homework" className="space-y-3">
          {homework.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">Henüz ödev teslimi yok</Card>
          ) : (
            homework.map((h, i) => (
              <Card key={i} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{h.homework?.title || 'Ödev'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{h.homework?.subject}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(h.submitted_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant={h.status === 'graded' ? 'default' : 'secondary'} className="text-xs">
                    {h.status === 'graded' ? 'Notlandı' : h.status === 'submitted' ? 'Teslim Edildi' : h.status}
                  </Badge>
                  {h.grade != null && (
                    <p className="text-lg font-bold mt-1">{h.grade}</p>
                  )}
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Badges */}
        <TabsContent value="badges" className="space-y-3">
          {badges.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">Henüz kazanılmış rozet yok</Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {badges.map((b, i) => (
                <Card key={i} className="p-4 text-center">
                  <span className="text-3xl">{b.icon}</span>
                  <p className="font-medium mt-2 text-sm">{b.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {b.earned_at ? new Date(b.earned_at).toLocaleDateString('tr-TR') : ''}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
