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
  creator_role?: string;
  creator_verified?: boolean;
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
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Duyurular yüklenirken hata oluştu');
      setIsLoading(false);
      return;
    }

    // Fetch creator profiles and roles
    const creatorIds = [...new Set((data || []).map(a => a.created_by))];
    
    const [profilesRes, rolesRes, verificationsRes] = await Promise.all([
      supabase.from('profiles').select('user_id, name').in('user_id', creatorIds),
      supabase.from('user_roles').select('user_id, role').in('user_id', creatorIds),
      supabase.from('user_verifications').select('user_id, is_verified').in('user_id', creatorIds),
    ]);

    const profileMap = new Map((profilesRes.data || []).map(p => [p.user_id, p.name]));
    const roleMap = new Map((rolesRes.data || []).map(r => [r.user_id, r.role]));
    const verificationMap = new Map((verificationsRes.data || []).map(v => [v.user_id, v.is_verified]));

    setAnnouncements((data || []).map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      type: item.type as 'info' | 'warning' | 'success',
      created_by: item.created_by,
      created_at: item.created_at,
      creator_name: profileMap.get(item.created_by) || 'Yönetici',
      creator_role: roleMap.get(item.created_by) || undefined,
      creator_verified: verificationMap.get(item.created_by) || false,
    })));
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
