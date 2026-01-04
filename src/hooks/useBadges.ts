import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
}

export interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge: Badge;
}

export const useBadges = () => {
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchBadges = async () => {
    // Fetch all available badges
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .order('requirement_value', { ascending: true });

    if (badgesError) {
      console.error('Error fetching badges:', badgesError);
    } else {
      setAllBadges(badges || []);
    }

    // Fetch user's earned badges
    if (user) {
      const { data: earned, error: earnedError } = await supabase
        .from('user_badges')
        .select(`
          id,
          badge_id,
          earned_at,
          badges (*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (earnedError) {
        console.error('Error fetching user badges:', earnedError);
      } else {
        setUserBadges(
          earned?.map(ub => ({
            id: ub.id,
            badge_id: ub.badge_id,
            earned_at: ub.earned_at,
            badge: ub.badges as unknown as Badge
          })) || []
        );
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchBadges();
  }, [user]);

  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));

  return {
    allBadges,
    userBadges,
    earnedBadgeIds,
    isLoading,
    refetch: fetchBadges
  };
};
