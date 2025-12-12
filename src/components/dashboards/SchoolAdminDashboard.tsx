import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  UserCheck,
  Video,
  Megaphone,
  Settings,
  BarChart3,
  Clock,
  Plus,
  ChevronRight,
} from 'lucide-react';

const schoolStats = [
  { label: 'Toplam Öğretmen', value: '45', icon: UserCheck, color: 'text-primary' },
  { label: 'Toplam Öğrenci', value: '1,234', icon: Users, color: 'text-apple-green' },
  { label: 'Video İçerik', value: '456', icon: Video, color: 'text-apple-orange' },
  { label: 'Aktif Duyuru', value: '12', icon: Megaphone, color: 'text-apple-purple' },
];

const pendingTeachers = [
  { id: 1, name: 'Fatma Özkan', email: 'fatma.ozkan@okul.edu.tr', subject: 'Biyoloji', date: '1 saat önce' },
  { id: 2, name: 'Hasan Yılmaz', email: 'hasan.yilmaz@okul.edu.tr', subject: 'Tarih', date: '3 saat önce' },
];

const recentAnnouncements = [
  { id: 1, title: 'Yarıyıl Tatili Duyurusu', date: '2 gün önce', views: 456 },
  { id: 2, title: 'Veli Toplantısı', date: '1 hafta önce', views: 892 },
];

export const SchoolAdminDashboard: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold mb-2">Okul Yönetimi</h1>
          <p className="text-muted-foreground">{profile?.school_name || 'Okul'}</p>
        </div>
        <Button variant="apple" className="gap-2">
          <Plus className="w-4 h-4" />
          Duyuru Ekle
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {schoolStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="stat" className="p-5">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Teachers */}
        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Onay Bekleyen Öğretmenler</h3>
            <span className="text-xs bg-apple-orange/10 text-apple-orange px-2 py-1 rounded-full">
              {pendingTeachers.length} bekliyor
            </span>
          </div>
          <div className="space-y-4">
            {pendingTeachers.map((teacher) => (
              <div key={teacher.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary">
                <div>
                  <p className="font-medium">{teacher.name}</p>
                  <p className="text-sm text-muted-foreground">{teacher.subject}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-apple-red">Reddet</Button>
                  <Button variant="apple" size="sm">Onayla</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Announcements */}
        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Son Duyurular</h3>
            <Button variant="ghost" size="sm" className="gap-1">
              Tümü <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-4">
            {recentAnnouncements.map((ann) => (
              <div key={ann.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary">
                <div>
                  <p className="font-medium">{ann.title}</p>
                  <p className="text-sm text-muted-foreground">{ann.views} görüntülenme</p>
                </div>
                <span className="text-xs text-muted-foreground">{ann.date}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
