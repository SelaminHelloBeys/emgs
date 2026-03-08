import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Video,
  HelpCircle,
  ClipboardList,
  BarChart3,
  Settings,
  Upload,
  Shield,
  Megaphone,
  PenTool,
  Trophy,
  ScanLine,
  Heart,
  ExternalLink,
  Search,
  Layout,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageItem {
  icon: React.ElementType;
  label: string;
  href: string;
  description: string;
  category: string;
}

const allPages: PageItem[] = [
  { icon: Home, label: 'Ana Sayfa (Dashboard)', href: '/dashboard', description: 'Rol bazlı ana panel', category: 'Genel' },
  { icon: Video, label: 'Konu Anlatımı', href: '/konu-anlatimi', description: 'Video dersler ve içerikler', category: 'Eğitim' },
  { icon: HelpCircle, label: 'Quizler', href: '/quizzes', description: 'Online quiz sistemi', category: 'Eğitim' },
  { icon: ClipboardList, label: 'Ödevler', href: '/homework', description: 'Ödev takip ve teslim', category: 'Eğitim' },
  { icon: PenTool, label: 'Denemeler', href: '/denemeler', description: 'Deneme sınavları', category: 'Eğitim' },
  { icon: Trophy, label: 'Rozetler', href: '/rozetler', description: 'Rozet ve başarı sistemi', category: 'Eğitim' },
  { icon: Upload, label: 'İçerik Yükle', href: '/upload', description: 'Video/içerik yükleme', category: 'Yönetim' },
  { icon: ScanLine, label: 'Optik Okuyucu', href: '/optik-okuyucu', description: 'Optik form okuyucu', category: 'Araçlar' },
  { icon: Heart, label: 'Çocuk Takibi', href: '/cocuk-takibi', description: 'Veli çocuk takip paneli', category: 'Takip' },
  { icon: Shield, label: 'Moderasyon', href: '/moderation', description: 'Platform yönetimi', category: 'Yönetim' },
  { icon: Shield, label: 'Moderasyon - Kullanıcılar', href: '/moderation?tab=users', description: 'Kullanıcı yönetimi', category: 'Yönetim' },
  { icon: Shield, label: 'Moderasyon - Davet Kodları', href: '/moderation?tab=codes', description: 'Davet kodu sistemi', category: 'Yönetim' },
  { icon: Shield, label: 'Moderasyon - Doğrulama', href: '/moderation?tab=verification', description: 'Kullanıcı doğrulama', category: 'Yönetim' },
  { icon: Shield, label: 'Moderasyon - İçerikler', href: '/moderation?tab=content', description: 'İçerik yönetimi', category: 'Yönetim' },
  { icon: Shield, label: 'Moderasyon - Bildirimler', href: '/moderation?tab=notifications', description: 'Bildirim yönetimi', category: 'Yönetim' },
  { icon: Shield, label: 'Moderasyon - Platform Modları', href: '/moderation?tab=platform', description: 'Platform mod ayarları', category: 'Yönetim' },
  { icon: Shield, label: 'Moderasyon - Denemeler', href: '/moderation?tab=exams', description: 'Deneme yönetimi', category: 'Yönetim' },
  { icon: Shield, label: 'Moderasyon - Terminal', href: '/moderation?tab=terminal', description: 'Admin terminali', category: 'Yönetim' },
  { icon: BarChart3, label: 'Analitik', href: '/analytics', description: 'İstatistik ve grafikler', category: 'Yönetim' },
  { icon: Megaphone, label: 'Duyurular', href: '/announcements', description: 'Platform duyuruları', category: 'Genel' },
  { icon: Settings, label: 'Ayarlar', href: '/settings', description: 'Kullanıcı ayarları', category: 'Genel' },
  { icon: Layout, label: 'Sayfa Erişimi (Bu Sayfa)', href: '/sayfa-erisimi', description: 'Tüm sayfalara erişim', category: 'Yönetim' },
];

const categories = ['Tümü', 'Genel', 'Eğitim', 'Yönetim', 'Araçlar', 'Takip'];

export const PageAccessPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tümü');

  if (!isAdmin) return null;

  const filtered = allPages.filter(p => {
    const matchesSearch = !search || p.label.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'Tümü' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <Layout className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Sayfa Erişimi</h1>
            <p className="text-muted-foreground">Platformdaki tüm sayfalara doğrudan erişim</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Sayfa ara..."
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((page) => {
          const Icon = page.icon;
          return (
            <Card
              key={page.href}
              className="p-5 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 group border border-border/50"
              onClick={() => navigate(page.href)}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm truncate">{page.label}</h3>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{page.description}</p>
                  <span className="inline-block text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-2">
                    {page.category}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Sonuç bulunamadı</p>
        </div>
      )}
    </div>
  );
};