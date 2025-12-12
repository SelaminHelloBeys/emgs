import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Bell,
  Shield,
  Globe,
  LogOut,
  ChevronRight,
  Mail,
  Phone,
  Building2,
  UserCog,
  Check,
} from 'lucide-react';
import { roleLabels } from '@/types/user';
import { cn } from '@/lib/utils';

export const SettingsPage: React.FC = () => {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    announcements: true,
    homework: true,
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const isAdminRole = role && ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi'].includes(role);

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
            <h2 className="text-xl font-semibold">{profile?.name || 'Kullanıcı'}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                {role && roleLabels[role]}
              </span>
              {profile?.school_name && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {profile.school_name}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground px-1">Bildirimler</h3>
        <Card variant="default" className="divide-y divide-border/50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Mail className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">E-posta Bildirimleri</p>
                <p className="text-sm text-muted-foreground">Haftalık özet ve duyurular</p>
              </div>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Anlık Bildirimler</p>
                <p className="text-sm text-muted-foreground">Uygulama içi bildirimler</p>
              </div>
            </div>
            <Switch
              checked={notifications.push}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Building2 className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Duyuru Bildirimleri</p>
                <p className="text-sm text-muted-foreground">Okul duyuruları</p>
              </div>
            </div>
            <Switch
              checked={notifications.announcements}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, announcements: checked }))}
            />
          </div>

          {role === 'ogrenci' && (
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Check className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Ödev Hatırlatmaları</p>
                  <p className="text-sm text-muted-foreground">Yaklaşan ödev bildirimleri</p>
                </div>
              </div>
              <Switch
                checked={notifications.homework}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, homework: checked }))}
              />
            </div>
          )}
        </Card>
      </div>

      {/* Preferences */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground px-1">Tercihler</h3>
        <Card variant="default" className="divide-y divide-border/50">
          <button className="w-full flex items-center gap-4 p-4 hover:bg-surface-secondary transition-colors first:rounded-t-2xl last:rounded-b-2xl">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <Globe className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium">Dil</p>
              <p className="text-sm text-muted-foreground">Türkçe</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </Card>
      </div>

      {/* Account Management - Extended for admin roles */}
      {isAdminRole && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground px-1">Hesap Yönetimi</h3>
          <Card variant="default" className="divide-y divide-border/50">
            <button className="w-full flex items-center gap-4 p-4 hover:bg-surface-secondary transition-colors first:rounded-t-2xl">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Shield className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Şifre Değiştir</p>
                <p className="text-sm text-muted-foreground">Hesap güvenliği</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <button className="w-full flex items-center gap-4 p-4 hover:bg-surface-secondary transition-colors">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Phone className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">İki Faktörlü Doğrulama</p>
                <p className="text-sm text-muted-foreground">Ekstra güvenlik katmanı</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center gap-4 p-4 hover:bg-surface-secondary transition-colors last:rounded-b-2xl">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <UserCog className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Hesap Bilgileri</p>
                <p className="text-sm text-muted-foreground">Profil düzenleme</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </Card>
        </div>
      )}

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
