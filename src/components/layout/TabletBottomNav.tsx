import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Home,
  Video,
  ClipboardList,
  PenTool,
  Settings,
  Shield,
  Megaphone,
  MoreHorizontal,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  roles: UserRole[];
  adminOnly?: boolean;
}

// Primary bottom nav items (max 5 shown)
const primaryItems: NavItem[] = [
  { icon: Home, label: 'Ana Sayfa', href: '/dashboard', roles: ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber', 'ogretmen', 'ogrenci', 'veli'] },
  { icon: Video, label: 'Dersler', href: '/konu-anlatimi', roles: ['ogrenci', 'ogretmen', 'yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber'] },
  { icon: ClipboardList, label: 'Ödevler', href: '/homework', roles: ['ogrenci', 'ogretmen', 'yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber'] },
  { icon: PenTool, label: 'Denemeler', href: '/denemeler', roles: ['ogrenci', 'ogretmen', 'yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber'] },
  { icon: Megaphone, label: 'Duyurular', href: '/announcements', roles: ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber', 'ogretmen', 'ogrenci', 'veli'] },
];

// All other items go in "More" sheet
const secondaryItems: NavItem[] = [
  { icon: Settings, label: 'Ayarlar', href: '/settings', roles: ['yonetici', 'admin', 'mudur', 'mudur_yardimcisi', 'rehber', 'ogretmen', 'ogrenci', 'veli'] },
  { icon: Shield, label: 'Moderasyon', href: '/moderation', roles: ['yonetici', 'admin'] },
];

export const TabletBottomNav: React.FC = () => {
  const { role, isAdmin } = useAuth();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = React.useState(false);

  const filteredPrimary = primaryItems.filter(item => {
    if (!role || !item.roles.includes(role)) return false;
    if (item.adminOnly && !isAdmin) return false;
    return true;
  }).slice(0, 4); // Max 4 + More button

  const filteredSecondary = secondaryItems.filter(item => {
    if (!role || !item.roles.includes(role)) return false;
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {filteredPrimary.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-[64px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                isActive && "bg-primary/10 scale-110"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </NavLink>
          );
        })}

        {/* More button */}
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-muted-foreground min-w-[64px]">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center">
                <MoreHorizontal className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium leading-none">Daha Fazla</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl max-h-[70vh]">
            <SheetHeader>
              <SheetTitle>Tüm Sayfalar</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-3 gap-3 py-4">
              {[...primaryItems, ...secondaryItems]
                .filter(item => {
                  if (!role || !item.roles.includes(role)) return false;
                  if (item.adminOnly && !isAdmin) return false;
                  return true;
                })
                .map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-xs font-medium text-center">{item.label}</span>
                    </NavLink>
                  );
                })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};
