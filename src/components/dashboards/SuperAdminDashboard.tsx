import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Globe,
  Users,
  Building2,
  Video,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  Database,
} from 'lucide-react';

const platformStats = [
  { label: 'Toplam Kullanıcı', value: '45,892', icon: Users, change: '+12%', color: 'text-primary' },
  { label: 'Aktif Okul', value: '128', icon: Building2, change: '+5', color: 'text-apple-green' },
  { label: 'Video İçerik', value: '8,456', icon: Video, change: '+234', color: 'text-apple-orange' },
  { label: 'Günlük Aktif', value: '12,340', icon: TrendingUp, change: '+8%', color: 'text-apple-purple' },
];

const recentActions = [
  { type: 'approve', message: 'Yeni öğretmen onaylandı: Ahmet Yılmaz', time: '5 dk önce', status: 'success' },
  { type: 'warning', message: 'İçerik raporu: Uygunsuz video bildirimi', time: '15 dk önce', status: 'warning' },
  { type: 'school', message: 'Yeni okul eklendi: Atatürk Lisesi', time: '1 saat önce', status: 'success' },
  { type: 'system', message: 'Sistem güncellemesi tamamlandı', time: '3 saat önce', status: 'info' },
];

const pendingApprovals = [
  { id: 1, name: 'Mehmet Kaya', school: 'Fatih Anadolu Lisesi', role: 'Öğretmen', date: '2 saat önce' },
  { id: 2, name: 'Ayşe Demir', school: 'Atatürk Lisesi', role: 'Öğretmen', date: '5 saat önce' },
  { id: 3, name: 'Ali Yıldız', school: 'Cumhuriyet Lisesi', role: 'Admin', date: '1 gün önce' },
];

export const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold mb-2">Platform Yönetimi</h1>
          <p className="text-muted-foreground">
            EMG Sistem Yöneticisi Paneli
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Sistem Ayarları
          </Button>
          <Button variant="apple" className="gap-2">
            <Database className="w-4 h-4" />
            DNS Ayarları
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {platformStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="stat" className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="text-xs font-medium text-apple-green bg-apple-green/10 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Son İşlemler</h2>
          <Card variant="elevated" className="divide-y divide-border/50">
            {recentActions.map((action, index) => (
              <div key={index} className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  action.status === 'success' ? 'bg-apple-green/10' :
                  action.status === 'warning' ? 'bg-apple-orange/10' : 'bg-muted'
                }`}>
                  {action.status === 'success' ? <CheckCircle className="w-5 h-5 text-apple-green" /> :
                   action.status === 'warning' ? <AlertTriangle className="w-5 h-5 text-apple-orange" /> :
                   <Clock className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{action.message}</p>
                  <p className="text-xs text-muted-foreground">{action.time}</p>
                </div>
              </div>
            ))}
          </Card>

          {/* Quick Stats Chart Area */}
          <Card variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Platform Kullanımı</h3>
              <Button variant="ghost" size="sm">Son 7 Gün</Button>
            </div>
            <div className="h-48 flex items-end justify-between gap-2">
              {[65, 45, 80, 55, 90, 75, 85].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary/30"
                    style={{ height: `${height}%` }}
                  >
                    <div 
                      className="w-full bg-primary rounded-t-lg transition-all"
                      style={{ height: '60%' }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][i]}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Pending Approvals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Bekleyen Onaylar</h2>
            <span className="text-xs bg-apple-orange/10 text-apple-orange px-2 py-1 rounded-full font-medium">
              {pendingApprovals.length} bekliyor
            </span>
          </div>
          <div className="space-y-3">
            {pendingApprovals.map((item) => (
              <Card key={item.id} variant="default" className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.school}</p>
                  </div>
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">{item.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-apple-red">
                      Reddet
                    </Button>
                    <Button variant="apple" size="sm">
                      Onayla
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
