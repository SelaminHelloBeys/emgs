import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
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
  Lock,
  Camera,
  Loader2,
  Languages,
  Users,
  Settings,
  Video,
  FileText,
} from 'lucide-react';
import { roleLabels } from '@/types/user';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { UserManagementPanel } from '@/components/admin/UserManagementPanel';
import { ContentManagementPanel } from '@/components/admin/ContentManagementPanel';
import { NotificationManagementPanel } from '@/components/admin/NotificationManagementPanel';
import { PlatformModesPanel } from '@/components/admin/PlatformModesPanel';
import { ExamParticipationPanel } from '@/components/admin/ExamParticipationPanel';
import { PageMaintenancePanel } from '@/components/admin/PageMaintenancePanel';

type Language = 'tr' | 'en' | 'de';

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

export const SettingsPage: React.FC = () => {
  const { user, profile, role, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    announcements: true,
    homework: true,
  });

  const [language, setLanguage] = useState<Language>('tr');
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [is2FADialogOpen, setIs2FADialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    name: profile?.name || '',
    schoolName: profile?.school_name || '',
    className: profile?.class || '',
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalı');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPassword
    });

    if (error) {
      toast.error('Şifre değiştirilemedi: ' + error.message);
    } else {
      toast.success('Şifre başarıyla değiştirildi');
      setIsPasswordDialogOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
    setIsLoading(false);
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    setIsLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        name: profileForm.name,
        school_name: profileForm.schoolName,
        class: profileForm.className,
      })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Profil güncellenemedi');
    } else {
      toast.success('Profil güncellendi');
      setIsProfileDialogOpen(false);
    }
    setIsLoading(false);
  };

  const handleLanguageChange = (value: Language) => {
    setLanguage(value);
    localStorage.setItem('app_language', value);
    toast.success(`Dil ${LANGUAGES.find(l => l.value === value)?.label} olarak değiştirildi`);
  };

  const isAdminRole = role && ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi'].includes(role);

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">Ayarlar</h1>
        <p className="text-muted-foreground">Hesap ve uygulama ayarları</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="account" className="gap-2">
            <User className="w-4 h-4" />
            Hesap
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Bildirimler
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Settings className="w-4 h-4" />
            Tercihler
          </TabsTrigger>
          {isAdminRole && (
            <TabsTrigger value="admin" className="gap-2">
              <Shield className="w-4 h-4" />
              Yönetim
            </TabsTrigger>
          )}
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          {/* Profile Card */}
          <Card variant="elevated" className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Camera className="w-3 h-3" />
                </button>
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
              <Button variant="outline" onClick={() => setIsProfileDialogOpen(true)}>
                Düzenle
              </Button>
            </div>
          </Card>

          {/* Security Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground px-1">Güvenlik</h3>
            <Card variant="default" className="divide-y divide-border/50">
              <button 
                className="w-full flex items-center gap-4 p-4 hover:bg-surface-secondary transition-colors first:rounded-t-2xl"
                onClick={() => setIsPasswordDialogOpen(true)}
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">Şifre Değiştir</p>
                  <p className="text-sm text-muted-foreground">Hesap güvenliği</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              
              <button 
                className="w-full flex items-center gap-4 p-4 hover:bg-surface-secondary transition-colors last:rounded-b-2xl"
                onClick={() => setIs2FADialogOpen(true)}
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">İki Faktörlü Doğrulama</p>
                  <p className="text-sm text-muted-foreground">Ekstra güvenlik katmanı</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </Card>
          </div>

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
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
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
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card variant="default" className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Languages className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Dil</p>
                <p className="text-sm text-muted-foreground">Uygulama dilini seçin</p>
              </div>
              <Select value={language} onValueChange={(v) => handleLanguageChange(v as Language)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>
        </TabsContent>

        {/* Admin Tab */}
        {isAdminRole && (
          <TabsContent value="admin" className="space-y-6">
            <Tabs defaultValue="users">
              <TabsList>
                <TabsTrigger value="users" className="gap-2">
                  <Users className="w-4 h-4" />
                  Kullanıcılar
                </TabsTrigger>
                <TabsTrigger value="content" className="gap-2">
                  <Video className="w-4 h-4" />
                  İçerikler
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="w-4 h-4" />
                  Bildirimler
                </TabsTrigger>
                <TabsTrigger value="platform" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Platform
                </TabsTrigger>
                <TabsTrigger value="exams" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Denemeler
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="mt-6">
                <UserManagementPanel />
              </TabsContent>

              <TabsContent value="content" className="mt-6">
                <ContentManagementPanel />
              </TabsContent>

              <TabsContent value="notifications" className="mt-6">
                <NotificationManagementPanel />
              </TabsContent>

              <TabsContent value="platform" className="mt-6 space-y-6">
                <PlatformModesPanel />
                <PageMaintenancePanel />
              </TabsContent>

              <TabsContent value="exams" className="mt-6">
                <ExamParticipationPanel />
              </TabsContent>
            </Tabs>
          </TabsContent>
        )}
      </Tabs>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Şifre Değiştir</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Yeni Şifre</Label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="En az 6 karakter"
              />
            </div>
            <div>
              <Label>Şifreyi Onayla</Label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Şifreyi tekrar girin"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handlePasswordChange} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Değiştir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Edit Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profili Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ad Soyad</Label>
              <Input
                value={profileForm.name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Okul Adı</Label>
              <Input
                value={profileForm.schoolName}
                onChange={(e) => setProfileForm(prev => ({ ...prev, schoolName: e.target.value }))}
              />
            </div>
            <div>
              <Label>Sınıf</Label>
              <Input
                value={profileForm.className}
                onChange={(e) => setProfileForm(prev => ({ ...prev, className: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleProfileUpdate} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Dialog */}
      <Dialog open={is2FADialogOpen} onOpenChange={setIs2FADialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İki Faktörlü Doğrulama</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground mb-4">
              İki faktörlü doğrulama henüz aktif değil. Bu özellik yakında kullanıma sunulacak.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIs2FADialogOpen(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
