import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTrialExams, TrialExam } from '@/hooks/useTrialExams';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, FileText, CheckCircle, XCircle, Minus, Trophy, Users, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export const DenemeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { exams, isLoading } = useTrialExams();
  const { user } = useAuth();
  const [exam, setExam] = useState<TrialExam | null>(null);
  const [showMobileData, setShowMobileData] = useState(false);

  useEffect(() => {
    if (!isLoading && id) {
      const foundExam = exams.find(e => e.id === id);
      setExam(foundExam || null);
    }
  }, [exams, id, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Deneme bulunamadı</h2>
        <Button onClick={() => navigate('/denemeler')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Denemelere Dön
        </Button>
      </div>
    );
  }

  const participation = exam.participation;
  const hasData = participation?.participated;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/denemeler')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{exam.title}</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(exam.exam_date), 'd MMMM yyyy', { locale: tr })} • {exam.grade}. Sınıf
          </p>
        </div>
      </div>

      {/* Mobile: Toggle Button */}
      <div className="lg:hidden">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setShowMobileData(!showMobileData)}
        >
          {showMobileData ? 'PDF\'i Göster' : 'Analiz Verilerini Göster'}
        </Button>
      </div>

      {/* Split View */}
      <div className="flex flex-col lg:flex-row gap-4 min-h-[70vh]">
        {/* PDF Viewer - Left (70%) */}
        <div className={cn(
          "lg:w-[70%] rounded-xl overflow-hidden border bg-card",
          showMobileData && "hidden lg:block"
        )}>
          <iframe
            src={exam.pdf_url}
            className="w-full h-full min-h-[70vh]"
            title={exam.title}
          />
        </div>

        {/* Data Panel - Right (30%) */}
        <div className={cn(
          "lg:w-[30%] space-y-4",
          !showMobileData && "hidden lg:block"
        )}>
          {hasData ? (
            <>
              {/* Score Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Sonuç Özeti
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-lg bg-green-500/10">
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                      <p className="text-xl font-bold text-green-600">{participation.correct_count}</p>
                      <p className="text-xs text-muted-foreground">Doğru</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/10">
                      <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
                      <p className="text-xl font-bold text-red-600">{participation.wrong_count}</p>
                      <p className="text-xs text-muted-foreground">Yanlış</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-500/10">
                      <Minus className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                      <p className="text-xl font-bold text-gray-600">{participation.blank_count}</p>
                      <p className="text-xs text-muted-foreground">Boş</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Net Score */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">{participation.net_score.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground mt-1">Net Puan</p>
                  </div>
                </CardContent>
              </Card>

              {/* Rankings */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Sıralama
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {participation.class_rank && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Şube Sıralaması</span>
                      </div>
                      <span className="font-bold">{participation.class_rank}.</span>
                    </div>
                  )}
                  {participation.general_rank && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Genel Sıralama</span>
                      </div>
                      <span className="font-bold">{participation.general_rank}.</span>
                    </div>
                  )}
                  {!participation.class_rank && !participation.general_rank && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Sıralama bilgisi henüz eklenmedi
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Analiz Verisi Yok</h3>
                <p className="text-sm text-muted-foreground">
                  Bu denemenin analiz verileri bulunmamaktadır. Sol taraftan PDF'i inceleyebilirsiniz.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
