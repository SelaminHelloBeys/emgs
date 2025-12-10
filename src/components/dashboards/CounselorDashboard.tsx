import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Heart,
  TrendingUp,
  TrendingDown,
  Users,
  MessageCircle,
  AlertTriangle,
  Smile,
  Meh,
  Frown,
  ChevronRight,
} from 'lucide-react';

const studentMoodData = [
  { mood: 'Mutlu', count: 892, percentage: 72, icon: Smile, color: 'text-apple-green' },
  { mood: 'Normal', count: 256, percentage: 21, icon: Meh, color: 'text-apple-orange' },
  { mood: 'Stresli', count: 86, percentage: 7, icon: Frown, color: 'text-apple-red' },
];

const concernedStudents = [
  { name: 'Ahmet Yılmaz', class: '11-A', concern: 'Akademik stres', score: 35, trend: 'down' },
  { name: 'Zeynep Kaya', class: '12-B', concern: 'Sosyal uyum', score: 42, trend: 'stable' },
  { name: 'Mehmet Demir', class: '10-C', concern: 'Motivasyon düşüklüğü', score: 38, trend: 'down' },
];

const recentSessions = [
  { student: 'Ali Yıldız', date: 'Bugün 14:00', type: 'Bireysel görüşme', status: 'scheduled' },
  { student: 'Fatma Özkan', date: 'Dün', type: 'Takip görüşmesi', status: 'completed' },
];

export const CounselorDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold mb-2">Rehberlik Paneli</h1>
          <p className="text-muted-foreground">Öğrenci Gelişim ve Destek Merkezi</p>
        </div>
        <Button variant="apple" className="gap-2">
          <MessageCircle className="w-4 h-4" />
          Yeni Görüşme
        </Button>
      </div>

      {/* Mood Overview */}
      <div className="grid grid-cols-3 gap-4 stagger-children">
        {studentMoodData.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.mood} variant="stat" className="p-5 text-center">
              <div className={`w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-muted`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div className="text-2xl font-bold mb-1">{item.percentage}%</div>
              <div className="text-sm text-muted-foreground">{item.mood}</div>
              <div className="text-xs text-muted-foreground mt-1">{item.count} öğrenci</div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Concerned Students */}
        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-apple-orange" />
              Takip Gereken Öğrenciler
            </h3>
            <Button variant="ghost" size="sm" className="gap-1">
              Tümü <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {concernedStudents.map((student) => (
              <div key={student.name} className="flex items-center gap-4 p-3 rounded-xl bg-surface-secondary">
                <div className="w-10 h-10 rounded-full bg-apple-red/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-apple-red" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-muted-foreground">{student.class} • {student.concern}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{student.score}</span>
                  {student.trend === 'down' ? 
                    <TrendingDown className="w-4 h-4 text-apple-red" /> :
                    <TrendingUp className="w-4 h-4 text-apple-green" />
                  }
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Sessions */}
        <Card variant="elevated" className="p-6">
          <h3 className="font-semibold mb-4">Son Görüşmeler</h3>
          <div className="space-y-3">
            {recentSessions.map((session, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary">
                <div>
                  <p className="font-medium">{session.student}</p>
                  <p className="text-sm text-muted-foreground">{session.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{session.date}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    session.status === 'scheduled' ? 'bg-apple-blue/10 text-apple-blue' : 'bg-apple-green/10 text-apple-green'
                  }`}>
                    {session.status === 'scheduled' ? 'Planlandı' : 'Tamamlandı'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
