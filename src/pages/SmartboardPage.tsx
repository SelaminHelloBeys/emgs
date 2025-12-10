import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Monitor,
  Wifi,
  WifiOff,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ChevronLeft,
  ChevronRight,
  List,
  Grid,
  BookOpen,
  Video,
  FileText,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CachedContent {
  id: number;
  title: string;
  type: 'video' | 'quiz' | 'pdf';
  subject: string;
  duration?: string;
}

const cachedContent: CachedContent[] = [
  { id: 1, title: 'Türev Giriş Dersi', type: 'video', subject: 'Matematik', duration: '45:30' },
  { id: 2, title: 'Newton Kanunları', type: 'video', subject: 'Fizik', duration: '38:15' },
  { id: 3, title: 'Türev Testi', type: 'quiz', subject: 'Matematik' },
  { id: 4, title: 'Formül Özeti', type: 'pdf', subject: 'Matematik' },
  { id: 5, title: 'Organik Kimya', type: 'video', subject: 'Kimya', duration: '52:00' },
];

export const SmartboardPage: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [selectedContent, setSelectedContent] = useState<CachedContent | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'quiz': return Target;
      case 'pdf': return FileText;
      default: return BookOpen;
    }
  };

  return (
    <div className={cn(
      "space-y-8",
      isFullscreen && "fixed inset-0 z-50 bg-background p-8"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Monitor className="w-8 h-8" />
            Akıllı Tahta Modu
          </h1>
          <p className="text-muted-foreground">Sınıf içi sunum ve offline mod</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant={isOffline ? "apple" : "outline"} 
            className="gap-2"
            onClick={() => setIsOffline(!isOffline)}
          >
            {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            {isOffline ? 'Çevrimdışı' : 'Çevrimiçi'}
          </Button>
          <Button 
            variant="apple" 
            className="gap-2"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <Maximize className="w-4 h-4" />
            Tam Ekran
          </Button>
        </div>
      </div>

      {/* Offline Mode Banner */}
      {isOffline && (
        <Card variant="glass" className="p-4 border-apple-orange/30 bg-apple-orange/5">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-apple-orange" />
            <div>
              <p className="font-medium">Çevrimdışı Mod Aktif</p>
              <p className="text-sm text-muted-foreground">
                Yalnızca önbelleğe alınmış içerikler gösteriliyor
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Content Player */}
        <div className="lg:col-span-2">
          <Card variant="elevated" className="overflow-hidden">
            <div className="aspect-video bg-foreground relative flex items-center justify-center">
              {selectedContent ? (
                <>
                  <div className="text-center text-background">
                    <div className="w-20 h-20 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                      <Play className="w-10 h-10 text-background ml-1" fill="currentColor" />
                    </div>
                    <h3 className="text-xl font-semibold">{selectedContent.title}</h3>
                    <p className="text-background/70">{selectedContent.subject}</p>
                  </div>
                  
                  {/* Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button variant="glass" size="icon">
                          <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button variant="glass" size="iconLg" className="bg-background/30">
                          <Play className="w-6 h-6 ml-0.5" />
                        </Button>
                        <Button variant="glass" size="icon">
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="glass" size="icon">
                          <Volume2 className="w-5 h-5" />
                        </Button>
                        <Button variant="glass" size="icon">
                          <Maximize className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-background/50">
                  <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>İçerik seçin</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Content List */}
        <div className="space-y-4">
          <h3 className="font-semibold">Önbellekteki İçerikler</h3>
          <div className="space-y-2">
            {cachedContent.map((content) => {
              const Icon = getIcon(content.type);
              return (
                <Card 
                  key={content.id}
                  variant={selectedContent?.id === content.id ? "elevated" : "interactive"}
                  className={cn(
                    "p-4 cursor-pointer",
                    selectedContent?.id === content.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedContent(content)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      content.type === 'video' ? 'bg-primary/10' :
                      content.type === 'quiz' ? 'bg-apple-orange/10' : 'bg-apple-green/10'
                    )}>
                      <Icon className={cn(
                        "w-5 h-5",
                        content.type === 'video' ? 'text-primary' :
                        content.type === 'quiz' ? 'text-apple-orange' : 'text-apple-green'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{content.title}</p>
                      <p className="text-sm text-muted-foreground">{content.subject}</p>
                    </div>
                    {content.duration && (
                      <span className="text-xs text-muted-foreground">{content.duration}</span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
