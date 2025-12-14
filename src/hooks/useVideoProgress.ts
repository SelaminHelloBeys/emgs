import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface VideoProgress {
  id: string;
  lesson_id: string;
  progress: number;
  completed: boolean;
  last_watched_at: string;
  lesson?: {
    id: string;
    title: string;
    subject: string;
    thumbnail_url: string;
    duration: string;
  };
}

export const useVideoProgress = () => {
  const [watchedVideos, setWatchedVideos] = useState<VideoProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchProgress = async () => {
    if (!user) {
      setWatchedVideos([]);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('video_watch_progress')
      .select(`
        *,
        lessons:lesson_id (
          id,
          title,
          subject,
          thumbnail_url,
          duration
        )
      `)
      .eq('user_id', user.id)
      .order('last_watched_at', { ascending: false });

    if (error) {
      console.error('Error fetching video progress:', error);
    } else {
      setWatchedVideos(data?.map(item => ({
        ...item,
        lesson: item.lessons as any
      })) || []);
    }
    setIsLoading(false);
  };

  const updateProgress = async (lessonId: string, progress: number) => {
    if (!user) return;

    const completed = progress >= 90;

    const { error } = await supabase
      .from('video_watch_progress')
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        progress,
        completed,
        last_watched_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,lesson_id'
      });

    if (!error) {
      fetchProgress();
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [user]);

  return {
    watchedVideos,
    isLoading,
    updateProgress,
    refetch: fetchProgress
  };
};
