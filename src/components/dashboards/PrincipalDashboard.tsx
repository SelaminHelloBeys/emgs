import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  TrendingUp,
  Users,
  Award,
  BarChart3,
  GraduationCap,
  BookOpen,
  Target,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

const schoolMetrics = [
  { label: 'Genel Başarı', value: '78%', icon: TrendingUp, change: '+5%', positive: true },
  { label: 'Aktif Öğrenci', value: '1,180', icon: Users, change: '+23', positive: true },
  { label: 'Öğretmen Performans', value: '92%', icon: GraduationCap, change: '+3%', positive: true },
  { label: 'Platform Kullanım', value: '85%', icon: BookOpen, change: '-2%', positive: false },
];

const topTeachers = [
  { name: 'Ahmet Yılmaz', subject: 'Matematik', rating: 4.9, students: 156 },
  { name: 'Ayşe Demir', subject: 'Fizik', rating: 4.8, students: 142 },
  { name: 'Mehmet Kaya', subject: 'Kimya', rating: 4.7, students: 128 },
];

const classPerformance = [
  { class: '12-A', avg: 82, trend: 'up' },
  { class: '12-B', avg: 78, trend: 'up' },
  { class: '11-A', avg: 75, trend: 'down' },
  { class: '11-B', avg: 80, trend: 'up' },
];

export const PrincipalDashboard: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="space-y-8">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">Okul Performans Paneli</h1>
        <p className="text-muted-foreground">{profile?.school_name || 'Okul'} - Müdür Görünümü</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {schoolMetrics.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="stat" className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.positive ? 'bg-apple-green/10 text-apple-green' : 'bg-apple-red/10 text-apple-red'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card variant="elevated" className="p-6">
          <h3 className="font-semibold mb-4">En Başarılı Öğretmenler</h3>
          <div className="space-y-4">
            {topTeachers.map((teacher, index) => (
              <div key={teacher.name} className="flex items-center gap-4 p-3 rounded-xl bg-surface-secondary">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{teacher.name}</p>
                  <p className="text-sm text-muted-foreground">{teacher.subject}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-apple-orange">
                    <Award className="w-4 h-4" />
                    <span className="font-medium">{teacher.rating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{teacher.students} öğrenci</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <h3 className="font-semibold mb-4">Sınıf Performansı</h3>
          <div className="space-y-4">
            {classPerformance.map((cls) => (
              <div key={cls.class} className="flex items-center gap-4">
                <span className="font-medium w-12">{cls.class}</span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${cls.avg}%` }}
                  />
                </div>
                <div className="flex items-center gap-1 w-16">
                  <span className="font-medium">{cls.avg}%</span>
                  {cls.trend === 'up' ? 
                    <ArrowUp className="w-4 h-4 text-apple-green" /> : 
                    <ArrowDown className="w-4 h-4 text-apple-red" />
                  }
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
