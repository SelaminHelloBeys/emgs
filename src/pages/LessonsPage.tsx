import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  ChevronRight,
  Clock,
  User,
  ThumbsUp,
  BookOpen,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Lesson {
  id: number;
  title: string;
  teacher: string;
  subject: string;
  duration: string;
  thumbnail: string;
  views: number;
  description: string;
}

const mockLessons: Lesson[] = [
  {
    id: 1,
    title: 'Türev ve Uygulamaları - Tam Kurs',
    teacher: 'Ahmet Yılmaz',
    subject: 'Matematik',
    duration: '45:30',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop',
    views: 12450,
    description: 'Bu derste türevin temel kavramlarını ve uygulamalarını öğreneceksiniz.',
  },
  {
    id: 2,
    title: 'Newton Hareket Kanunları',
    teacher: 'Ayşe Demir',
    subject: 'Fizik',
    duration: '38:15',
    thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&h=450&fit=crop',
    views: 8920,
    description: 'Newton\'un üç hareket kanununu detaylı olarak inceleyeceğiz.',
  },
  {
    id: 3,
    title: 'Organik Kimya Temelleri',
    teacher: 'Mehmet Kaya',
    subject: 'Kimya',
    duration: '52:00',
    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=450&fit=crop',
    views: 6780,
    description: 'Organik bileşiklerin yapısı ve adlandırılması.',
  },
  {
    id: 4,
    title: 'Osmanlı İmparatorluğu Tarihi',
    teacher: 'Fatma Özkan',
    subject: 'Tarih',
    duration: '41:45',
    thumbnail: 'https://images.unsplash.com/photo-1461360370896-922624d12a74?w=800&h=450&fit=crop',
    views: 5430,
    description: 'Osmanlı Devleti\'nin kuruluşundan yıkılışına kadar.',
  },
];

const relatedLessons = mockLessons.slice(1, 4);

export const LessonsPage: React.FC = () => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(mockLessons[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(35);

  return (
    <div className="space-y-8">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">Video Dersler</h1>
        <p className="text-muted-foreground">Öğretmenlerinizden kapsamlı ders videoları</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Video Player */}
        <div className="lg:col-span-2 space-y-4">
          {selectedLesson && (
            <>
              {/* Video Player */}
              <Card variant="elevated" className="overflow-hidden">
                <div className="relative aspect-video bg-foreground">
                  <img
                    src={selectedLesson.thumbnail}
                    alt={selectedLesson.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Play Overlay */}
                  <button
                    className="absolute inset-0 flex items-center justify-center bg-foreground/20 transition-opacity hover:bg-foreground/30"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {!isPlaying && (
                      <div className="w-20 h-20 rounded-full bg-background/90 shadow-apple-lg flex items-center justify-center animate-scale-in">
                        <Play className="w-8 h-8 text-foreground ml-1" fill="currentColor" />
                      </div>
                    )}
                  </button>

                  {/* Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/90 to-transparent p-4">
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="h-1 bg-background/30 rounded-full cursor-pointer">
                        <div 
                          className="h-full bg-primary rounded-full relative"
                          style={{ width: `${progress}%` }}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full" />
                        </div>
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button 
                          className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center hover:bg-background/30 transition-colors"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5 text-background" />
                          ) : (
                            <Play className="w-5 h-5 text-background ml-0.5" />
                          )}
                        </button>
                        <button className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center hover:bg-background/30 transition-colors">
                          <SkipBack className="w-4 h-4 text-background" />
                        </button>
                        <button className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center hover:bg-background/30 transition-colors">
                          <SkipForward className="w-4 h-4 text-background" />
                        </button>
                        <button 
                          className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center hover:bg-background/30 transition-colors"
                          onClick={() => setIsMuted(!isMuted)}
                        >
                          {isMuted ? (
                            <VolumeX className="w-4 h-4 text-background" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-background" />
                          )}
                        </button>
                        <span className="text-sm text-background/80">15:45 / {selectedLesson.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center hover:bg-background/30 transition-colors">
                          <Settings className="w-4 h-4 text-background" />
                        </button>
                        <button className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center hover:bg-background/30 transition-colors">
                          <Maximize className="w-4 h-4 text-background" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Video Info */}
              <Card variant="default" className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {selectedLesson.subject}
                    </span>
                    <h2 className="text-xl font-semibold mt-2 mb-1">{selectedLesson.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" /> {selectedLesson.teacher}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {selectedLesson.duration}
                      </span>
                      <span>{selectedLesson.views.toLocaleString()} görüntülenme</span>
                    </div>
                    <p className="text-muted-foreground">{selectedLesson.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <ThumbsUp className="w-4 h-4" /> Beğen
                    </Button>
                    <Button variant="apple" size="sm" className="gap-1">
                      <BookOpen className="w-4 h-4" /> Kaydet
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Related Lessons Sidebar */}
        <div className="space-y-4">
          <h3 className="font-semibold">Önerilen Dersler</h3>
          <div className="space-y-3">
            {relatedLessons.map((lesson) => (
              <Card 
                key={lesson.id} 
                variant="interactive" 
                className="p-3 flex gap-3"
                onClick={() => setSelectedLesson(lesson)}
              >
                <div className="relative w-32 h-20 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={lesson.thumbnail}
                    alt={lesson.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-foreground/80 text-background text-xs px-1 rounded">
                    {lesson.duration}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2 mb-1">{lesson.title}</h4>
                  <p className="text-xs text-muted-foreground">{lesson.teacher}</p>
                  <p className="text-xs text-muted-foreground">{lesson.views.toLocaleString()} görüntülenme</p>
                </div>
              </Card>
            ))}
          </div>

          {/* All Lessons List */}
          <h3 className="font-semibold pt-4">Tüm Dersler</h3>
          <div className="space-y-2">
            {mockLessons.map((lesson) => (
              <Card 
                key={lesson.id} 
                variant={selectedLesson?.id === lesson.id ? "elevated" : "default"} 
                className={cn(
                  "p-3 cursor-pointer transition-all",
                  selectedLesson?.id === lesson.id && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedLesson(lesson)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Play className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
