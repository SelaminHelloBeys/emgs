import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, CheckCircle, AlertCircle, PlayCircle } from 'lucide-react';

interface Deneme {
  id: string;
  title: string;
  subject: string;
  questionCount: number;
  duration: number; // minutes
  status: 'available' | 'completed' | 'in_progress';
  score?: number;
  completedAt?: string;
}

// Placeholder data - will be replaced with real data from database
const mockDenemeler: Deneme[] = [];

export const DenemelerPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Denemeler</h1>
        <p className="text-muted-foreground mt-1">Sınavlara hazırlan, kendini test et</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Toplam Deneme</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Tamamlanan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">-%</p>
                <p className="text-sm text-muted-foreground">Ortalama Başarı</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Denemeler List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Mevcut Denemeler</h2>
        
        {mockDenemeler.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Henüz deneme yok</h3>
              <p className="text-muted-foreground">
                Yakında yeni denemeler eklenecek!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockDenemeler.map((deneme) => (
              <Card key={deneme.id} className="glass-card hover-lift">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{deneme.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{deneme.subject}</p>
                    </div>
                    <Badge
                      variant={
                        deneme.status === 'completed' ? 'default' :
                        deneme.status === 'in_progress' ? 'secondary' : 'outline'
                      }
                    >
                      {deneme.status === 'completed' ? 'Tamamlandı' :
                       deneme.status === 'in_progress' ? 'Devam Ediyor' : 'Başla'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {deneme.questionCount} Soru
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {deneme.duration} dk
                    </span>
                  </div>
                  
                  {deneme.status === 'completed' && deneme.score !== undefined ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Puan: <strong>{deneme.score}%</strong></span>
                      <Button variant="outline" size="sm">Sonuçları Gör</Button>
                    </div>
                  ) : (
                    <Button className="w-full" size="sm">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      {deneme.status === 'in_progress' ? 'Devam Et' : 'Başla'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
