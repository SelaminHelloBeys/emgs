import React from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search, BookOpen } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="text-center max-w-md">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-[10rem] font-bold leading-none text-muted-foreground/10 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Search className="w-12 h-12 text-primary" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold mb-3">Sayfa Bulunamadı</h1>
        <p className="text-muted-foreground mb-2">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <p className="text-sm text-muted-foreground/70 mb-8">
          <code className="bg-muted px-2 py-1 rounded text-xs">{location.pathname}</code>
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri Dön
          </Button>
          <Button 
            variant="apple" 
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Ana Sayfa
          </Button>
        </div>

        {/* Quick Links */}
        <div className="mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">Belki bunları arıyorsunuzdur:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/konu-anlatimi')}
              className="gap-1"
            >
              <BookOpen className="w-4 h-4" />
              Dersler
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/denemeler')}
            >
              Denemeler
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/homework')}
            >
              Ödevler
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;