import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlatformSetting {
  id: string;
  setting_key: string;
  setting_value: boolean;
  description: string | null;
  updated_at: string;
}

export const usePlatformSettings = () => {
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .order('setting_key');

    if (error) {
      console.error('Error fetching platform settings:', error);
    } else {
      setSettings(data || []);
    }
    setIsLoading(false);
  };

  const updateSetting = async (settingKey: string, value: boolean) => {
    const { error } = await supabase
      .from('platform_settings')
      .update({ setting_value: value, updated_at: new Date().toISOString() })
      .eq('setting_key', settingKey);

    if (error) {
      console.error('Error updating setting:', error);
      toast.error('Ayar güncellenirken hata oluştu');
      return false;
    }

    toast.success('Ayar güncellendi');
    await fetchSettings();
    return true;
  };

  const getSetting = (key: string): boolean => {
    const setting = settings.find(s => s.setting_key === key);
    return setting?.setting_value ?? false;
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    updateSetting,
    getSetting,
    refetch: fetchSettings,
  };
};
