import React from 'react';
import { Construction, Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface DevelopmentModeScreenProps {
  onAdminBypass?: () => void;
}

export const DevelopmentModeScreen: React.FC<DevelopmentModeScreenProps> = ({ onAdminBypass }) => {
  const { role, signOut } = useAuth();
  const isAdmin = role === 'yonetici' || role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Animated Construction Icon */}
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-full w-32 h-32 flex items-center justify-center border border-primary/20">
            <Construction className="w-16 h-16 text-primary animate-pulse" />
          </div>
        </div>

        {/* Main Message */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Geliştirme Aşamasında
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Platform şu anda geliştirme aşamasındadır. Yakında tüm özellikler aktif olacaktır.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Settings className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
            <span className="font-medium">Sistem Bakımda</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Ekibimiz platformu sizin için hazırlıyor. Lütfen daha sonra tekrar deneyin.
          </p>
        </div>

        {/* Admin Bypass Button */}
        {isAdmin && (
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Yönetici erişimi algılandı</span>
            </div>
            <Button 
              onClick={onAdminBypass}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Platforma Geç (Yönetici)
            </Button>
          </div>
        )}

        {/* Sign Out */}
        <Button 
          variant="ghost" 
          onClick={signOut}
          className="text-muted-foreground hover:text-foreground"
        >
          Çıkış Yap
        </Button>
      </div>
    </div>
  );
};
