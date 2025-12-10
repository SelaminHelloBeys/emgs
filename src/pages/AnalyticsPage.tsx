import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Award,
  BookOpen,
  Video,
  FileText,
  BarChart3,
} from 'lucide-react';

const weeklyData = [
  { day: 'Pzt', lessons: 3, quizzes: 1, hours: 2.5 },
  { day: 'Sal', lessons: 2, quizzes: 0, hours: 1.5 },
  { day: 'Çar', lessons: 4, quizzes: 2, hours: 3.0 },
  { day: 'Per', lessons: 1, quizzes: 1, hours: 1.0 },
  { day: 'Cum', lessons: 3, quizzes: 0, hours: 2.0 },
  { day: 'Cmt', lessons: 0, quizzes: 0, hours: 0 },
  { day: 'Paz', lessons: 2, quizzes: 1, hours: 1.5 },
];

const subjectProgress = [
  { subject: 'Matematik', progress: 78, change: 5, trend: 'up' },
  { subject: 'Fizik', progress: 65, change: -2, trend: 'down' },
  { subject: 'Kimya', progress: 82, change: 8, trend: 'up' },
  { subject: 'Tarih', progress: 71, change: 3, trend: 'up' },
  { subject: 'İngilizce', progress: 88, change: 4, trend: 'up' },
];

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const maxHours = Math.max(...weeklyData.map(d => d.hours));

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
            <span className="text-xs font-medium text-apple-green bg-apple-green/10 px-2 py-1 rounded-full">
              +12%
            </span>
          </div>
          <div className="text-2xl font-bold">156</div>
          <div className="text-sm text-muted-foreground">İzlenen Ders</div>
        </Card>

        <Card variant="stat" className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-apple-green/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-apple-green" />
            </div>
            <span className="text-xs font-medium text-apple-green bg-apple-green/10 px-2 py-1 rounded-full">
              +8%
            </span>
          </div>
          <div className="text-2xl font-bold">42</div>
          <div className="text-sm text-muted-foreground">Çözülen Quiz</div>
        </Card>

        <Card variant="stat" className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-apple-orange/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-apple-orange" />
            </div>
          </div>
          <div className="text-2xl font-bold">48.5</div>
          <div className="text-sm text-muted-foreground">Toplam Saat</div>
        </Card>

        <Card variant="stat" className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-apple-purple/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-apple-purple" />
            </div>
          </div>
          <div className="text-2xl font-bold">78%</div>
          <div className="text-sm text-muted-foreground">Ortalama Başarı</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <Card variant="elevated" className="p-6">
          <h3 className="font-semibold mb-6">Haftalık Aktivite</h3>
          <div className="h-48 flex items-end justify-between gap-2">
            {weeklyData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-primary/10 rounded-t-lg relative overflow-hidden"
                  style={{ height: `${(day.hours / maxHours) * 100}%`, minHeight: '8px' }}
                >
                  <div 
                    className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all"
                    style={{ height: `${(day.lessons / 4) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary" />
              <span className="text-muted-foreground">Dersler</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary/30" />
              <span className="text-muted-foreground">Toplam Saat</span>
            </div>
          </div>
        </Card>

        {/* Subject Progress */}
        <Card variant="elevated" className="p-6">
          <h3 className="font-semibold mb-6">Ders Bazlı İlerleme</h3>
          <div className="space-y-4">
            {subjectProgress.map((subject) => (
              <div key={subject.subject} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{subject.subject}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{subject.progress}%</span>
                    <span className={`flex items-center text-xs ${
                      subject.trend === 'up' ? 'text-apple-green' : 'text-apple-red'
                    }`}>
                      {subject.trend === 'up' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {subject.change > 0 ? '+' : ''}{subject.change}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card variant="elevated" className="p-6">
        <h3 className="font-semibold mb-6">Bu Ay</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 rounded-xl bg-surface-secondary">
            <div className="text-3xl font-bold text-primary mb-1">24</div>
            <div className="text-sm text-muted-foreground">Aktif Gün</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-surface-secondary">
            <div className="text-3xl font-bold text-apple-green mb-1">89</div>
            <div className="text-sm text-muted-foreground">Video Ders</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-surface-secondary">
            <div className="text-3xl font-bold text-apple-orange mb-1">23</div>
            <div className="text-sm text-muted-foreground">Quiz</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-surface-secondary">
            <div className="text-3xl font-bold text-apple-purple mb-1">7</div>
            <div className="text-sm text-muted-foreground">Ödev Teslim</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
