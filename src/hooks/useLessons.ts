import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  subject: string;
  file_url?: string;
  thumbnail_url?: string;
  duration?: string;
  content_type: 'video' | 'short' | 'pdf';
  created_by: string;
  created_at: string;
  creator_name?: string;
}

export const useLessons = (contentType?: 'video' | 'short' | 'pdf') => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchLessons = async () => {
    if (!user) {
      setLessons([]);
      setIsLoading(false);
      return;
    }

    let query = supabase
      .from('lessons')
      .select(`
        *,
        profiles!lessons_created_by_fkey(name)
      `)
      .order('created_at', { ascending: false });

    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching lessons:', error);
      toast.error('İçerikler yüklenirken hata oluştu');
    } else {
      const formattedData = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        subject: item.subject,
        file_url: item.file_url,
        thumbnail_url: item.thumbnail_url,
        duration: item.duration,
        content_type: item.content_type as 'video' | 'short' | 'pdf',
        created_by: item.created_by,
        created_at: item.created_at,
        creator_name: (item.profiles as any)?.name || 'Bilinmeyen'
      }));
      setLessons(formattedData);
    }
    setIsLoading(false);
  };

  const uploadFile = async (file: File, contentType: 'video' | 'short' | 'pdf') => {
    if (!user) return { url: null, error: new Error('Not authenticated') };

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${contentType}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('lessons')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return { url: null, error: uploadError };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('lessons')
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  };

  const createLesson = async (
    title: string,
    subject: string,
    contentType: 'video' | 'short' | 'pdf',
    file: File,
    description?: string
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    // Upload file first
    const { url, error: uploadError } = await uploadFile(file, contentType);
    if (uploadError || !url) {
      toast.error('Dosya yüklenirken hata oluştu');
      return { error: uploadError };
    }

    const { error } = await supabase
      .from('lessons')
      .insert({
        title,
        description,
        subject,
        file_url: url,
        content_type: contentType,
        created_by: user.id
      });

    if (error) {
      console.error('Error creating lesson:', error);
      toast.error('İçerik oluşturulurken hata oluştu');
      return { error };
    }

    toast.success('İçerik başarıyla yüklendi');
    return { error: null };
  };

  useEffect(() => {
    fetchLessons();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('lessons-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lessons'
        },
        () => {
          fetchLessons();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, contentType]);

  return {
    lessons,
    isLoading,
    createLesson,
    refetch: fetchLessons
  };
};
