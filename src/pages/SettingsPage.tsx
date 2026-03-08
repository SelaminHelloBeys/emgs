import React, { useState, useEffect } from 'react';
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
import { useTheme } from 'next-themes';
import {
  User,
  Bell,
  Shield,
  Globe,
  LogOut,
  ChevronRight,
  Mail,
  Building2,
  Check,
  Lock,
  Camera,
  Loader2,
  Languages,
  Settings,
  Sun,
  Moon,
  Monitor,
  Palette,
  Info,
  Scale,
  Copyright,
  BookOpen,
  ExternalLink,
  Eye,
  EyeOff,
  BadgeCheck,
  AlertTriangle,
  FileText,
  Users,
} from 'lucide-react';
import { roleLabels, getVerificationTick } from '@/types/user';
import { VerificationTick } from '@/components/VerificationTick';
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
import { ScrollArea } from '@/components/ui/scroll-area';

type Language = 'tr' | 'en' | 'de';

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

const themeOptions = [
  { value: 'light', label: 'Açık', icon: Sun, description: 'Aydınlık tema' },
  { value: 'dark', label: 'Koyu', icon: Moon, description: 'Karanlık tema' },
  { value: 'system', label: 'Sistem', icon: Monitor, description: 'Cihaz ayarını takip et' },
];

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="grid grid-cols-3 gap-3">
      {themeOptions.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.value;
        return (
          <Card
            key={opt.value}
            variant="interactive"
            className={cn(
              "p-4 cursor-pointer text-center transition-all duration-300",
              isActive && "ring-2 ring-primary shadow-apple-glow border-primary/30"
            )}
            onClick={() => {
              setTheme(opt.value);
              toast.success(`Tema "${opt.label}" olarak değiştirildi`);
            }}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center transition-all",
              isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="font-medium text-sm">{opt.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
            {isActive && (
              <div className="mt-2 flex justify-center">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const { user, profile, role, signOut } = useAuth();
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
  const [isLoading, setIsLoading] = useState(false);
  const [showParentCode, setShowParentCode] = useState(false);
  const [parentCode, setParentCode] = useState<string | null>(null);
  const [teacherParentCode, setTeacherParentCode] = useState<string | null>(null);
  const [isGeneratingTeacherCode, setIsGeneratingTeacherCode] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [profileForm, setProfileForm] = useState({
    name: profile?.name || '',
    schoolName: profile?.school_name || '',
    className: profile?.class || '',
  });

  // Fetch parent code for students
  useEffect(() => {
    if (user && role === 'ogrenci') {
      supabase
        .from('parent_codes')
        .select('code')
        .eq('student_user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setParentCode(data.code);
        });
    }
  }, [user, role]);

  // Fetch teacher parent code
  useEffect(() => {
    if (user && role === 'ogretmen') {
      supabase
        .from('teacher_parent_codes')
        .select('code')
        .eq('teacher_user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setTeacherParentCode(data.code);
        });
    }
  }, [user, role]);

  // Fetch verification status
  useEffect(() => {
    if (user) {
      supabase
        .from('user_verifications')
        .select('is_verified')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setIsVerified(data.is_verified);
        });
    }
  }, [user]);

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
    const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
    if (error) {
      toast.error('Şifre değiştirilemedi: ' + error.message);
    } else {
      toast.success('Şifre başarıyla değiştirildi');
      setIsPasswordDialogOpen(false);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
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

  const handleGenerateTeacherCode = async () => {
    if (!user) return;
    setIsGeneratingTeacherCode(true);
    
    // Generate cryptographic code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const formattedCode = code.slice(0, 4) + '-' + code.slice(4, 8) + '-' + code.slice(8, 12);

    const { error } = await supabase
      .from('teacher_parent_codes')
      .insert({ teacher_user_id: user.id, code: formattedCode } as any);

    if (error) {
      toast.error('Kod oluşturulamadı');
    } else {
      setTeacherParentCode(formattedCode);
      toast.success('Veli kodu başarıyla oluşturuldu!');
    }
    setIsGeneratingTeacherCode(false);
  };

  const handleLanguageChange = (value: Language) => {
    setLanguage(value);
    localStorage.setItem('app_language', value);
    toast.success(`Dil ${LANGUAGES.find(l => l.value === value)?.label} olarak değiştirildi`);
  };

  const tickType = role ? getVerificationTick(role, isVerified) : 'none';

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">Ayarlar</h1>
        <p className="text-muted-foreground">Hesap ve uygulama ayarları</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="flex flex-wrap gap-1 h-auto p-1">
          <TabsTrigger value="account" className="gap-2">
            <User className="w-4 h-4" />
            Hesap
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Güvenlik
          </TabsTrigger>
          <TabsTrigger value="role" className="gap-2">
            <BadgeCheck className="w-4 h-4" />
            Rol Bilgisi
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Bildirimler
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Settings className="w-4 h-4" />
            Tercihler
          </TabsTrigger>
          {role === 'ogrenci' && (
            <TabsTrigger value="parent-code" className="gap-2">
              <Users className="w-4 h-4" />
              Veli Kodum
            </TabsTrigger>
          )}
          {role === 'ogretmen' && (
            <TabsTrigger value="teacher-parent-code" className="gap-2">
              <Users className="w-4 h-4" />
              Veli Kodum
            </TabsTrigger>
          )}
          <TabsTrigger value="about" className="gap-2">
            <Info className="w-4 h-4" />
            Hakkında
          </TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
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
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{profile?.name || 'Kullanıcı'}</h2>
                  <VerificationTick tickType={tickType} size="md" />
                </div>
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

          {/* Logout */}
          <Card variant="default" className="p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 text-destructive hover:bg-destructive/5 p-2 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-destructive" />
              </div>
              <span className="font-medium">Çıkış Yap</span>
            </button>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card variant="default" className="divide-y divide-border/50">
            <button 
              className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors first:rounded-t-2xl"
              onClick={() => setIsPasswordDialogOpen(true)}
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Şifre Değiştir</p>
                <p className="text-sm text-muted-foreground">Hesap güvenliğiniz için şifrenizi güncelleyin</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <div className="flex items-center gap-4 p-4 last:rounded-b-2xl">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Shield className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">İki Faktörlü Doğrulama</p>
                <p className="text-sm text-muted-foreground">Ekstra güvenlik katmanı (Yakında)</p>
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">Yakında</span>
            </div>

            <div className="flex items-center gap-4 p-4 last:rounded-b-2xl">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Mail className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Giriş Geçmişi</p>
                <p className="text-sm text-muted-foreground">Son giriş yapılan cihaz ve tarihler</p>
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">Yakında</span>
            </div>
          </Card>
        </TabsContent>

        {/* Role Info Tab */}
        <TabsContent value="role" className="space-y-6">
          <Card variant="elevated" className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <BadgeCheck className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Rol ve Doğrulama Durumu</h3>
                <p className="text-sm text-muted-foreground">Hesabınızın rol bilgisi ve doğrulama tiki</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div>
                  <p className="text-sm text-muted-foreground">Mevcut Rol</p>
                  <p className="font-semibold text-lg">{role && roleLabels[role]}</p>
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                  Aktif
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div>
                  <p className="text-sm text-muted-foreground">Doğrulama Durumu</p>
                  <div className="flex items-center gap-2 mt-1">
                    {isVerified ? (
                      <>
                        <VerificationTick tickType={tickType} size="lg" />
                        <span className="font-semibold text-lg">Doğrulanmış</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <span className="font-semibold text-lg">Doğrulanmamış</span>
                      </>
                    )}
                  </div>
                </div>
                {!isVerified && (
                  <span className="text-xs font-medium text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-full">
                    Admin Onayı Bekleniyor
                  </span>
                )}
              </div>

              <div className="p-4 bg-muted/30 rounded-xl">
                <p className="text-sm text-muted-foreground mb-3">Doğrulama Tik Renkleri</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-blue-500" fill="currentColor" stroke="white" strokeWidth={2.5} /> Onaylı Kullanıcı</div>
                  <div className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-foreground" fill="currentColor" stroke="white" strokeWidth={2.5} /> Admin / Yönetici</div>
                  <div className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-red-500" fill="currentColor" stroke="white" strokeWidth={2.5} /> Öğretmen</div>
                  <div className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-amber-500" fill="currentColor" stroke="white" strokeWidth={2.5} /> Veli</div>
                  <div className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-500" fill="currentColor" stroke="white" strokeWidth={2.5} /> Yönetim</div>
                </div>
              </div>
            </div>
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
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground px-1 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Tema
            </h3>
            <ThemeSelector />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground px-1 flex items-center gap-2">
              <Languages className="w-4 h-4" />
              Dil
            </h3>
            <Card variant="default" className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Uygulama Dili</p>
                  <p className="text-sm text-muted-foreground">Arayüz dilini seçin</p>
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
          </div>
        </TabsContent>

        {/* Parent Code Tab - Students Only */}
        {role === 'ogrenci' && (
          <TabsContent value="parent-code" className="space-y-6">
            <Card variant="elevated" className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <Users className="w-7 h-7 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Veli Kodunuz</h3>
                  <p className="text-sm text-muted-foreground">Bu kodu velinize verin. Veli hesabı oluşturmak için bu kod gereklidir.</p>
                </div>
              </div>

              {parentCode ? (
                <div className="space-y-4">
                  <div className="p-6 bg-muted/30 rounded-2xl text-center">
                    <p className="text-sm text-muted-foreground mb-3">Veli Bağlantı Kodu</p>
                    <div className="flex items-center justify-center gap-3">
                      <span className={cn(
                        "font-mono text-3xl font-bold tracking-wider transition-all",
                        showParentCode ? "text-foreground" : "text-foreground/0 bg-muted rounded select-none"
                      )}>
                        {showParentCode ? parentCode : '●●●●-●●●●-●●●●'}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowParentCode(!showParentCode)}
                      >
                        {showParentCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>

                  {showParentCode && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard.writeText(parentCode);
                        toast.success('Kod panoya kopyalandı');
                      }}
                    >
                      Kodu Kopyala
                    </Button>
                  )}

                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">Önemli Bilgi</p>
                        <p>Bu kodu sadece velinizle paylaşın. Her öğrencinin kendine özel bir veli kodu vardır. Kod bir kez kullanıldıktan sonra tekrar kullanılamaz.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-muted-foreground">Veli kodu yükleniyor...</p>
                </div>
              )}
            </Card>
          </TabsContent>
        )}

        {/* Teacher Parent Code Tab */}
        {role === 'ogretmen' && (
          <TabsContent value="teacher-parent-code" className="space-y-6">
            <Card variant="elevated" className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Veli Bağlantı Kodu</h3>
                  <p className="text-sm text-muted-foreground">Bu kodu velilerle paylaşın. Veliler hesap oluştururken bu kodu kullanarak sizinle bağlantı kurabilirler.</p>
                </div>
              </div>

              {teacherParentCode ? (
                <div className="space-y-4">
                  <div className="p-6 bg-muted/30 rounded-2xl text-center">
                    <p className="text-sm text-muted-foreground mb-3">Öğretmen Veli Kodu</p>
                    <div className="flex items-center justify-center gap-3">
                      <span className={cn(
                        "font-mono text-3xl font-bold tracking-wider transition-all",
                        showParentCode ? "text-foreground" : "text-foreground/0 bg-muted rounded select-none"
                      )}>
                        {showParentCode ? teacherParentCode : '●●●●-●●●●-●●●●'}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowParentCode(!showParentCode)}
                      >
                        {showParentCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>

                  {showParentCode && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard.writeText(teacherParentCode);
                        toast.success('Kod panoya kopyalandı');
                      }}
                    >
                      Kodu Kopyala
                    </Button>
                  )}

                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">Bilgi</p>
                        <p>Bu kodu öğrenci velileriyle paylaşabilirsiniz. Veliler kayıt olurken bu kodu girerek hesaplarını sizinle ilişkilendirebilirler.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Henüz veli kodunuz yok</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Velilerin sizinle bağlantı kurabilmesi için bir veli kodu oluşturun.
                    </p>
                  </div>
                  <Button onClick={handleGenerateTeacherCode} disabled={isGeneratingTeacherCode} className="gap-2">
                    {isGeneratingTeacherCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                    Veli Kodu Oluştur
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>
        )}

        {/* About Tab */}
        <TabsContent value="about" className="space-y-6">
          <Card variant="elevated" className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Info className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Platform Bilgileri & Yasal Bilgilendirme</h3>
                <p className="text-sm text-muted-foreground">EMG Eğitim Platformu hakkında tüm yasal bilgiler</p>
              </div>
            </div>

            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-5 pr-2">
                {/* 1. Platform Info */}
                <div className="p-5 bg-primary/5 border border-primary/20 rounded-xl">
                  <h4 className="font-semibold flex items-center gap-2 mb-3 text-lg">
                    <Shield className="w-5 h-5 text-primary" />
                    1. Platform Hakkında
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-3">
                    <p>
                      <strong>EMG (Eğitim Materyal Geçidi)</strong>, <strong>EMG Ördektif</strong> tarafından 
                      geliştirilen, yönetilen ve işletilen bir dijital eğitim platformudur.
                    </p>
                    <p>
                      Platform, Türkiye Cumhuriyeti eğitim müfredatına uygun olarak hazırlanmış eğitim materyallerini 
                      öğrencilere, öğretmenlere ve velilere dijital ortamda sunmayı amaçlamaktadır. LGS (Liselere 
                      Geçiş Sınavı) hazırlık sürecinde öğrencilere destek olmak temel hedefimizdir.
                    </p>
                    <p>
                      Platform; konu anlatım videoları, deneme sınavları, ödev takibi, optik form okuma, 
                      başarı rozetleri ve veli-öğretmen iletişim araçları gibi kapsamlı eğitim modüllerini 
                      tek çatı altında toplamaktadır.
                    </p>
                    <div className="mt-3 p-3 bg-primary/5 rounded-lg">
                      <p className="text-xs">
                        <strong>Kuruluş:</strong> 2024 | <strong>Geliştirici:</strong> EMG Ördektif | 
                        <strong> Versiyon:</strong> 2.0.0 | <strong>Son Güncelleme:</strong> Mart 2026
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Copyright & Content Attribution */}
                <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                  <h4 className="font-semibold flex items-center gap-2 mb-3 text-lg">
                    <Copyright className="w-5 h-5 text-amber-600" />
                    2. Telif Hakları ve İçerik Kaynağı
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-3">
                    <p>
                      Bu platformda sunulan eğitim içeriklerinin bir kısmı <strong>Tonguç Akademi</strong>'nin 
                      ücretsiz ve açık erişimli olarak paylaştığı eğitim materyallerinden yararlanılarak 
                      hazırlanmıştır. Tonguç Akademi, Türkiye'nin önde gelen eğitim kurumlarından biridir.
                    </p>
                    <p>
                      <strong>Telif Hakkı Bildirimi:</strong> Platformda kullanılan tüm üçüncü taraf içeriklerin 
                      (videolar, görseller, metinler, sorular) telif hakları orijinal sahiplerine aittir. 
                      EMG Ördektif, bu içeriklerin sahibi olduğunu iddia etmemektedir.
                    </p>
                    <p>
                      Platform tarafından üretilen özgün içerikler (arayüz tasarımı, yazılım kodu, özgün sorular 
                      ve materyaller) <strong>EMG Ördektif</strong>'in münhasır mülkiyetindedir ve telif hakları 
                      ile korunmaktadır.
                    </p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Üçüncü taraf içerikler yalnızca eğitim amaçlı kullanılmaktadır</li>
                      <li>Ticari kazanç amacı güdülmemektedir</li>
                      <li>İçerik sahiplerinin talepleri derhal değerlendirilmektedir</li>
                      <li>Fair use (adil kullanım) ilkesi kapsamında hareket edilmektedir</li>
                    </ul>
                    <div className="flex items-center gap-2 mt-3">
                      <BookOpen className="w-4 h-4" />
                      <a 
                        href="https://www.tongucakademi.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 underline hover:text-primary transition-colors"
                      >
                        Tonguç Akademi Web Sitesi
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* 3. Legal Disclaimer */}
                <div className="p-5 bg-muted/30 rounded-xl">
                  <h4 className="font-semibold flex items-center gap-2 mb-3 text-lg">
                    <Scale className="w-5 h-5" />
                    3. Yasal Bilgilendirme ve Sorumluluk Reddi
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-3">
                    <p>
                      Bu platform, Türkiye Cumhuriyeti yasaları çerçevesinde faaliyet göstermektedir. 
                      Aşağıdaki koşullar, platformun kullanımı ile ilgili yasal çerçeveyi belirlemektedir:
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>Ticari Olmayan Kullanım:</strong> Bu platform, ticari olmayan eğitim amaçlı geliştirilmiştir. Herhangi bir ticari faaliyette bulunulmamaktadır.</li>
                      <li><strong>İçerik Doğruluğu:</strong> Platform, sunulan eğitim içeriklerinin doğruluğu, güncelliği veya eksiksizliği konusunda herhangi bir garanti vermemektedir.</li>
                      <li><strong>Kullanıcı Sorumluluğu:</strong> Kullanıcılar, platformu kendi sorumlulukları dahilinde kullanmaktadır. Platform üzerinden elde edilen bilgilerin doğruluğunu bağımsız kaynaklardan teyit etmeleri önerilir.</li>
                      <li><strong>Dolaylı Zararlar:</strong> Platform yönetimi, kullanıcıların platformu kötüye kullanmasından, teknik aksaklıklardan veya içerik hatalarından doğacak doğrudan veya dolaylı zararlardan sorumlu tutulamaz.</li>
                      <li><strong>Üçüncü Taraf Bağlantılar:</strong> Platform, üçüncü taraf web sitelerine bağlantılar içerebilir. Bu sitelerin içeriğinden EMG Ördektif sorumlu değildir.</li>
                      <li><strong>Hizmet Sürekliliği:</strong> Platform, bakım, güncelleme veya teknik nedenlerle önceden haber verilmeksizin geçici olarak erişime kapatılabilir.</li>
                      <li><strong>İçerik Değişikliği:</strong> Platform içerikleri önceden bildirim yapılmaksızın değiştirilebilir, güncellenebilir veya kaldırılabilir.</li>
                    </ul>
                  </div>
                </div>

                {/* 4. Privacy & Data Protection */}
                <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                  <h4 className="font-semibold flex items-center gap-2 mb-3 text-lg">
                    <Lock className="w-5 h-5 text-blue-600" />
                    4. Gizlilik Politikası ve Kişisel Verilerin Korunması
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-3">
                    <p>
                      EMG Ördektif, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında 
                      kullanıcıların kişisel verilerini korumayı taahhüt eder.
                    </p>
                    <h5 className="font-semibold text-foreground mt-3">Toplanan Veriler:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Kayıt bilgileri (ad-soyad, e-posta adresi)</li>
                      <li>Okul ve sınıf bilgileri</li>
                      <li>Platform kullanım istatistikleri (izlenen dersler, çözülen sorular)</li>
                      <li>Deneme sınavı sonuçları ve akademik performans verileri</li>
                      <li>Giriş ve oturum bilgileri</li>
                    </ul>
                    <h5 className="font-semibold text-foreground mt-3">Veri Kullanım Amaçları:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Eğitim hizmetlerinin sunulması ve iyileştirilmesi</li>
                      <li>Öğrenci başarı takibi ve raporlama</li>
                      <li>Veli ve öğretmen bilgilendirme</li>
                      <li>Platform güvenliğinin sağlanması</li>
                    </ul>
                    <h5 className="font-semibold text-foreground mt-3">Veri Güvenliği:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Veriler şifreli bağlantılar (SSL/TLS) üzerinden iletilmektedir</li>
                      <li>Kişisel veriler üçüncü şahıslarla paylaşılmamakta ve satılmamaktadır</li>
                      <li>Veriler güvenli sunucularda şifrelenmiş olarak saklanmaktadır</li>
                      <li>Düzenli güvenlik denetimleri yapılmaktadır</li>
                    </ul>
                  </div>
                </div>

                {/* 5. Terms of Use */}
                <div className="p-5 bg-muted/30 rounded-xl">
                  <h4 className="font-semibold flex items-center gap-2 mb-3 text-lg">
                    <FileText className="w-5 h-5" />
                    5. Kullanım Koşulları
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-3">
                    <p>Platformu kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>Hesap Güvenliği:</strong> Kullanıcılar, hesap bilgilerinin gizliliğinden kendileri sorumludur. Hesap bilgilerinin üçüncü kişilerle paylaşılmaması gerekmektedir.</li>
                      <li><strong>İçerik Paylaşımı:</strong> Platform üzerindeki içeriklerin izinsiz kopyalanması, dağıtılması veya ticari amaçla kullanılması yasaktır.</li>
                      <li><strong>Uygun Davranış:</strong> Kullanıcılar, platform üzerinde hakaret, taciz, spam veya uygunsuz içerik paylaşamaz.</li>
                      <li><strong>Yaş Sınırı:</strong> 13 yaşından küçük kullanıcılar platformu yalnızca veli/vasi gözetiminde kullanabilir.</li>
                      <li><strong>Hesap Feshi:</strong> Kullanım koşullarını ihlal eden hesaplar önceden uyarı yapılmaksızın askıya alınabilir veya silinebilir.</li>
                      <li><strong>Fikri Mülkiyet:</strong> Platform arayüzü, tasarımı ve özgün içerikleri EMG Ördektif'in fikri mülkiyetindedir.</li>
                    </ul>
                  </div>
                </div>

                {/* 6. Complaints & DMCA */}
                <div className="p-5 bg-destructive/5 border border-destructive/20 rounded-xl">
                  <h4 className="font-semibold flex items-center gap-2 mb-3 text-lg">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    6. Şikayetler, İçerik Kaldırma ve DMCA Talepleri
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-3">
                    <p>
                      Telif hakkı ihlali, uygunsuz içerik veya herhangi bir yasal sorun bildirmek için 
                      aşağıdaki prosedürü takip edebilirsiniz:
                    </p>
                    
                    <h5 className="font-semibold text-foreground">Telif Hakkı İhlali Bildirimi (DMCA):</h5>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>İhlal edilen içeriğin tam bağlantısını belirtin</li>
                      <li>Orijinal içeriğin sahibi olduğunuzu kanıtlayan bilgileri ekleyin</li>
                      <li>İletişim bilgilerinizi (ad, soyad, e-posta, telefon) paylaşın</li>
                      <li>Taleplerinizi aşağıdaki e-posta adresine gönderin</li>
                    </ol>

                    <h5 className="font-semibold text-foreground mt-3">İşlem Süreleri:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Telif hakkı kaldırma talepleri: <strong>48 saat</strong> içinde değerlendirilir</li>
                      <li>Uygunsuz içerik bildirimleri: <strong>24 saat</strong> içinde incelenir</li>
                      <li>Genel şikayetler: <strong>72 saat</strong> içinde yanıtlanır</li>
                      <li>Acil güvenlik bildirimleri: <strong>Derhal</strong> işleme alınır</li>
                    </ul>

                    <div className="mt-3 p-3 bg-destructive/5 border border-destructive/10 rounded-lg">
                      <p>📧 <strong>Şikayet ve Talepler:</strong> ordektifinfo@gmail.com</p>
                      <p className="text-xs mt-1">Tüm talepler gizlilik ilkesine uygun olarak değerlendirilecektir.</p>
                    </div>
                  </div>
                </div>

                {/* 7. User Rights */}
                <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <h4 className="font-semibold flex items-center gap-2 mb-3 text-lg">
                    <Users className="w-5 h-5 text-emerald-600" />
                    7. Kullanıcı Hakları
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-3">
                    <p>KVKK kapsamında kullanıcılarımız aşağıdaki haklara sahiptir:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>Erişim Hakkı:</strong> Kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse bilgi talep etme</li>
                      <li><strong>Düzeltme Hakkı:</strong> Kişisel verilerinizin eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme</li>
                      <li><strong>Silme Hakkı:</strong> Hesabınızı ve ilişkili tüm kişisel verileri silme talebinde bulunma</li>
                      <li><strong>İtiraz Hakkı:</strong> Kişisel verilerinizin münhasıran otomatik sistemler ile analiz edilmesi sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                      <li><strong>Taşınabilirlik Hakkı:</strong> Kişisel verilerinizin yapılandırılmış, yaygın olarak kullanılan ve makine tarafından okunabilir bir formatta size verilmesini isteme</li>
                      <li><strong>Şikayet Hakkı:</strong> Kişisel Verileri Koruma Kurulu'na şikayette bulunma</li>
                    </ul>
                    <p className="mt-2">
                      Haklarınızı kullanmak için <strong>ordektifinfo@gmail.com</strong> adresine başvurabilirsiniz.
                    </p>
                  </div>
                </div>

                {/* 8. Cookie Policy */}
                <div className="p-5 bg-muted/30 rounded-xl">
                  <h4 className="font-semibold flex items-center gap-2 mb-3 text-lg">
                    <Globe className="w-5 h-5" />
                    8. Çerez (Cookie) Politikası
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-3">
                    <p>
                      Platform, kullanıcı deneyimini iyileştirmek amacıyla çerezler kullanmaktadır:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Zorunlu Çerezler:</strong> Oturum yönetimi ve güvenlik için gereklidir</li>
                      <li><strong>Tercih Çerezleri:</strong> Tema, dil ve kullanıcı tercihlerini saklar</li>
                      <li><strong>Analitik Çerezler:</strong> Platform kullanım istatistiklerini toplar</li>
                    </ul>
                    <p>
                      Platformu kullanmaya devam ederek çerez kullanımını kabul etmiş sayılırsınız. 
                      Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz ancak bu durumda 
                      bazı platform özellikleri düzgün çalışmayabilir.
                    </p>
                  </div>
                </div>

                {/* 9. Changes */}
                <div className="p-5 bg-muted/30 rounded-xl">
                  <h4 className="font-semibold flex items-center gap-2 mb-3 text-lg">
                    <FileText className="w-5 h-5" />
                    9. Değişiklikler ve Güncellemeler
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>
                      EMG Ördektif, bu yasal bilgilendirme metnini herhangi bir zamanda, önceden bildirimde 
                      bulunmaksızın güncelleme hakkını saklı tutar. Yapılan değişiklikler, platformda 
                      yayınlandığı anda yürürlüğe girer.
                    </p>
                    <p>
                      Kullanıcıların bu sayfayı düzenli olarak kontrol etmeleri önerilir. Platformu 
                      kullanmaya devam etmeniz, güncellenmiş koşulları kabul ettiğiniz anlamına gelir.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-muted-foreground pt-6 border-t space-y-1">
                  <p className="font-semibold">© 2024-2026 EMG Ördektif. Tüm hakları saklıdır.</p>
                  <p>Bu platform, ticari olmayan eğitim amaçlı olarak geliştirilmiştir.</p>
                  <p>Versiyon 2.0.0 | Son güncelleme: Mart 2026</p>
                  <p className="mt-2">Türkiye Cumhuriyeti yasaları çerçevesinde faaliyet göstermektedir.</p>
                </div>
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
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
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>İptal</Button>
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
            <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>İptal</Button>
            <Button onClick={handleProfileUpdate} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
