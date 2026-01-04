import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Home,
  PlayCircle,
  Video,
  FileText,
  HelpCircle,
  ClipboardList,
  BarChart3,
  Users,
  Building2,
  Settings,
  Upload,
  BookOpen,
  Heart,
  Shield,
  GraduationCap,
  Megaphone,
  Monitor,
  ChevronLeft,
  ChevronRight,
  PenTool,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  roles: UserRole[];
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  // Common
  { icon: Home, label: 'Ana Sayfa', href: '/dashboard', roles: ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber', 'ogretmen', 'ogrenci'] },
  
  // Content viewing - available to all but Shorts and Analitik only for admins
  { icon: PlayCircle, label: 'Shorts', href: '/shorts', roles: ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi'], adminOnly: true },
  { icon: Video, label: 'Konu Anlatımı', href: '/konu-anlatimi', roles: ['ogrenci', 'ogretmen', 'yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber'] },
  { icon: FileText, label: 'Dokümanlar', href: '/documents', roles: ['ogrenci', 'ogretmen', 'yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber'] },
  { icon: HelpCircle, label: 'Quizler', href: '/quizzes', roles: ['ogrenci', 'ogretmen', 'yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber'] },
  { icon: ClipboardList, label: 'Ödevler', href: '/homework', roles: ['ogrenci', 'ogretmen', 'yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber'] },
  { icon: PenTool, label: 'Denemeler', href: '/denemeler', roles: ['ogrenci', 'ogretmen', 'yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber'] },
  
  // Admin only - Content upload
  { icon: Upload, label: 'İçerik Yükle', href: '/upload', roles: ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi'], adminOnly: true },
  
  // Teacher specific
  { icon: BookOpen, label: 'Sınıflarım', href: '/my-classes', roles: ['ogretmen', 'yonetici', 'admin'] },
  
  // Counselor specific
  { icon: Heart, label: 'Öğrenci Takibi', href: '/student-tracking', roles: ['rehber'] },
  
  // Admin specific
  { icon: Users, label: 'Kullanıcılar', href: '/users', roles: ['admin', 'yonetici'] },
  { icon: Building2, label: 'Okullar', href: '/schools', roles: ['yonetici'] },
  { icon: Shield, label: 'Moderasyon', href: '/moderation', roles: ['yonetici', 'admin'] },
  
  // Principal specific
  { icon: GraduationCap, label: 'Okul Yönetimi', href: '/school-management', roles: ['mudur', 'mudur_yardimcisi'] },
  
  // Analytics - Admin only
  { icon: BarChart3, label: 'Analitik', href: '/analytics', roles: ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi'], adminOnly: true },
  
  // Announcements
  { icon: Megaphone, label: 'Duyurular', href: '/announcements', roles: ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber', 'ogretmen', 'ogrenci'] },
  
  // Smartboard - Admin only
  { icon: Monitor, label: 'Akıllı Tahta', href: '/smartboard', roles: ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi'], adminOnly: true },
  
  // Settings
  { icon: Settings, label: 'Ayarlar', href: '/settings', roles: ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber', 'ogretmen', 'ogrenci'] },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const { role, profile, isAdmin } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter(item => {
    // Check if user has the required role
    if (!role || !item.roles.includes(role)) return false;
    // If item is admin only, check if user is admin
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r border-border/50 transition-all duration-300 z-40 hidden lg:block",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col h-full p-4">
        {/* Collapse button */}
        <Button
          variant="ghost"
          size="iconSm"
          onClick={() => onCollapse(!collapsed)}
          className="absolute -right-3 top-6 bg-background border border-border/50 shadow-apple-sm rounded-full"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 mt-4 overflow-y-auto scrollbar-hide">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-apple-sm"
                    : "text-muted-foreground hover:bg-surface-secondary hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", collapsed && "mx-auto")} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* School info */}
        {!collapsed && profile?.school_name && (
          <div className="pt-4 border-t border-border/50">
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground">Okul</p>
              <p className="text-sm font-medium truncate">{profile.school_name}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
