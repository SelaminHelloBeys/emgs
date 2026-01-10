import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { MobileNav } from './MobileNav';
import { DevelopmentModeScreen } from '@/components/DevelopmentModeScreen';
import { MaintenanceModeScreen } from '@/components/MaintenanceModeScreen';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface PlatformModes {
  development_mode: boolean;
  maintenance_mode: boolean;
  danger_detection_mode: boolean;
}

export const AppLayout: React.FC = () => {
  const { user, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [platformModes, setPlatformModes] = useState<PlatformModes>({
    development_mode: false,
    maintenance_mode: false,
    danger_detection_mode: false,
  });
  const [isLoadingModes, setIsLoadingModes] = useState(true);

  const isAdmin = role === 'yonetici' || role === 'admin';

  // Fetch platform modes from database
  useEffect(() => {
    const fetchModes = async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('setting_key, setting_value');

      if (!error && data) {
        const modes: PlatformModes = {
          development_mode: false,
          maintenance_mode: false,
          danger_detection_mode: false,
        };
        data.forEach((setting) => {
          if (setting.setting_key in modes) {
            modes[setting.setting_key as keyof PlatformModes] = setting.setting_value;
          }
        });
        setPlatformModes(modes);
      }
      setIsLoadingModes(false);
    };

    fetchModes();

    // Subscribe to realtime changes
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

  if (!isAuthenticated || !user || isLoadingModes) {
    return null;
  }

  // Admins and yonetici are never affected by any platform modes
  if (!isAdmin) {
    if (platformModes.maintenance_mode) {
      return <MaintenanceModeScreen />;
    }

    if (platformModes.development_mode) {
      return <DevelopmentModeScreen />;
    }
  }

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
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
