import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Upload,
  Video,
  FileText,
  Users,
  BarChart3,
  Clock,
  Play,
  ChevronRight,
  Plus,
  Eye,
  Heart,
  MessageSquare,
} from 'lucide-react';

const recentUploads = [
  { id: 1, title: 'Türev Giriş', type: 'video', views: 234, likes: 45, date: '2 saat önce' },
  { id: 2, title: 'Limit Konu Özeti', type: 'pdf', views: 156, likes: 23, date: '1 gün önce' },
  { id: 3, title: 'İntegral Formülleri', type: 'short', views: 892, likes: 156, date: '3 gün önce' },
];

const myClasses = [
  { id: 1, name: '11-A', students: 32, subject: 'Matematik', nextLesson: 'Bugün 10:00' },
  { id: 2, name: '11-B', students: 28, subject: 'Matematik', nextLesson: 'Bugün 14:00' },
  { id: 3, name: '12-A', students: 30, subject: 'Fizik', nextLesson: 'Yarın 09:00' },
];

const stats = [
  { label: 'Toplam Ders', value: '48', icon: Video, color: 'text-primary' },
  { label: 'Öğrenci', value: '156', icon: Users, color: 'text-apple-green' },
  { label: 'Görüntülenme', value: '12.4K', icon: Eye, color: 'text-apple-orange' },
  { label: 'Beğeni', value: '2.1K', icon: Heart, color: 'text-apple-red' },
];

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-start justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Hoş Geldiniz, {user?.name} 👋
          </h1>
          <p className="text-muted-foreground">
            {user?.subjects?.join(', ')} Öğretmeni • {user?.schoolName}
          </p>
        </div>
        <Button variant="apple" className="gap-2">
          <Plus className="w-4 h-4" />
          Yeni İçerik
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="stat" className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="interactive" className="p-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Video className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-medium mb-1">Ders Yükle</h3>
          <p className="text-xs text-muted-foreground">Video ders ekle</p>
        </Card>
        <Card variant="interactive" className="p-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-apple-orange/10 flex items-center justify-center mx-auto mb-3">
            <Play className="w-6 h-6 text-apple-orange" />
          </div>
          <h3 className="font-medium mb-1">Short Yükle</h3>
          <p className="text-xs text-muted-foreground">Kısa video ekle</p>
        </Card>
        <Card variant="interactive" className="p-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-apple-green/10 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-apple-green" />
          </div>
          <h3 className="font-medium mb-1">PDF Yükle</h3>
          <p className="text-xs text-muted-foreground">Doküman ekle</p>
        </Card>
        <Card variant="interactive" className="p-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-apple-purple/10 flex items-center justify-center mx-auto mb-3">
            <BarChart3 className="w-6 h-6 text-apple-purple" />
          </div>
          <h3 className="font-medium mb-1">Quiz Oluştur</h3>
          <p className="text-xs text-muted-foreground">Test hazırla</p>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Uploads */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Son Yüklemeler</h2>
            <Button variant="ghost" size="sm" className="gap-1">
              Tümünü Gör
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {recentUploads.map((item) => (
              <Card key={item.id} variant="default" className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    item.type === 'video' ? 'bg-primary/10' :
                    item.type === 'short' ? 'bg-apple-orange/10' : 'bg-apple-green/10'
                  }`}>
                    {item.type === 'video' ? <Video className="w-5 h-5 text-primary" /> :
                     item.type === 'short' ? <Play className="w-5 h-5 text-apple-orange" /> :
                     <FileText className="w-5 h-5 text-apple-green" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> {item.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" /> {item.likes}
                      </span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Düzenle
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* My Classes */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Sınıflarım</h2>
          <div className="space-y-3">
            {myClasses.map((cls) => (
              <Card key={cls.id} variant="interactive" className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-lg">{cls.name}</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">
                    {cls.students} öğrenci
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{cls.subject}</p>
                <div className="flex items-center gap-1 text-xs text-apple-green">
                  <Clock className="w-3.5 h-3.5" />
                  {cls.nextLesson}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
