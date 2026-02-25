import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLessons, Lesson } from '@/hooks/useLessons';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { useAuth } from '@/contexts/AuthContext';
import { EnglishVocabularySection } from '@/components/EnglishVocabularySection';
import {
  Play,
  Clock,
  User,
  ThumbsUp,
  BookOpen,
  Loader2,
  ArrowLeft,
  CheckCircle,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SUBJECTS = [
  { id: 'matematik', name: 'Matematik', icon: '📐', gradient: 'from-slate-500/20 to-slate-600/10 dark:from-slate-400/20 dark:to-slate-500/10', textColor: 'text-slate-700 dark:text-slate-300', badgeBg: 'bg-slate-100 dark:bg-slate-800' },
  { id: 'turkce', name: 'Türkçe', icon: '📝', gradient: 'from-pink-500/20 to-pink-600/10 dark:from-pink-400/20 dark:to-pink-500/10', textColor: 'text-pink-700 dark:text-pink-300', badgeBg: 'bg-pink-100 dark:bg-pink-900/40' },
  { id: 'fen-bilimleri', name: 'Fen Bilimleri', icon: '🔬', gradient: 'from-emerald-500/20 to-emerald-600/10 dark:from-emerald-400/20 dark:to-emerald-500/10', textColor: 'text-emerald-700 dark:text-emerald-300', badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40' },
  { id: 'sosyal-bilgiler', name: 'Sosyal Bilgiler', icon: '🌍', gradient: 'from-amber-500/20 to-amber-600/10 dark:from-amber-400/20 dark:to-amber-500/10', textColor: 'text-amber-700 dark:text-amber-300', badgeBg: 'bg-amber-100 dark:bg-amber-900/40' },
  { id: 'ingilizce', name: 'İngilizce', icon: '🇬🇧', gradient: 'from-violet-500/20 to-violet-600/10 dark:from-violet-400/20 dark:to-violet-500/10', textColor: 'text-violet-700 dark:text-violet-300', badgeBg: 'bg-violet-100 dark:bg-violet-900/40', hasVocabulary: true },
  { id: 'din-ahlak', name: 'Din ve Ahlak Bilgisi', icon: '📖', gradient: 'from-cyan-500/20 to-cyan-600/10 dark:from-cyan-400/20 dark:to-cyan-500/10', textColor: 'text-cyan-700 dark:text-cyan-300', badgeBg: 'bg-cyan-100 dark:bg-cyan-900/40' },
];

const UNITS = Array.from({ length: 10 }, (_, i) => ({
  id: `unite-${i + 1}`,
  name: `${i + 1}. Ünite`,
  number: i + 1,
}));

type ViewState = 'subjects' | 'units' | 'videos' | 'vocabulary';

export const KonuAnlatimiPage: React.FC = () => {
  const { lessons, isLoading, refetch } = useLessons('video');
  const { watchedVideos, updateProgress } = useVideoProgress();
  const { isAdmin, canCreateContent } = useAuth();
  const [viewState, setViewState] = useState<ViewState>('subjects');
  const [selectedSubject, setSelectedSubject] = useState<typeof SUBJECTS[0] | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<typeof UNITS[0] | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const progressMap = useMemo(() => {
    return new Map(watchedVideos.map(v => [v.lesson_id, v]));
  }, [watchedVideos]);

  const filteredLessons = useMemo(() => {
    if (!selectedSubject || !selectedUnit) return [];
    return lessons.filter(lesson => {
      const subjectMatch = lesson.subject.toLowerCase().includes(selectedSubject.name.toLowerCase()) ||
                           selectedSubject.name.toLowerCase().includes(lesson.subject.toLowerCase());
      const unitMatch = lesson.topic === selectedUnit.id || 
                        lesson.topic === selectedUnit.name ||
                        lesson.topic === `${selectedUnit.number}. Ünite` ||
                        lesson.topic === `unite-${selectedUnit.number}`;
      return subjectMatch && unitMatch;
    });
  }, [lessons, selectedSubject, selectedUnit]);

  const handleTimeUpdate = () => {
    if (!videoRef.current || !selectedLesson) return;
    const video = videoRef.current;
    const progress = Math.round((video.currentTime / video.duration) * 100);
    if (progress % 10 === 0 || progress >= 90) {
      updateProgress(selectedLesson.id, progress);
    }
  };

  const handleVideoEnded = () => {
    if (!selectedLesson) return;
    updateProgress(selectedLesson.id, 100);
  };

  const handleSubjectSelect = (subject: typeof SUBJECTS[0]) => {
    setSelectedSubject(subject);
    setViewState('units');
  };

  const handleUnitSelect = (unit: typeof UNITS[0]) => {
    setSelectedUnit(unit);
    setViewState('videos');
  };

  const handleBack = () => {
    if (viewState === 'videos') {
      setViewState('units');
      setSelectedUnit(null);
      setSelectedLesson(null);
    } else if (viewState === 'units') {
      setViewState('subjects');
      setSelectedSubject(null);
    } else if (viewState === 'vocabulary') {
      setViewState('units');
    }
  };

  const handleDeleteVideo = async (lesson: Lesson) => {
    setDeletingId(lesson.id);
    try {
      const { error } = await supabase.from('lessons').delete().eq('id', lesson.id);
      if (error) throw error;
      toast.success('Video silindi');
      refetch();
      if (selectedLesson?.id === lesson.id) {
        setSelectedLesson(filteredLessons.find(l => l.id !== lesson.id) || null);
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Video silinirken hata oluştu');
    }
    setDeletingId(null);
  };

  useEffect(() => {
    if (viewState === 'videos' && filteredLessons.length > 0 && !selectedLesson) {
      setSelectedLesson(filteredLessons[0]);
    }
  }, [filteredLessons, viewState, selectedLesson]);

  if (viewState === 'vocabulary' && selectedSubject?.hasVocabulary) {
    return <EnglishVocabularySection onBack={handleBack} />;
  }

  // Subjects View
  if (viewState === 'subjects') {
    return (
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto animate-fade-in">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-blue-600 dark:to-blue-400 bg-clip-text text-transparent">
            Konu Anlatımı
          </h1>
          <p className="text-muted-foreground text-lg">
            Ders seçerek konu anlatım videolarına ulaşın
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SUBJECTS.map((subject, index) => (
            <Card
              key={subject.id}
              className={cn(
                "group relative overflow-hidden p-6 cursor-pointer border-0",
                "bg-gradient-to-br backdrop-blur-sm",
                "hover:scale-[1.03] hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-primary/5",
                "transition-all duration-500 ease-out",
                subject.gradient
              )}
              style={{ animationDelay: `${index * 80}ms` }}
              onClick={() => handleSubjectSelect(subject)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <span className="text-4xl">{subject.icon}</span>
                </div>
                <div>
                  <h3 className={cn("font-semibold text-lg mb-1", subject.textColor)}>{subject.name}</h3>
                  <p className="text-sm opacity-70 flex items-center gap-1 text-muted-foreground">
                    <BookOpen className="w-3 h-3" />
                    10 Ünite
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Units View
  if (viewState === 'units' && selectedSubject) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0 hover:scale-110 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{selectedSubject.icon}</span>
              <h1 className={cn("text-3xl font-bold", selectedSubject.textColor)}>{selectedSubject.name}</h1>
            </div>
            <p className="text-muted-foreground">Ünite seçerek derslere göz atın</p>
          </div>
        </div>

        {selectedSubject.hasVocabulary && (
          <Card 
            className={cn(
              "group p-6 cursor-pointer border-0 bg-gradient-to-br",
              "hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-violet-500/10",
              "transition-all duration-500",
              selectedSubject.gradient
            )}
            onClick={() => setViewState('vocabulary')}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                <span className="text-3xl">📚</span>
              </div>
              <div>
                <h3 className={cn("font-semibold text-lg", selectedSubject.textColor)}>Kelime Hazinesi</h3>
                <p className="text-sm text-muted-foreground">A1'den C1'e tüm seviyeler</p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {UNITS.map((unit, index) => (
            <Card
              key={unit.id}
              className={cn(
                "group relative overflow-hidden p-6 cursor-pointer text-center border-0",
                "bg-gradient-to-br",
                "hover:scale-[1.05] hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-primary/5",
                "transition-all duration-500 ease-out",
                selectedSubject.gradient
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleUnitSelect(unit)}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-black/5 dark:from-white/5 to-transparent rounded-bl-full" />
              <div className={cn("text-5xl font-bold opacity-20 mb-2 transition-transform duration-500 group-hover:scale-110", selectedSubject.textColor)}>
                {unit.number}
              </div>
              <h3 className={cn("font-semibold relative", selectedSubject.textColor)}>{unit.name}</h3>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Videos View
  if (viewState === 'videos' && selectedSubject && selectedUnit) {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="hover:scale-110 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{selectedSubject.icon}</span>
              <h1 className="text-2xl font-bold">{selectedSubject.name} - {selectedUnit.name}</h1>
            </div>
            <p className="text-muted-foreground">Konu anlatım videoları</p>
          </div>
        </div>

        {filteredLessons.length === 0 ? (
          <Card className="p-12 text-center border-0 bg-gradient-to-br from-muted/50 to-muted/20 dark:from-muted/20 dark:to-muted/5">
            <div className="w-16 h-16 rounded-2xl bg-muted dark:bg-muted/50 mx-auto flex items-center justify-center mb-4">
              <Play className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Bu ünite için henüz video yok</h3>
            <p className="text-muted-foreground">
              Öğretmenler video yükledikçe burada görünecek.
            </p>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {selectedLesson && (
                <>
                  <Card className="overflow-hidden border-0 shadow-lg dark:shadow-2xl dark:shadow-black/30">
                    <div className="relative aspect-video bg-black dark:bg-black">
                      {selectedLesson.file_url ? (
                        <video
                          ref={videoRef}
                          src={selectedLesson.file_url}
                          className="absolute inset-0 w-full h-full object-cover"
                          controls
                          onTimeUpdate={handleTimeUpdate}
                          onEnded={handleVideoEnded}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted dark:bg-muted/20">
                          <Play className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </Card>

                  <Card className="p-6 border-0 bg-card dark:bg-card/80 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cn("text-xs font-medium px-2 py-1 rounded-full", selectedSubject.badgeBg, selectedSubject.textColor)}>
                            {selectedSubject.name} - {selectedUnit.name}
                          </span>
                          {progressMap.get(selectedLesson.id)?.completed && (
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Tamamlandı
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-semibold mt-2 mb-1">{selectedLesson.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" /> {selectedLesson.creator_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {selectedLesson.duration || 'N/A'}
                          </span>
                        </div>
                        
                        {progressMap.has(selectedLesson.id) && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">İzleme İlerlemesi</span>
                              <span className="font-medium">{progressMap.get(selectedLesson.id)?.progress || 0}%</span>
                            </div>
                            <Progress value={progressMap.get(selectedLesson.id)?.progress || 0} className="h-2" />
                          </div>
                        )}
                        
                        {selectedLesson.description && (
                          <p className="text-muted-foreground">{selectedLesson.description}</p>
                        )}
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

            <div className="space-y-4">
              <h3 className="font-semibold">Bu Ünitedeki Videolar</h3>
              <div className="space-y-2">
                {filteredLessons.map((lesson) => {
                  const progress = progressMap.get(lesson.id);
                  const isCompleted = progress?.completed;
                  
                  return (
                    <Card
                      key={lesson.id}
                      className={cn(
                        "p-3 cursor-pointer border-0 transition-all duration-300",
                        "bg-card/80 dark:bg-card/50 backdrop-blur-sm hover:bg-accent/50",
                        selectedLesson?.id === lesson.id && "ring-2 ring-primary shadow-lg dark:shadow-primary/10"
                      )}
                      onClick={() => setSelectedLesson(lesson)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center relative transition-colors",
                          isCompleted ? "bg-green-500/10 dark:bg-green-500/20" : "bg-primary/10 dark:bg-primary/20"
                        )}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                          ) : (
                            <Play className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{lesson.title}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">{lesson.duration || lesson.subject}</p>
                            {progress && !isCompleted && (
                              <span className="text-xs text-primary">{progress.progress}%</span>
                            )}
                          </div>
                          {progress && !isCompleted && (
                            <Progress value={progress.progress} className="h-1 mt-1" />
                          )}
                        </div>
                        
                        {(isAdmin || canCreateContent) && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive shrink-0"
                                onClick={(e) => e.stopPropagation()}
                                disabled={deletingId === lesson.id}
                              >
                                {deletingId === lesson.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Videoyu Sil</AlertDialogTitle>
                                <AlertDialogDescription>
                                  "{lesson.title}" videosunu silmek istediğinize emin misiniz?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteVideo(lesson)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Sil
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};
