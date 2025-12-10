import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
} from 'lucide-react';

const classStats = [
  { class: '11-A', students: 32, attendance: 95, performance: 78 },
  { class: '11-B', students: 28, attendance: 92, performance: 82 },
  { class: '12-A', students: 30, attendance: 88, performance: 75 },
  { class: '12-B', students: 29, attendance: 94, performance: 80 },
];

const recentIssues = [
  { student: 'Ali Yılmaz', class: '11-A', issue: 'Devamsızlık uyarısı', severity: 'warning' },
  { student: 'Zeynep Kaya', class: '12-B', issue: 'Performans düşüşü', severity: 'alert' },
];

export const VicePrincipalDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold mb-2">Sınıf Takip Paneli</h1>
          <p className="text-muted-foreground">Müdür Yardımcısı Görünümü</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Öğrenci ara..."
            className="pl-10 pr-4 py-2 rounded-xl bg-surface-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-4 stagger-children">
        {classStats.map((cls) => (
          <Card key={cls.class} variant="interactive" className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold">{cls.class}</span>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Öğrenci</span>
                <span className="font-medium">{cls.students}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Devam</span>
                <span className="font-medium text-apple-green">{cls.attendance}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Performans</span>
                <span className="font-medium">{cls.performance}%</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card variant="elevated" className="p-6">
        <h3 className="font-semibold mb-4">Dikkat Gerektiren Durumlar</h3>
        <div className="space-y-3">
          {recentIssues.map((issue, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-surface-secondary">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                issue.severity === 'warning' ? 'bg-apple-orange/10' : 'bg-apple-red/10'
              }`}>
                <AlertTriangle className={`w-5 h-5 ${
                  issue.severity === 'warning' ? 'text-apple-orange' : 'text-apple-red'
                }`} />
              </div>
              <div className="flex-1">
                <p className="font-medium">{issue.student}</p>
                <p className="text-sm text-muted-foreground">{issue.class} - {issue.issue}</p>
              </div>
              <Button variant="apple" size="sm">İncele</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
