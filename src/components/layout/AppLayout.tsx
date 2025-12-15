import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { DevelopmentModeScreen } from '@/components/DevelopmentModeScreen';
import { cn } from '@/lib/utils';

// Development mode flag - only admin can bypass
const DEVELOPMENT_MODE = true;

export const AppLayout: React.FC = () => {
  const { user, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [adminBypassed, setAdminBypassed] = React.useState(false);

  const isAdmin = role === 'yonetici' || role === 'admin';

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  // Show development mode screen if enabled and user hasn't bypassed (or isn't admin)
  if (DEVELOPMENT_MODE && !adminBypassed) {
    return (
      <DevelopmentModeScreen 
        onAdminBypass={isAdmin ? () => setAdminBypassed(true) : undefined} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex">
        <Sidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
        <main 
          className={cn(
            "flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300 p-6 lg:p-8",
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
