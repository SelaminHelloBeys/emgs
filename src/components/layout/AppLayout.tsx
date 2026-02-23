import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { MobileNav } from './MobileNav';
import { DevelopmentModeScreen } from '@/components/DevelopmentModeScreen';
import { MaintenanceModeScreen } from '@/components/MaintenanceModeScreen';
import { DangerModeScreen } from '@/components/DangerModeScreen';
import { PageMaintenanceScreen } from '@/components/PageMaintenanceScreen';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { usePageMaintenance } from '@/hooks/usePageMaintenance';
import { Loader2 } from 'lucide-react';

interface PlatformModes {
  development_mode: boolean;
  maintenance_mode: boolean;
  danger_detection_mode: boolean;
}

export const AppLayout: React.FC = () => {
  const { user, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isPageInMaintenance } = usePageMaintenance();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [platformModes, setPlatformModes] = useState<PlatformModes>({
    development_mode: false,
    maintenance_mode: false,
    danger_detection_mode: false,
  });
  const [dangerPassword, setDangerPassword] = useState<string | null>(null);
  const [dangerBypassed, setDangerBypassed] = useState(false);
  const [isLoadingModes, setIsLoadingModes] = useState(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);

  const isAdmin = role === 'yonetici' || role === 'admin';

  // Fake loading delay
  useEffect(() => {
    const timer = setTimeout(() => setShowLoadingScreen(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Fetch platform modes from database
  useEffect(() => {
    const fetchModes = async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('setting_key, setting_value, text_value');

      if (!error && data) {
        const modes: PlatformModes = {
          development_mode: false,
          maintenance_mode: false,
          danger_detection_mode: false,
        };
        let pwd: string | null = null;
        data.forEach((setting: any) => {
          if (setting.setting_key in modes) {
            modes[setting.setting_key as keyof PlatformModes] = setting.setting_value;
          }
          if (setting.setting_key === 'danger_detection_mode' && setting.text_value) {
            pwd = setting.text_value;
          }
        });
        setPlatformModes(modes);
        setDangerPassword(pwd);
      }
      setIsLoadingModes(false);
    };

    fetchModes();

    const channel = supabase
      .channel('platform_settings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'platform_settings' },
        () => {
          fetchModes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user || isLoadingModes || showLoadingScreen) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary shadow-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-2xl">E</span>
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">EMG yükleniyor...</p>
      </div>
    );
  }

  // Admins and yonetici are never affected by any platform modes
  if (!isAdmin) {
    if (platformModes.maintenance_mode) {
      return <MaintenanceModeScreen />;
    }

    if (platformModes.development_mode) {
      return <DevelopmentModeScreen />;
    }

    if (platformModes.danger_detection_mode && dangerPassword && !dangerBypassed) {
      return (
        <DangerModeScreen
          correctPassword={dangerPassword}
          onPasswordCorrect={() => setDangerBypassed(true)}
        />
      );
    }
  }

  // Check per-page maintenance (admins bypass)
  const maintenancePage = !isAdmin ? isPageInMaintenance(location.pathname) : undefined;

  return (
    <div className="min-h-screen bg-background">
      <TopNav onMenuClick={() => setMobileNavOpen(true)} />
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
      <div className="flex">
        <Sidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
        <main 
          className={cn(
            "flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300 p-4 sm:p-6 lg:p-8",
            sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
          )}
        >
          <div className="max-w-7xl mx-auto animate-fade-in">
            {maintenancePage ? (
              <PageMaintenanceScreen 
                pageName={maintenancePage.page_name} 
                message={maintenancePage.message} 
              />
            ) : (
              <Outlet />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
