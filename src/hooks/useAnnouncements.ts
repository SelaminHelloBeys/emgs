import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
  created_by: string;
  created_at: string;
  creator_name?: string;
}

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchAnnouncements = async () => {
    if (!user) {
      setAnnouncements([]);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        profiles!announcements_created_by_fkey(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Duyurular yüklenirken hata oluştu');
    } else {
      const formattedData = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        type: item.type as 'info' | 'warning' | 'success',
        created_by: item.created_by,
        created_at: item.created_at,
        creator_name: (item.profiles as any)?.name || 'Bilinmeyen'
      }));
      setAnnouncements(formattedData);
    }
    setIsLoading(false);
  };

  const createAnnouncement = async (title: string, content: string, type: 'info' | 'warning' | 'success') => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        type,
        created_by: user.id
      });

    if (error) {
      console.error('Error creating announcement:', error);
      toast.error('Duyuru oluşturulurken hata oluştu');
      return { error };
    }

    toast.success('Duyuru başarıyla oluşturuldu');
    return { error: null };
  };

  useEffect(() => {
    fetchAnnouncements();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('announcements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        () => {
          fetchAnnouncements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    announcements,
    isLoading,
    createAnnouncement,
    refetch: fetchAnnouncements
  };
};
