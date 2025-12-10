import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Bell,
  Shield,
  Moon,
  Globe,
  LogOut,
  ChevronRight,
  Mail,
  Phone,
  Building2,
} from 'lucide-react';
import { roleLabels } from '@/types/user';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const settingsSections = [
    {
      title: 'Bildirimler',
      items: [
        { icon: Bell, label: 'Bildirim Tercihleri', description: 'E-posta ve uygulama bildirimleri' },
        { icon: Mail, label: 'E-posta Bildirimleri', description: 'Haftalık özet ve duyurular' },
      ]
    },
    {
      title: 'Güvenlik',
      items: [
        { icon: Shield, label: 'Şifre Değiştir', description: 'Hesap güvenliği' },
        { icon: Phone, label: 'İki Faktörlü Doğrulama', description: 'Ekstra güvenlik katmanı' },
      ]
    },
    {
      title: 'Tercihler',
      items: [
        { icon: Globe, label: 'Dil', description: 'Türkçe' },
      ]
    },
  ];

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">Ayarlar</h1>
        <p className="text-muted-foreground">Hesap ve uygulama ayarları</p>
      </div>

      {/* Profile Card */}
      <Card variant="elevated" className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                {user?.role && roleLabels[user.role]}
              </span>
              {user?.schoolName && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {user.schoolName}
                </span>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm">
            Düzenle
          </Button>
        </div>
      </Card>

      {/* Settings Sections */}
      {settingsSections.map((section) => (
        <div key={section.title} className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground px-1">{section.title}</h3>
          <Card variant="default" className="divide-y divide-border/50">
            {section.items.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  className="w-full flex items-center gap-4 p-4 hover:bg-surface-secondary transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              );
            })}
          </Card>
        </div>
      ))}

      {/* Logout */}
      <Card variant="default" className="p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 text-apple-red hover:bg-apple-red/5 p-2 rounded-xl transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-apple-red/10 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-apple-red" />
          </div>
          <span className="font-medium">Çıkış Yap</span>
        </button>
      </Card>
    </div>
  );
};
