import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Info, 
  Scale, 
  BookOpen, 
  ExternalLink,
  Shield,
  Copyright
} from 'lucide-react';

export const LegalDisclaimer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
      >
        <Info className="w-3 h-3" />
        Yasal Bilgilendirme
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              Yasal Bilgilendirme
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 pr-4">
              {/* Platform Info */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Platform Bilgileri
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    <strong>EMG (Eğitim Merkezi Gelişmiş)</strong>, <strong>EMG Ordektif</strong> tarafından 
                    geliştirilen ve yönetilen bir eğitim platformudur. Platform, öğrencilerin akademik 
                    başarılarını artırmak amacıyla çeşitli eğitim materyalleri sunmaktadır.
                  </p>
                </CardContent>
              </Card>

              {/* Content Attribution */}
              <Card className="border-orange-500/20 bg-orange-50/50">
                <CardContent className="p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-2 text-orange-700">
                    <Copyright className="w-4 h-4" />
                    İçerik Kaynağı ve Telif Hakları
                  </h3>
                  <div className="text-sm text-orange-600 space-y-2">
                    <p>
                      Bu platformda sunulan eğitim içeriklerinin bir kısmı <strong>Tonguç Akademi</strong>'nin 
                      ücretsiz olarak paylaştığı eğitim materyallerinden yararlanılarak hazırlanmıştır.
                    </p>
                    <p>
                      Tonguç Akademi, Türkiye'nin önde gelen eğitim kurumlarından biri olup, kaliteli 
                      eğitim içerikleriyle öğrencilere destek olmaktadır.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <BookOpen className="w-4 h-4" />
                      <a 
                        href="https://www.tongucakademi.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 underline hover:text-orange-700"
                      >
                        Tonguç Akademi Web Sitesi
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Disclaimer */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4" />
                    Sorumluluk Reddi
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                    <li>
                      Bu platform, ticari olmayan eğitim amaçlı geliştirilmiştir.
                    </li>
                    <li>
                      Kullanılan içeriklerin telif hakları orijinal sahiplerine aittir.
                    </li>
                    <li>
                      Platform, içeriklerin doğruluğu veya güncelliği konusunda garanti vermemektedir.
                    </li>
                    <li>
                      Kullanıcılar, platformu kendi sorumlulukları dahilinde kullanmaktadır.
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Contact */}
              <Card className="border-blue-500/20 bg-blue-50/50">
                <CardContent className="p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-2 text-blue-700">
                    📧 İletişim
                  </h3>
                  <p className="text-sm text-blue-600">
                    Telif hakkı veya içerik ile ilgili herhangi bir sorunuz veya talepleriniz için 
                    bizimle iletişime geçebilirsiniz. İçerik kaldırma talepleri en kısa sürede 
                    değerlendirilecektir.
                  </p>
                </CardContent>
              </Card>

              {/* Footer Note */}
              <div className="text-center text-xs text-muted-foreground pt-4 border-t">
                <p>© 2024 EMG Ordektif. Tüm hakları saklıdır.</p>
                <p className="mt-1">Bu platform, eğitim amaçlı olarak geliştirilmiştir.</p>
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-end">
            <Button onClick={() => setIsOpen(false)}>
              Anladım
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Mini version for footer
export const LegalDisclaimerMini: React.FC = () => {
  return (
    <div className="text-xs text-muted-foreground text-center py-4 border-t mt-auto">
      <p>
        EMG, <strong>EMG Ordektif</strong> tarafından geliştirilen bir eğitim platformudur.
      </p>
      <p className="mt-1">
        Bazı içerikler <strong>Tonguç Akademi</strong>'nin ücretsiz eğitim materyallerinden faydalanılarak hazırlanmıştır.
      </p>
      <LegalDisclaimer />
    </div>
  );
};
