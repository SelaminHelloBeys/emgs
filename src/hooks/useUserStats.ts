import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserStats {
  lessons_watched: number;
  exams_completed: number;
  homework_submitted: number;
  total_watch_time: number;
}

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchStats = async () => {
    if (!user) {
      setStats(null);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user stats:', error);
    }

    if (data) {
      setStats(data);
    } else {
      // Create stats if not exists
      const { data: newStats } = await supabase
        .from('user_stats')
        .insert({ user_id: user.id })
        .select()
        .single();
      
      setStats(newStats);
    }
    setIsLoading(false);
  };

  const incrementStat = async (field: keyof UserStats, amount: number = 1) => {
    if (!user || !stats) return;

    const newValue = (stats[field] || 0) + amount;
    
    const { error } = await supabase
      .from('user_stats')
      .update({ [field]: newValue })
      .eq('user_id', user.id);

    if (!error) {
      setStats(prev => prev ? { ...prev, [field]: newValue } : null);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  return {
    stats,
    isLoading,
    incrementStat,
    refetch: fetchStats
  };
};
