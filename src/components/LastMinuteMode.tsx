import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Clock, 
  Zap, 
  BookOpen, 
  Target, 
  Lightbulb,
  ChevronRight,
  Flame,
  LifeBuoy,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickTopic {
  id: string;
  title: string;
  subject: string;
  summary: string;
  keyPoints: string[];
  commonMistakes: string[];
  frequencyScore: number;
}

const quickTopics: QuickTopic[] = [
  {
    id: '1',
    title: 'Denklem Çözümü',
    subject: 'Matematik',
    summary: 'Birinci dereceden denklemlerde bilinmeyeni yalnız bırakarak çözüme ulaşırız.',
    keyPoints: [
      'Eşitliğin her iki tarafına aynı işlem uygulanır',
      'x\'i yalnız bırak',
      'Ters işlem yap'
    ],
    commonMistakes: [
      'İşaret hatası (- yerine + kullanma)',
      'Her iki tarafa işlem yapmayı unutma'
    ],
    frequencyScore: 95
  },
  {
    id: '2',
    title: 'Paragraf Soruları',
    subject: 'Türkçe',
    summary: 'Ana fikir, yardımcı düşünce ve yazarın amacını bulmak için metni dikkatli oku.',
    keyPoints: [
      'Önce soruyu oku',
      'Anahtar kelimeleri bul',
      'Eleme yöntemi kullan'
    ],
    commonMistakes: [
      'Metni okumadan şıklara bakmak',
      'Kendi fikrini katmak'
    ],
    frequencyScore: 90
  },
  {
    id: '3',
    title: 'Hücre Yapısı',
    subject: 'Fen Bilimleri',
    summary: 'Hücre, canlıların yapı ve görev birimi. Çekirdek, sitoplazma ve zar temel kısımları.',
    keyPoints: [
      'Çekirdek = DNA deposu',
      'Mitokondri = enerji üretimi',
      'Ribozom = protein sentezi'
    ],
    commonMistakes: [
      'Bitki-hayvan hücresi farkını karıştırma',
      'Organellerin görevlerini karıştırma'
    ],
    frequencyScore: 85
  },
  {
    id: '4',
    title: 'Kesirler',
    subject: 'Matematik',
    summary: 'Pay ve paydadan oluşur. Paydalar eşitlenmeden toplama/çıkarma yapılmaz.',
    keyPoints: [
      'EKOK ile paydaları eşitle',
      'Sadeleştirmeyi unutma',
      'Bileşik → tam sayılı kesir'
    ],
    commonMistakes: [
      'Payları toplarken paydayı da toplamak',
      'Sadeleştirmeyi unutmak'
    ],
    frequencyScore: 88
  },
  {
    id: '5',
    title: 'Osmanlı Devleti Kuruluş',
    subject: 'Sosyal Bilgiler',
    summary: '1299\'da Osman Bey tarafından kuruldu. Söğüt merkezli küçük bir beylik olarak başladı.',
    keyPoints: [
      '1299 - Kuruluş yılı',
      'Osman Bey - kurucu',
      'Söğüt - ilk merkez'
    ],
    commonMistakes: [
      'Tarihleri karıştırma',
      'Padişah sıralamasını karıştırma'
    ],
    frequencyScore: 75
  }
];

export const LastMinuteMode: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<QuickTopic | null>(null);

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className="gap-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-400"
        onClick={() => setIsOpen(true)}
      >
        <LifeBuoy className="w-5 h-5" />
        Son Dakika
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <LifeBuoy className="w-6 h-6 text-orange-500" />
              Son Dakika Modu - Panik Yok! 🛟
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="quick" className="w-full">
            <TabsList className="w-full justify-start px-6 bg-transparent">
              <TabsTrigger value="quick" className="gap-1">
                <Zap className="w-4 h-4" />
                En Çok Çıkanlar
              </TabsTrigger>
              <TabsTrigger value="summaries" className="gap-1">
                <BookOpen className="w-4 h-4" />
                Kısa Özetler
              </TabsTrigger>
              <TabsTrigger value="tips" className="gap-1">
                <Lightbulb className="w-4 h-4" />
                Can Simidi İpuçları
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quick" className="m-0">
              <ScrollArea className="h-[60vh] p-6">
                <div className="space-y-3">
                  <p className="text-muted-foreground mb-4">
                    📊 Sınavlarda en sık çıkan konular - hızlıca göz at!
                  </p>
                  {quickTopics
                    .sort((a, b) => b.frequencyScore - a.frequencyScore)
                    .map((topic) => (
                      <Card
                        key={topic.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md",
                          selectedTopic?.id === topic.id && "ring-2 ring-primary"
                        )}
                        onClick={() => setSelectedTopic(topic)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                                <Flame className="w-6 h-6 text-orange-500" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{topic.title}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    %{topic.frequencyScore} çıkma oranı
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{topic.subject}</p>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>

                          {selectedTopic?.id === topic.id && (
                            <div className="mt-4 pt-4 border-t space-y-4 animate-in fade-in slide-in-from-top-2">
                              <div>
                                <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                                  <Brain className="w-4 h-4" /> Özet
                                </h4>
                                <p className="text-sm bg-muted p-3 rounded-lg">{topic.summary}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-sm mb-2 text-green-600">✓ Anahtar Noktalar</h4>
                                <ul className="space-y-1">
                                  {topic.keyPoints.map((point, i) => (
                                    <li key={i} className="text-sm flex items-start gap-2">
                                      <span className="text-green-500">•</span>
                                      {point}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-medium text-sm mb-2 text-red-600">⚠️ Dikkat! Sık Yapılan Hatalar</h4>
                                <ul className="space-y-1">
                                  {topic.commonMistakes.map((mistake, i) => (
                                    <li key={i} className="text-sm flex items-start gap-2">
                                      <span className="text-red-500">•</span>
                                      {mistake}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="summaries" className="m-0">
              <ScrollArea className="h-[60vh] p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {quickTopics.map((topic) => (
                    <Card key={topic.id} className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{topic.subject}</Badge>
                        <h3 className="font-semibold">{topic.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{topic.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {topic.keyPoints.map((point, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {point}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="tips" className="m-0">
              <ScrollArea className="h-[60vh] p-6">
                <div className="space-y-4">
                  <Card className="p-4 border-green-200 bg-green-50/50">
                    <h3 className="font-semibold flex items-center gap-2 text-green-700 mb-2">
                      🧘 Sakin Ol
                    </h3>
                    <p className="text-sm text-green-600">
                      Derin nefes al. Panik yapmak performansını düşürür. Her soru için 1 dakika süren var.
                    </p>
                  </Card>

                  <Card className="p-4 border-blue-200 bg-blue-50/50">
                    <h3 className="font-semibold flex items-center gap-2 text-blue-700 mb-2">
                      📝 Eleme Yöntemi
                    </h3>
                    <p className="text-sm text-blue-600">
                      Bilmediğin soruda kesin yanlış olan şıkları ele. 4 şıktan 2'sini elersen şansın %50'ye çıkar!
                    </p>
                  </Card>

                  <Card className="p-4 border-purple-200 bg-purple-50/50">
                    <h3 className="font-semibold flex items-center gap-2 text-purple-700 mb-2">
                      ⏱️ Zaman Yönetimi
                    </h3>
                    <p className="text-sm text-purple-600">
                      Zorlandığın soruyu geç, sonra dön. Kolay soruları önce yap, motivasyonun artsın.
                    </p>
                  </Card>

                  <Card className="p-4 border-orange-200 bg-orange-50/50">
                    <h3 className="font-semibold flex items-center gap-2 text-orange-700 mb-2">
                      🎯 Önce Soruyu Oku
                    </h3>
                    <p className="text-sm text-orange-600">
                      Paragraf sorularında önce soruyu oku, sonra metni. Ne aradığını bilirsen daha hızlı bulursun.
                    </p>
                  </Card>

                  <Card className="p-4 border-red-200 bg-red-50/50">
                    <h3 className="font-semibold flex items-center gap-2 text-red-700 mb-2">
                      🚫 Tahmin Değiştirme
                    </h3>
                    <p className="text-sm text-red-600">
                      İlk cevabın genellikle doğrudur. Emin değilsen değiştirme, aksi halde yanlış yapma olasılığın artar.
                    </p>
                  </Card>

                  <Card className="p-4 border-teal-200 bg-teal-50/50">
                    <h3 className="font-semibold flex items-center gap-2 text-teal-700 mb-2">
                      💪 Kendine Güven
                    </h3>
                    <p className="text-sm text-teal-600">
                      Bu kadar çalıştın! Her şeyi bilmek zorunda değilsin. Bildiklerini yap, gerisini bırak.
                    </p>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className="p-6 pt-0 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              💡 Sınava 1 gün kala: Yeni konu öğrenme, bildiklerini tekrar et!
            </p>
            <Button onClick={() => setIsOpen(false)}>
              Hazırım! 🚀
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};