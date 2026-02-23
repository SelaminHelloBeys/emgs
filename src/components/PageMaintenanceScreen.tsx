import React from 'react';
import { Wrench, HardHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PageMaintenanceScreenProps {
  pageName: string;
  message?: string | null;
}

export const PageMaintenanceScreen: React.FC<PageMaintenanceScreenProps> = ({ pageName, message }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
      <div className="relative">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
          <Wrench className="w-12 h-12 text-primary" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-accent rounded-full flex items-center justify-center border-4 border-background">
          <HardHat className="w-5 h-5 text-accent-foreground" />
        </div>
      </div>

      <div className="space-y-3 max-w-lg">
        <h2 className="text-3xl font-bold text-foreground">
          {pageName} Şu Anda Bakımda
        </h2>
        <p className="text-lg text-muted-foreground">
          Ekibimiz bu sayfa üzerinde çalışıyor. En kısa sürede tekrar erişime açılacaktır.
        </p>
        {message && message !== 'Bu sayfa şu anda bakımdadır.' && (
          <div className="mt-4 p-4 rounded-xl bg-muted border text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Geliştirici Notu:</p>
            <p>{message}</p>
          </div>
        )}
      </div>

      <Button variant="outline" size="lg" onClick={() => navigate('/dashboard')} className="gap-2">
        Ana Sayfaya Dön
      </Button>
    </div>
  );
};
