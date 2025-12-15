import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Construction, Wrench, ShieldAlert, AlertTriangle } from 'lucide-react';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';

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
    description: 'Şüpheli aktiviteler izleniyor ve raporlanıyor.',
    icon: <ShieldAlert className="h-5 w-5" />,
    color: 'bg-red-500',
  },
};

export const PlatformModesPanel: React.FC = () => {
  const { settings, isLoading, updateSetting } = usePlatformSettings();

  const handleToggle = async (key: string, currentValue: boolean) => {
    await updateSetting(key, !currentValue);
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
  );
};
