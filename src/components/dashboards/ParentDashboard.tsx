import React from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Users, BarChart3, BookOpen, Bell } from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Hoş Geldiniz, {profile?.name}</h1>
        <p className="text-muted-foreground">Çocuğunuzun gelişimini buradan takip edebilirsiniz.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold">Dersler</h3>
          </div>
          <p className="text-sm text-muted-foreground">Çocuğunuzun izlediği ders sayısı</p>
          <p className="text-2xl font-bold mt-2">-</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-semibold">Ödevler</h3>
          </div>
          <p className="text-sm text-muted-foreground">Tamamlanan ödev sayısı</p>
          <p className="text-2xl font-bold mt-2">-</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="font-semibold">Denemeler</h3>
          </div>
          <p className="text-sm text-muted-foreground">Katılınan deneme sayısı</p>
          <p className="text-2xl font-bold mt-2">-</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="font-semibold">Duyurular</h3>
          </div>
          <p className="text-sm text-muted-foreground">Okunmamış duyuru</p>
          <p className="text-2xl font-bold mt-2">-</p>
        </Card>
      </div>

      <Card className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Veli Paneli</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Çocuğunuzun akademik gelişimini, ödevlerini ve deneme sonuçlarını buradan takip edebileceksiniz. 
          Bu özellik yakında daha detaylı hale gelecektir.
        </p>
      </Card>
    </div>
  );
};
