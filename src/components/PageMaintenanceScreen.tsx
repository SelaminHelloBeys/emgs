import React from 'react';
import { Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PageMaintenanceScreenProps {
  pageName: string;
  message?: string | null;
}

export const PageMaintenanceScreen: React.FC<PageMaintenanceScreenProps> = ({ pageName, message }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
      <div className="w-20 h-20 bg-orange-100 dark:bg-orange-500/10 rounded-full flex items-center justify-center animate-pulse">
        <Wrench className="w-10 h-10 text-orange-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          {pageName} Bakımda
        </h2>
        <p className="text-muted-foreground max-w-md">
          {message || 'Bu sayfa şu anda bakımdadır. Lütfen daha sonra tekrar deneyin.'}
        </p>
      </div>
      <Button variant="outline" onClick={() => navigate('/dashboard')}>
        Ana Sayfaya Dön
      </Button>
    </div>
  );
};
