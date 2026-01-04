import React from 'react';
import { BadgesDisplay } from '@/components/BadgesDisplay';

export const BadgesPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Başarı Rozetleri</h1>
        <p className="text-muted-foreground">
          Video izleyerek, sınav tamamlayarak ve ödev göndererek rozetler kazan!
        </p>
      </div>
      
      <BadgesDisplay showAll={true} />
    </div>
  );
};
