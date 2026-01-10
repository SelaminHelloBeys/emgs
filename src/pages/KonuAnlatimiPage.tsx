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

// Sabit ders ve ünite listesi
const SUBJECTS = [
  { id: 'matematik', name: 'Matematik', icon: '📐', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { id: 'turkce', name: 'Türkçe', icon: '📝', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  { id: 'fen-bilimleri', name: 'Fen Bilimleri', icon: '🔬', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  { id: 'sosyal-bilgiler', name: 'Sosyal Bilgiler', icon: '🌍', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  { id: 'ingilizce', name: 'İngilizce', icon: '🇬🇧', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', hasVocabulary: true },
  { id: 'din-ahlak', name: 'Din ve Ahlak Bilgisi', icon: '📖', color: 'bg-teal-500/10 text-teal-500 border-teal-500/20' },
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

  // Create a map for quick progress lookup
  const progressMap = useMemo(() => {
    return new Map(watchedVideos.map(v => [v.lesson_id, v]));
  }, [watchedVideos]);

  // Filter lessons by BOTH subject AND unit (topic)
  const filteredLessons = useMemo(() => {
    if (!selectedSubject || !selectedUnit) return [];
    
    return lessons.filter(lesson => {
      // Match subject
      const subjectMatch = lesson.subject.toLowerCase().includes(selectedSubject.name.toLowerCase()) ||
                           selectedSubject.name.toLowerCase().includes(lesson.subject.toLowerCase());
      
      // Match unit/topic - CRITICAL FIX
      const unitMatch = lesson.topic === selectedUnit.id || 
                        lesson.topic === selectedUnit.name ||
                        lesson.topic === `${selectedUnit.number}. Ünite` ||
                        lesson.topic === `unite-${selectedUnit.number}`;
      
      return subjectMatch && unitMatch;
    });
  }, [lessons, selectedSubject, selectedUnit]);

  // Handle video time update
  const handleTimeUpdate = () => {
    if (!videoRef.current || !selectedLesson) return;
    
    const video = videoRef.current;
    const progress = Math.round((video.currentTime / video.duration) * 100);
    
    // Update every 10% or when completed
    if (progress % 10 === 0 || progress >= 90) {
      updateProgress(selectedLesson.id, progress);
    }
  };

  // Handle video ended
  const handleVideoEnded = () => {
    if (!selectedLesson) return;
    updateProgress(selectedLesson.id, 100);
  };

  const handleSubjectSelect = (subject: typeof SUBJECTS[0]) => {
    setSelectedSubject(subject);
    // Check if this is English with vocabulary option
    if (subject.hasVocabulary) {
      setViewState('units'); // Show units first, vocabulary is accessible from there
    } else {
      setViewState('units');
    }
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
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lesson.id);

      if (error) throw error;

      toast.success('Video silindi');
      refetch();
      
      // If this was the selected lesson, clear it
      if (selectedLesson?.id === lesson.id) {
        setSelectedLesson(filteredLessons.find(l => l.id !== lesson.id) || null);
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Video silinirken hata oluştu');
    }
    setDeletingId(null);
  };

  // Update selected lesson when filtered lessons change
  useEffect(() => {
    if (viewState === 'videos' && filteredLessons.length > 0 && !selectedLesson) {
      setSelectedLesson(filteredLessons[0]);
    }
  }, [filteredLessons, viewState, selectedLesson]);

  // Vocabulary view for English
  if (viewState === 'vocabulary' && selectedSubject?.hasVocabulary) {
    return <EnglishVocabularySection onBack={handleBack} />;
  }

  // Subjects View
  if (viewState === 'subjects') {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Konu Anlatımı
          </h1>
          <p className="text-muted-foreground text-lg">
            Ders seçerek konu anlatım videolarına ulaşın
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SUBJECTS.map((subject) => (
            <Card
              key={subject.id}
              className={cn(
                "group relative overflow-hidden p-6 cursor-pointer transition-all duration-300",
                "hover:scale-[1.03] hover:shadow-xl border-2 bg-gradient-to-br from-card to-background",
                subject.color
              )}
              onClick={() => handleSubjectSelect(subject)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-background/80 flex items-center justify-center shadow-sm">
                  <span className="text-4xl">{subject.icon}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{subject.name}</h3>
                  <p className="text-sm opacity-70 flex items-center gap-1">
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
          <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{selectedSubject.icon}</span>
              <h1 className="text-3xl font-bold">{selectedSubject.name}</h1>
            </div>
            <p className="text-muted-foreground">Ünite seçerek derslere göz atın</p>
          </div>
        </div>

        {/* Vocabulary button for English */}
        {selectedSubject.hasVocabulary && (
          <Card 
            className="group p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-2 border-purple-400/40 bg-gradient-to-br from-purple-50 to-violet-50"
            onClick={() => setViewState('vocabulary')}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">
                <span className="text-3xl">📚</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-purple-900">Kelime Hazinesi</h3>
                <p className="text-sm text-purple-600">A1'den C1'e tüm seviyeler</p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {UNITS.map((unit) => (
            <Card
              key={unit.id}
              className={cn(
                "group relative overflow-hidden p-6 cursor-pointer transition-all duration-300",
                "hover:scale-[1.05] hover:shadow-xl text-center border-2",
                selectedSubject.color
              )}
              onClick={() => handleUnitSelect(unit)}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-foreground/5 to-transparent rounded-bl-full" />
              <div className="text-5xl font-bold opacity-10 mb-2 transition-transform group-hover:scale-110">
                {unit.number}
              </div>
              <h3 className="font-semibold relative">{unit.name}</h3>
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
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
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
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted mx-auto flex items-center justify-center mb-4">
              <Play className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Bu ünite için henüz video yok</h3>
            <p className="text-muted-foreground">
              Öğretmenler video yükledikçe burada görünecek.
            </p>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2 space-y-4">
              {selectedLesson && (
                <>
                  <Card className="overflow-hidden">
                    <div className="relative aspect-video bg-foreground">
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
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                          <Play className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cn("text-xs font-medium px-2 py-1 rounded-full", selectedSubject.color)}>
                            {selectedSubject.name} - {selectedUnit.name}
                          </span>
                          {progressMap.get(selectedLesson.id)?.completed && (
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-600 flex items-center gap-1">
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
                        
                        {/* Progress bar */}
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

            {/* Video List */}
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
                        "p-3 cursor-pointer transition-all",
                        selectedLesson?.id === lesson.id && "ring-2 ring-primary"
                      )}
                      onClick={() => setSelectedLesson(lesson)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center relative",
                          isCompleted ? "bg-green-500/10" : "bg-primary/10"
                        )}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
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
                          {/* Mini progress bar */}
                          {progress && !isCompleted && (
                            <Progress value={progress.progress} className="h-1 mt-1" />
                          )}
                        </div>
                        
                        {/* Delete button for admins */}
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
