import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { LegalDisclaimerMini } from '@/components/LegalDisclaimer';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Home,
  Video,
  HelpCircle,
  ClipboardList,
  BarChart3,
  Settings,
  Upload,
  Heart,
  Shield,
  GraduationCap,
  Megaphone,
  PenTool,
  Trophy,
} from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  roles: UserRole[];
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Ana Sayfa', href: '/dashboard', roles: ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber', 'ogretmen', 'ogrenci'] },
  { icon: Video, label: 'Konu Anlatımı', href: '/konu-anlatimi', roles: ['ogrenci', 'ogretmen', 'yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber'] },
  { icon: HelpCircle, label: 'Quizler', href: '/quizzes', roles: ['ogrenci', 'ogretmen', 'yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber'] },
  { icon: ClipboardList, label: 'Ödevler', href: '/homework', roles: ['ogrenci', 'ogretmen', 'yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber'] },
  { icon: PenTool, label: 'Denemeler', href: '/denemeler', roles: ['ogrenci', 'ogretmen', 'yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber'] },
  { icon: Trophy, label: 'Rozetlerim', href: '/rozetler', roles: ['ogrenci', 'ogretmen', 'yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber'] },
  { icon: Upload, label: 'İçerik Yükle', href: '/upload', roles: ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi'], adminOnly: true },
  { icon: Heart, label: 'Öğrenci Takibi', href: '/student-tracking', roles: ['rehber'] },
  { icon: Shield, label: 'Moderasyon', href: '/moderation', roles: ['yonetici', 'admin'] },
  { icon: GraduationCap, label: 'Okul Yönetimi', href: '/school-management', roles: ['mudur', 'mudur_yardimcisi'] },
  { icon: BarChart3, label: 'Analitik', href: '/analytics', roles: ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi'], adminOnly: true },
  { icon: Megaphone, label: 'Duyurular', href: '/announcements', roles: ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber', 'ogretmen', 'ogrenci'] },
  { icon: Settings, label: 'Ayarlar', href: '/settings', roles: ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber', 'ogretmen', 'ogrenci'] },
];

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ open, onOpenChange }) => {
  const { role, profile, isAdmin } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter(item => {
    if (!role || !item.roles.includes(role)) return false;
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">E</span>
            </div>
            <SheetTitle className="text-lg">EMG Platform</SheetTitle>
          </div>
        </SheetHeader>
        
        <div className="flex flex-col h-[calc(100vh-80px)]">
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-apple-sm"
                      : "text-muted-foreground hover:bg-surface-secondary hover:text-foreground active:bg-surface-secondary"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border/50">
            {profile?.school_name && (
              <div className="px-3 py-2 mb-2">
                <p className="text-xs text-muted-foreground">Okul</p>
                <p className="text-sm font-medium truncate">{profile.school_name}</p>
              </div>
            )}
            <LegalDisclaimerMini />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
