import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLessons, Lesson } from '@/hooks/useLessons';
import {
  Play,
  Pause,
  ChevronLeft,
  Volume2,
  VolumeX,
  Maximize,
  Clock,
  User,
  ThumbsUp,
  BookOpen,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Sabit ders ve ünite listesi
const SUBJECTS = [
  { id: 'matematik', name: 'Matematik', icon: '📐', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { id: 'turkce', name: 'Türkçe', icon: '📝', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  { id: 'fen-bilimleri', name: 'Fen Bilimleri', icon: '🔬', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  { id: 'sosyal-bilgiler', name: 'Sosyal Bilgiler', icon: '🌍', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  { id: 'ingilizce', name: 'İngilizce', icon: '🇬🇧', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { id: 'din-ahlak', name: 'Din ve Ahlak Bilgisi', icon: '📖', color: 'bg-teal-500/10 text-teal-500 border-teal-500/20' },
];

const UNITS = Array.from({ length: 10 }, (_, i) => ({
  id: `unite-${i + 1}`,
  name: `${i + 1}. Ünite`,
  number: i + 1,
}));

type ViewState = 'subjects' | 'units' | 'videos';

export const KonuAnlatimiPage: React.FC = () => {
  const { lessons, isLoading } = useLessons('video');
  const [viewState, setViewState] = useState<ViewState>('subjects');
  const [selectedSubject, setSelectedSubject] = useState<typeof SUBJECTS[0] | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<typeof UNITS[0] | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Seçili ders ve üniteye göre videoları filtrele
  const filteredLessons = useMemo(() => {
    if (!selectedSubject || !selectedUnit) return [];
    
    // topic alanında ünite bilgisi varsa ona göre filtrele
    // Yoksa tüm videoları göster (demo amaçlı)
    return lessons.filter(lesson => {
      const subjectMatch = lesson.subject.toLowerCase().includes(selectedSubject.name.toLowerCase()) ||
                           selectedSubject.name.toLowerCase().includes(lesson.subject.toLowerCase());
      return subjectMatch;
    });
  }, [lessons, selectedSubject, selectedUnit]);

  const handleSubjectSelect = (subject: typeof SUBJECTS[0]) => {
    setSelectedSubject(subject);
    setViewState('units');
  };

  const handleUnitSelect = (unit: typeof UNITS[0]) => {
    setSelectedUnit(unit);
    setViewState('videos');
    if (filteredLessons.length > 0) {
      setSelectedLesson(filteredLessons[0]);
    }
  };

  const handleBack = () => {
    if (viewState === 'videos') {
      setViewState('units');
      setSelectedUnit(null);
      setSelectedLesson(null);
    } else if (viewState === 'units') {
      setViewState('subjects');
      setSelectedSubject(null);
    }
  };

  // Subjects View
  if (viewState === 'subjects') {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Konu Anlatımı</h1>
          <p className="text-muted-foreground">Ders seçerek konu anlatım videolarına ulaşın</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUBJECTS.map((subject) => (
            <Card
              key={subject.id}
              className={cn(
                "p-6 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg border-2",
                subject.color
              )}
              onClick={() => handleSubjectSelect(subject)}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{subject.icon}</span>
                <div>
                  <h3 className="font-semibold text-lg">{subject.name}</h3>
                  <p className="text-sm opacity-70">10 Ünite</p>
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
          <Button variant="ghost" size="icon" onClick={handleBack}>
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {UNITS.map((unit) => (
            <Card
              key={unit.id}
              className={cn(
                "p-6 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg text-center border-2",
                selectedSubject.color
              )}
              onClick={() => handleUnitSelect(unit)}
            >
              <div className="text-4xl font-bold opacity-20 mb-2">{unit.number}</div>
              <h3 className="font-semibold">{unit.name}</h3>
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
                          src={selectedLesson.file_url}
                          className="absolute inset-0 w-full h-full object-cover"
                          controls
                          muted={isMuted}
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
                        <span className={cn("text-xs font-medium px-2 py-1 rounded-full", selectedSubject.color)}>
                          {selectedSubject.name} - {selectedUnit.name}
                        </span>
                        <h2 className="text-xl font-semibold mt-2 mb-1">{selectedLesson.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" /> {selectedLesson.creator_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {selectedLesson.duration || 'N/A'}
                          </span>
                        </div>
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
                {filteredLessons.map((lesson) => (
                  <Card
                    key={lesson.id}
                    className={cn(
                      "p-3 cursor-pointer transition-all",
                      selectedLesson?.id === lesson.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedLesson(lesson)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Play className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">{lesson.duration || lesson.subject}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};
