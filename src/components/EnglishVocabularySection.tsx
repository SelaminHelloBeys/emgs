import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Volume2, BookOpen, ChevronLeft, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

// English levels with vocabulary
const ENGLISH_LEVELS = [
  { id: 'a1', name: 'A1 - Başlangıç', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  { id: 'a2', name: 'A2 - Temel', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  { id: 'b1', name: 'B1 - Orta Altı', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  { id: 'b2', name: 'B2 - Orta', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  { id: 'c1', name: 'C1 - İleri', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
];

// Sample vocabulary data
const VOCABULARY: Record<string, Array<{ word: string; meaning: string; example: string }>> = {
  a1: [
    { word: 'Hello', meaning: 'Merhaba', example: 'Hello, how are you?' },
    { word: 'Goodbye', meaning: 'Hoşça kal', example: 'Goodbye, see you tomorrow!' },
    { word: 'Please', meaning: 'Lütfen', example: 'Please help me.' },
    { word: 'Thank you', meaning: 'Teşekkür ederim', example: 'Thank you for your help.' },
    { word: 'Yes', meaning: 'Evet', example: 'Yes, I understand.' },
    { word: 'No', meaning: 'Hayır', example: 'No, I don\'t want it.' },
    { word: 'Water', meaning: 'Su', example: 'Can I have some water?' },
    { word: 'Food', meaning: 'Yiyecek', example: 'The food is delicious.' },
    { word: 'House', meaning: 'Ev', example: 'This is my house.' },
    { word: 'Family', meaning: 'Aile', example: 'I love my family.' },
    { word: 'Friend', meaning: 'Arkadaş', example: 'She is my best friend.' },
    { word: 'School', meaning: 'Okul', example: 'I go to school every day.' },
    { word: 'Book', meaning: 'Kitap', example: 'I read a book.' },
    { word: 'Teacher', meaning: 'Öğretmen', example: 'My teacher is kind.' },
    { word: 'Student', meaning: 'Öğrenci', example: 'I am a student.' },
  ],
  a2: [
    { word: 'Weather', meaning: 'Hava durumu', example: 'The weather is nice today.' },
    { word: 'Shopping', meaning: 'Alışveriş', example: 'I love shopping.' },
    { word: 'Restaurant', meaning: 'Restoran', example: 'Let\'s go to a restaurant.' },
    { word: 'Hospital', meaning: 'Hastane', example: 'The hospital is nearby.' },
    { word: 'Airport', meaning: 'Havalimanı', example: 'We arrived at the airport.' },
    { word: 'Vacation', meaning: 'Tatil', example: 'I need a vacation.' },
    { word: 'Meeting', meaning: 'Toplantı', example: 'We have a meeting tomorrow.' },
    { word: 'Problem', meaning: 'Problem', example: 'There is a problem.' },
    { word: 'Solution', meaning: 'Çözüm', example: 'We found a solution.' },
    { word: 'Experience', meaning: 'Deneyim', example: 'It was a great experience.' },
    { word: 'Opportunity', meaning: 'Fırsat', example: 'This is a good opportunity.' },
    { word: 'Decision', meaning: 'Karar', example: 'We made a decision.' },
    { word: 'Relationship', meaning: 'İlişki', example: 'They have a good relationship.' },
    { word: 'Communication', meaning: 'İletişim', example: 'Communication is important.' },
    { word: 'Comfortable', meaning: 'Rahat', example: 'This chair is comfortable.' },
  ],
  b1: [
    { word: 'Achievement', meaning: 'Başarı', example: 'This is a great achievement.' },
    { word: 'Environment', meaning: 'Çevre', example: 'We must protect the environment.' },
    { word: 'Development', meaning: 'Gelişim', example: 'The development is impressive.' },
    { word: 'Responsibility', meaning: 'Sorumluluk', example: 'It\'s your responsibility.' },
    { word: 'Independent', meaning: 'Bağımsız', example: 'She is very independent.' },
    { word: 'Confidence', meaning: 'Güven', example: 'He has a lot of confidence.' },
    { word: 'Advantage', meaning: 'Avantaj', example: 'This is an advantage.' },
    { word: 'Disadvantage', meaning: 'Dezavantaj', example: 'There is one disadvantage.' },
    { word: 'Comparison', meaning: 'Karşılaştırma', example: 'Let\'s make a comparison.' },
    { word: 'Improvement', meaning: 'İyileştirme', example: 'We need improvement.' },
    { word: 'Recommendation', meaning: 'Tavsiye', example: 'I have a recommendation.' },
    { word: 'Appreciation', meaning: 'Takdir', example: 'I appreciate your help.' },
    { word: 'Cooperation', meaning: 'İşbirliği', example: 'Thank you for your cooperation.' },
    { word: 'Perspective', meaning: 'Bakış açısı', example: 'From my perspective...' },
    { word: 'Circumstances', meaning: 'Koşullar', example: 'Under the circumstances...' },
  ],
  b2: [
    { word: 'Nevertheless', meaning: 'Buna rağmen', example: 'Nevertheless, we succeeded.' },
    { word: 'Consequently', meaning: 'Sonuç olarak', example: 'Consequently, we decided to leave.' },
    { word: 'Furthermore', meaning: 'Ayrıca', example: 'Furthermore, I want to add...' },
    { word: 'Significant', meaning: 'Önemli', example: 'This is a significant change.' },
    { word: 'Inevitable', meaning: 'Kaçınılmaz', example: 'It was inevitable.' },
    { word: 'Controversial', meaning: 'Tartışmalı', example: 'It\'s a controversial topic.' },
    { word: 'Comprehensive', meaning: 'Kapsamlı', example: 'This is a comprehensive report.' },
    { word: 'Contemporary', meaning: 'Çağdaş', example: 'Contemporary art is interesting.' },
    { word: 'Substantial', meaning: 'Önemli/Büyük', example: 'There was a substantial increase.' },
    { word: 'Subsequent', meaning: 'Sonraki', example: 'In subsequent meetings...' },
    { word: 'Preliminary', meaning: 'Ön/İlk', example: 'This is a preliminary report.' },
    { word: 'Predominant', meaning: 'Baskın', example: 'It\'s the predominant view.' },
    { word: 'Sophisticated', meaning: 'Sofistike', example: 'It\'s a sophisticated system.' },
    { word: 'Ambiguous', meaning: 'Belirsiz', example: 'The meaning is ambiguous.' },
    { word: 'Pragmatic', meaning: 'Pragmatik', example: 'We need a pragmatic approach.' },
  ],
  c1: [
    { word: 'Albeit', meaning: 'Her ne kadar', example: 'Albeit difficult, we managed.' },
    { word: 'Notwithstanding', meaning: 'Buna karşın', example: 'Notwithstanding the risks...' },
    { word: 'Hitherto', meaning: 'Şimdiye kadar', example: 'Hitherto unknown facts...' },
    { word: 'Inasmuch', meaning: 'Çünkü/O kadar ki', example: 'Inasmuch as it\'s possible...' },
    { word: 'Whereby', meaning: 'Bu sayede', example: 'A process whereby...' },
    { word: 'Forthcoming', meaning: 'Yaklaşan', example: 'The forthcoming event...' },
    { word: 'Aforementioned', meaning: 'Yukarıda belirtilen', example: 'The aforementioned issues...' },
    { word: 'Unprecedented', meaning: 'Benzeri görülmemiş', example: 'Unprecedented success.' },
    { word: 'Quintessential', meaning: 'En tipik', example: 'The quintessential example.' },
    { word: 'Paradoxically', meaning: 'Paradoks olarak', example: 'Paradoxically, it worked.' },
    { word: 'Ostensibly', meaning: 'Görünüşte', example: 'Ostensibly, it was fine.' },
    { word: 'Inherently', meaning: 'Doğası gereği', example: 'It\'s inherently complex.' },
    { word: 'Inexorably', meaning: 'Kaçınılmaz olarak', example: 'Time moves inexorably.' },
    { word: 'Juxtaposition', meaning: 'Yan yana koyma', example: 'The juxtaposition of ideas.' },
    { word: 'Dichotomy', meaning: 'İkilem', example: 'The dichotomy between...' },
  ],
};

interface EnglishVocabularySectionProps {
  onBack: () => void;
}

export const EnglishVocabularySection: React.FC<EnglishVocabularySectionProps> = ({ onBack }) => {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentVocabulary = useMemo(() => {
    if (!selectedLevel) return [];
    const vocab = VOCABULARY[selectedLevel] || [];
    if (!searchQuery) return vocab;
    return vocab.filter(v => 
      v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.meaning.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedLevel, searchQuery]);

  const speakWord = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  // Level selection view
  if (!selectedLevel) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">İngilizce Kelime Hazinesi</h2>
            <p className="text-muted-foreground">Seviyenizi seçin</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ENGLISH_LEVELS.map((level) => (
            <Card
              key={level.id}
              className={cn(
                "p-6 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg border-2",
                level.color
              )}
              onClick={() => setSelectedLevel(level.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-current/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{level.name}</h3>
                  <p className="text-sm opacity-70">{VOCABULARY[level.id]?.length || 0} kelime</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Vocabulary view
  const currentLevel = ENGLISH_LEVELS.find(l => l.id === selectedLevel);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setSelectedLevel(null)}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{currentLevel?.name}</h2>
          <p className="text-muted-foreground">{currentVocabulary.length} kelime</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Kelime veya anlam ara..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Vocabulary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentVocabulary.map((vocab, index) => (
          <Card key={index} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">{vocab.word}</h3>
                <p className="text-primary font-medium">{vocab.meaning}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => speakWord(vocab.word)}
                className="shrink-0"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground italic">"{vocab.example}"</p>
          </Card>
        ))}
      </div>

      {currentVocabulary.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Sonuç bulunamadı</p>
        </div>
      )}
    </div>
  );
};
