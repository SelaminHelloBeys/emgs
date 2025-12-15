import React from 'react';
import { Wrench, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface MaintenanceModeScreenProps {
  onAdminBypass?: () => void;
}

export const MaintenanceModeScreen: React.FC<MaintenanceModeScreenProps> = ({ onAdminBypass }) => {
  const { signOut, role } = useAuth();
  const isAdmin = role === 'yonetici' || role === 'admin';

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
          <Wrench className="w-12 h-12 text-blue-500" />
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Bakım Modu
          </h1>
          <p className="text-muted-foreground text-lg">
            Platform şu anda bakımdadır. Lütfen daha sonra tekrar deneyin.
          </p>
          <p className="text-sm text-muted-foreground">
            Bakım çalışmaları en kısa sürede tamamlanacaktır.
          </p>
        </div>

        {/* Admin bypass button */}
        {isAdmin && onAdminBypass && (
          <Button 
            onClick={onAdminBypass}
            variant="apple"
            className="w-full"
          >
            Platforma Geç (Yönetici)
          </Button>
        )}

        {/* Logout button */}
        <Button 
          onClick={handleLogout}
          variant="outline"
          className="w-full gap-2"
        >
          <LogOut className="w-4 h-4" />
          Çıkış Yap
        </Button>
      </div>
    </div>
  );
};
