import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Construction, Wrench, ShieldAlert, AlertTriangle } from 'lucide-react';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const modeConfig: Record<string, { 
  label: string; 
  description: string; 
  icon: React.ReactNode;
  color: string;
}> = {
  development_mode: {
    label: 'Geliştirme Modu',
    description: 'Platform geliştirme aşamasında. Sadece yöneticiler erişebilir.',
    icon: <Construction className="h-5 w-5" />,
    color: 'bg-amber-500',
  },
  maintenance_mode: {
    label: 'Bakım Modu',
    description: 'Platform bakımda. Kullanıcılar giriş yapamaz.',
    icon: <Wrench className="h-5 w-5" />,
    color: 'bg-blue-500',
  },
  danger_detection_mode: {
    label: 'Tehlikeli Aktivite Tespit Modu',
    description: 'Aktifken öğrenciler platforma girmek için şifre girmek zorundadır.',
    icon: <ShieldAlert className="h-5 w-5" />,
    color: 'bg-red-500',
  },
};

export const PlatformModesPanel: React.FC = () => {
  const { settings, isLoading, updateSetting, refetch } = usePlatformSettings();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [dangerPassword, setDangerPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleToggle = async (key: string, currentValue: boolean) => {
    if (key === 'danger_detection_mode' && !currentValue) {
      // Turning ON danger mode - ask for password
      setDangerPassword('');
      setConfirmPassword('');
      setShowPasswordDialog(true);
      return;
    }
    await updateSetting(key, !currentValue);
  };

  const handleSetDangerPassword = async () => {
    if (!dangerPassword || dangerPassword.length < 4) {
      toast.error('Şifre en az 4 karakter olmalı');
      return;
    }
    if (dangerPassword !== confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    // Save password to text_value and enable the mode
    const { error } = await supabase
      .from('platform_settings')
      .update({ 
        setting_value: true, 
        text_value: dangerPassword,
        updated_at: new Date().toISOString() 
      })
      .eq('setting_key', 'danger_detection_mode');

    if (error) {
      toast.error('Hata oluştu');
      return;
    }

    toast.success('Tehlikeli aktivite modu aktif. Şifre belirlendi.');
    setShowPasswordDialog(false);
    refetch();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Platform Modları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Platform Modları
          </CardTitle>
          <CardDescription>
            Platform genelinde etki eden modları buradan yönetebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.map((setting) => {
            const config = modeConfig[setting.setting_key];
            if (!config) return null;

            return (
              <div
                key={setting.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${config.color} text-white`}>
                    {config.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={setting.setting_key} className="font-medium">
                        {config.label}
                      </Label>
                      {setting.setting_value && (
                        <Badge variant="secondary" className="text-xs">
                          Aktif
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {config.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={setting.setting_key}
                  checked={setting.setting_value}
                  onCheckedChange={() => handleToggle(setting.setting_key, setting.setting_value)}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Danger Mode Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Tehlikeli Mod Şifresi Belirle
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Öğrenciler platforma girmek için bu şifreyi girmek zorunda kalacak. Admin ve yöneticiler şifresiz geçer.
          </p>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Şifre</Label>
              <Input
                type="password"
                value={dangerPassword}
                onChange={(e) => setDangerPassword(e.target.value)}
                placeholder="Güvenlik şifresi"
              />
            </div>
            <div>
              <Label>Şifreyi Onayla</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Şifreyi tekrar girin"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>İptal</Button>
            <Button variant="apple" onClick={handleSetDangerPassword}>
              Modu Aktifle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
