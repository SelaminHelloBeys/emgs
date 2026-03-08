import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Home, Video, HelpCircle, ClipboardList, BarChart3, Settings, Upload,
  Shield, Megaphone, PenTool, Trophy, ScanLine, Heart, ExternalLink,
  Search, Layout, Eye, Users, BookOpen, GraduationCap, Bell,
  KeyRound, BadgeCheck, Terminal, FileText, Activity, Headphones,
  Clock, HeartPulse,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageItem {
  icon: React.ElementType;
  label: string;
  href: string;
  description: string;
  category: string;
  roleHint?: string;
}

const allPages: PageItem[] = [
  // Genel
  { icon: Home, label: 'Ana Sayfa (Dashboard)', href: '/dashboard', description: 'Rol bazlı ana panel - her rol farklı dashboard görür', category: 'Genel' },
  { icon: Megaphone, label: 'Duyurular', href: '/announcements', description: 'Platform duyuruları', category: 'Genel' },
  { icon: Settings, label: 'Ayarlar', href: '/settings', description: 'Kullanıcı profil ve uygulama ayarları', category: 'Genel' },
  { icon: Headphones, label: 'Destek', href: '/destek', description: 'Şikayet ve destek talebi gönder', category: 'Genel' },

  // Öğrenci Sayfaları
  { icon: Video, label: 'Konu Anlatımı', href: '/konu-anlatimi', description: 'Video dersler ve konu anlatımları', category: 'Öğrenci', roleHint: 'Öğrenci görünümü' },
  { icon: HelpCircle, label: 'Quizler', href: '/quizzes', description: 'Online quiz sistemi', category: 'Öğrenci', roleHint: 'Öğrenci görünümü' },
  { icon: ClipboardList, label: 'Ödevler', href: '/homework', description: 'Ödev takip ve teslim sistemi', category: 'Öğrenci', roleHint: 'Öğrenci/Öğretmen' },
  { icon: PenTool, label: 'Denemeler', href: '/denemeler', description: 'Deneme sınavları ve sonuçları', category: 'Öğrenci', roleHint: 'Öğrenci görünümü' },
  { icon: Trophy, label: 'Rozetlerim', href: '/rozetler', description: 'Rozet ve başarı sistemi', category: 'Öğrenci', roleHint: 'Öğrenci görünümü' },

  // Öğretmen Sayfaları
  { icon: Upload, label: 'İçerik Yükle', href: '/upload', description: 'Video, ders ve içerik yükleme paneli', category: 'Öğretmen', roleHint: 'Öğretmen/Admin' },
  { icon: ScanLine, label: 'Optik Okuyucu', href: '/optik-okuyucu', description: 'Optik form tarama ve okuma', category: 'Öğretmen', roleHint: 'Öğretmen/Admin' },

  // Veli Sayfaları
  { icon: Heart, label: 'Çocuk Takibi', href: '/cocuk-takibi', description: 'Veli çocuk izleme paneli - video, ödev, deneme takibi', category: 'Veli', roleHint: 'Veli görünümü' },

  // Yönetim - Moderasyon Alt Sayfaları
  { icon: Activity, label: 'Moderasyon - Genel Bakış', href: '/moderation?tab=overview', description: 'Platform aktivite logları', category: 'Yönetim' },
  { icon: Users, label: 'Moderasyon - Kullanıcılar', href: '/moderation?tab=users', description: 'Kullanıcı yönetimi, rol atama, silme', category: 'Yönetim' },
  { icon: KeyRound, label: 'Moderasyon - Davet Kodları', href: '/moderation?tab=codes', description: 'Davet kodu oluşturma ve yönetimi', category: 'Yönetim' },
  { icon: BadgeCheck, label: 'Moderasyon - Doğrulama', href: '/moderation?tab=verification', description: 'Kullanıcı doğrulama sistemi', category: 'Yönetim' },
  { icon: Video, label: 'Moderasyon - İçerikler', href: '/moderation?tab=content', description: 'Video ve ders içeriği yönetimi', category: 'Yönetim' },
  { icon: Bell, label: 'Moderasyon - Bildirimler', href: '/moderation?tab=notifications', description: 'Bildirim gönderme ve yönetimi', category: 'Yönetim' },
  { icon: Settings, label: 'Moderasyon - Platform Modları', href: '/moderation?tab=platform', description: 'Bakım, geliştirme, tehlike modları', category: 'Yönetim' },
  { icon: FileText, label: 'Moderasyon - Denemeler', href: '/moderation?tab=exams', description: 'Deneme sınavı veri girişi', category: 'Yönetim' },
  { icon: Terminal, label: 'Moderasyon - Terminal', href: '/moderation?tab=terminal', description: 'Admin komut terminali', category: 'Yönetim' },
  { icon: Headphones, label: 'Moderasyon - Destek Talepleri', href: '/moderation?tab=support', description: 'Kullanıcı şikayet ve destek takibi', category: 'Yönetim' },
  { icon: HeartPulse, label: 'Moderasyon - Platform Sağlığı', href: '/moderation?tab=health', description: 'Sunucu durumu, tablo boyutları, hata logları', category: 'Yönetim' },
  { icon: Clock, label: 'Moderasyon - Zamanlı Duyurular', href: '/moderation?tab=scheduled', description: 'Zamanlanmış duyuru yönetimi', category: 'Yönetim' },
  { icon: BarChart3, label: 'Analitik', href: '/analytics', description: 'İstatistik ve grafikler', category: 'Yönetim' },
  { icon: Layout, label: 'Sayfa Erişimi', href: '/sayfa-erisimi', description: 'Bu sayfa - tüm sayfalara erişim', category: 'Yönetim' },

  // Dashboard Türleri
  { icon: Shield, label: 'Süper Admin Dashboard', href: '/dashboard', description: 'yonetici rolü ana ekranı', category: 'Dashboardlar', roleHint: 'yonetici' },
  { icon: GraduationCap, label: 'Okul Admin Dashboard', href: '/dashboard', description: 'admin rolü ana ekranı', category: 'Dashboardlar', roleHint: 'admin' },
  { icon: GraduationCap, label: 'Müdür Dashboard', href: '/dashboard', description: 'mudur rolü ana ekranı', category: 'Dashboardlar', roleHint: 'mudur' },
  { icon: GraduationCap, label: 'Müdür Yardımcısı Dashboard', href: '/dashboard', description: 'mudur_yardimcisi rolü ana ekranı', category: 'Dashboardlar', roleHint: 'mudur_yardimcisi' },
  { icon: Heart, label: 'Rehber Dashboard', href: '/dashboard', description: 'rehber rolü ana ekranı', category: 'Dashboardlar', roleHint: 'rehber' },
  { icon: BookOpen, label: 'Öğretmen Dashboard', href: '/dashboard', description: 'ogretmen rolü ana ekranı', category: 'Dashboardlar', roleHint: 'ogretmen' },
  { icon: Users, label: 'Öğrenci Dashboard', href: '/dashboard', description: 'ogrenci rolü ana ekranı', category: 'Dashboardlar', roleHint: 'ogrenci' },
  { icon: Heart, label: 'Veli Dashboard', href: '/dashboard', description: 'veli rolü ana ekranı', category: 'Dashboardlar', roleHint: 'veli' },
];

const categories = ['Tümü', 'Genel', 'Öğrenci', 'Öğretmen', 'Veli', 'Yönetim', 'Dashboardlar'];

export const PageAccessPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tümü');

  if (!isAdmin) return null;

  const filtered = allPages.filter(p => {
    const matchesSearch = !search || 
      p.label.toLowerCase().includes(search.toLowerCase()) || 
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      (p.roleHint && p.roleHint.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = activeCategory === 'Tümü' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedByCategory = activeCategory === 'Tümü' 
    ? categories.slice(1).map(cat => ({
        name: cat,
        pages: filtered.filter(p => p.category === cat),
      })).filter(g => g.pages.length > 0)
    : [{ name: activeCategory, pages: filtered }];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <Layout className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Sayfa Erişimi</h1>
            <p className="text-muted-foreground">Platformdaki tüm sayfalara doğrudan erişim — {allPages.length} sayfa</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Sayfa veya rol ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              className="text-xs"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {groupedByCategory.map(group => (
        <div key={group.name} className="space-y-3">
          <h2 className="text-lg font-semibold text-muted-foreground border-b border-border/50 pb-2">{group.name}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {group.pages.map((page, idx) => {
              const Icon = page.icon;
              return (
                <Card
                  key={`${page.href}-${idx}`}
                  className="p-4 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 group border border-border/50"
                  onClick={() => navigate(page.href)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-sm truncate">{page.label}</h3>
                        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{page.description}</p>
                      {page.roleHint && (
                        <span className="inline-block text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full mt-1.5">
                          {page.roleHint}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Sonuç bulunamadı</p>
        </div>
      )}
    </div>
  );
};
