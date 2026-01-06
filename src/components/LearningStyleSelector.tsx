import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  BookOpen, 
  Video, 
  HelpCircle, 
  Sparkles,
  Check,
  Brain,
  Eye,
  Ear
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

type LearningStyle = 'reading' | 'video' | 'quiz';

interface LearningStyleOption {
  id: LearningStyle;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
  emoji: string;
}

const learningStyles: LearningStyleOption[] = [
  {
    id: 'reading',
    title: 'Ben Okuyarak Öğrenirim',
    description: 'Yazılı içerikler, notlar ve özetlerle öğrenmeyi tercih ediyorum',
    icon: <BookOpen className="w-8 h-8" />,
    features: ['Konu özetleri', 'PDF dokümanlar', 'Yazılı notlar', 'Formül listeleri'],
    color: 'from-blue-500 to-cyan-500',
    emoji: '📚'
  },
  {
    id: 'video',
    title: 'Ben Video İsterim',
    description: 'Görsel ve işitsel içeriklerle daha iyi öğreniyorum',
    icon: <Video className="w-8 h-8" />,
    features: ['Video dersler', 'Kısa özetler (Shorts)', 'Animasyonlar', 'Görsel anlatımlar'],
    color: 'from-purple-500 to-pink-500',
    emoji: '🎬'
  },
  {
    id: 'quiz',
    title: 'Bana Soru Sor',
    description: 'Yaparak ve çözerek öğrenmeyi tercih ediyorum',
    icon: <HelpCircle className="w-8 h-8" />,
    features: ['Pratik sorular', 'Deneme sınavları', 'Hızlı quizler', 'Anlık geri bildirim'],
    color: 'from-orange-500 to-red-500',
    emoji: '❓'
  }
];

interface LearningStyleSelectorProps {
  onStyleSelect?: (style: LearningStyle) => void;
  showAsDialog?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const LearningStyleSelector: React.FC<LearningStyleSelectorProps> = ({
  onStyleSelect,
  showAsDialog = false,
  isOpen = false,
  onOpenChange
}) => {
  const [selectedStyle, setSelectedStyle] = useState<LearningStyle | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('emg-learning-style');
    if (saved) {
      setSelectedStyle(saved as LearningStyle);
    }
  }, []);

  const handleStyleSelect = (style: LearningStyle) => {
    setSelectedStyle(style);
    localStorage.setItem('emg-learning-style', style);
    onStyleSelect?.(style);
    
    // Navigate based on style
    switch (style) {
      case 'reading':
        navigate('/documents');
        break;
      case 'video':
        navigate('/konu-anlatimi');
        break;
      case 'quiz':
        navigate('/denemeler');
        break;
    }
    
    onOpenChange?.(false);
  };

  const content = (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="flex justify-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Eye className="w-6 h-6 text-blue-600" />
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <Ear className="w-6 h-6 text-purple-600" />
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <Brain className="w-6 h-6 text-orange-600" />
          </div>
        </div>
        <p className="text-muted-foreground">
          Sana en uygun öğrenme yöntemini seç, EMG içeriği ona göre sunacak!
        </p>
      </div>

      <div className="grid gap-4">
        {learningStyles.map((style) => (
          <Card
            key={style.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg border-2",
              selectedStyle === style.id 
                ? "border-primary ring-2 ring-primary/20" 
                : "border-transparent hover:border-primary/30"
            )}
            onClick={() => handleStyleSelect(style.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shrink-0",
                  style.color
                )}>
                  {style.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {style.emoji} {style.title}
                    </h3>
                    {selectedStyle === style.id && (
                      <Badge className="bg-green-500">
                        <Check className="w-3 h-3 mr-1" />
                        Seçili
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{style.description}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {style.features.map((feature, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedStyle && (
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 inline mr-1" />
            Tercihini değiştirmek istersen ayarlardan güncelleyebilirsin
          </p>
        </div>
      )}
    </div>
  );

  if (showAsDialog) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="w-6 h-6 text-primary" />
              Nasıl Öğrenmeyi Tercih Edersin?
            </DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Öğrenme Stilini Seç
        </CardTitle>
        <CardDescription>
          Sana en uygun öğrenme yöntemini seç
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};

// Quick style button for dashboard
export const LearningStyleQuickButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const currentStyle = localStorage.getItem('emg-learning-style') as LearningStyle | null;
  const style = learningStyles.find(s => s.id === currentStyle);

  return (
    <>
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => setIsOpen(true)}
      >
        {style ? (
          <>
            {style.emoji} {style.title.split(' ')[1]}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Öğrenme Stili Seç
          </>
        )}
      </Button>
      <LearningStyleSelector 
        showAsDialog 
        isOpen={isOpen} 
        onOpenChange={setIsOpen} 
      />
    </>
  );
};
