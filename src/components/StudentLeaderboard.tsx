import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Award, Crown, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  user_id: string;
  name: string;
  avatar_url: string | null;
  badge_count: number;
  exam_score: number;
  total_points: number;
}

export const StudentLeaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('badges');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url');

      if (!profiles) {
        setIsLoading(false);
        return;
      }

      const { data: badgeCounts } = await supabase
        .from('user_badges')
        .select('user_id');

      const { data: examResults } = await supabase
        .from('exam_results')
        .select('user_id, score, total_questions')
        .eq('status', 'completed');

      const leaderboardData = profiles.map(profile => {
        const userBadges = badgeCounts?.filter(b => b.user_id === profile.user_id).length || 0;
        const userExams = examResults?.filter(e => e.user_id === profile.user_id) || [];
        const examScore = userExams.reduce((acc, exam) => {
          return acc + Math.round((exam.score / exam.total_questions) * 100);
        }, 0);
        const avgScore = userExams.length > 0 ? Math.round(examScore / userExams.length) : 0;
        
        return {
          user_id: profile.user_id,
          name: profile.name,
          avatar_url: profile.avatar_url,
          badge_count: userBadges,
          exam_score: avgScore,
          total_points: (userBadges * 10) + avgScore
        };
      });

      leaderboardData.sort((a, b) => b.badge_count - a.badge_count);
      setLeaderboard(leaderboardData.slice(0, 10));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
    setIsLoading(false);
  };

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (activeTab === 'badges') return b.badge_count - a.badge_count;
    if (activeTab === 'scores') return b.exam_score - a.exam_score;
    return b.total_points - a.total_points;
  });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{index + 1}</span>;
    }
  };

  const getRankBg = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20';
      case 1:
        return 'bg-gradient-to-r from-gray-300/10 to-gray-400/10 border-gray-400/20';
      case 2:
        return 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20';
      default:
        return 'bg-card';
    }
  };

  const renderLeaderboardEntry = (entry: LeaderboardEntry, index: number, valueDisplay: React.ReactNode) => (
    <div
      key={entry.user_id}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-md",
        getRankBg(index)
      )}
    >
      <div className="w-8 flex justify-center">
        {getRankIcon(index)}
      </div>
      <Avatar className="w-10 h-10">
        <AvatarImage src={entry.avatar_url || undefined} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {entry.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{entry.name}</p>
        <p className="text-xs text-muted-foreground">
          {entry.badge_count} rozet • %{entry.exam_score} ortalama
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold text-primary">{valueDisplay}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Öğrenci Sıralaması
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="badges" className="gap-1">
              <Award className="w-4 h-4" />
              Rozetler
            </TabsTrigger>
            <TabsTrigger value="scores" className="gap-1">
              <Star className="w-4 h-4" />
              Puanlar
            </TabsTrigger>
            <TabsTrigger value="total" className="gap-1">
              <Trophy className="w-4 h-4" />
              Genel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="badges" className="mt-0 space-y-2">
            {sortedLeaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Henüz sıralama verisi yok
              </div>
            ) : (
              sortedLeaderboard.map((entry, index) => 
                renderLeaderboardEntry(entry, index, `${entry.badge_count} 🏆`)
              )
            )}
          </TabsContent>

          <TabsContent value="scores" className="mt-0 space-y-2">
            {sortedLeaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Henüz sıralama verisi yok
              </div>
            ) : (
              sortedLeaderboard.map((entry, index) => 
                renderLeaderboardEntry(entry, index, `%${entry.exam_score}`)
              )
            )}
          </TabsContent>

          <TabsContent value="total" className="mt-0 space-y-2">
            {sortedLeaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Henüz sıralama verisi yok
              </div>
            ) : (
              sortedLeaderboard.map((entry, index) => 
                renderLeaderboardEntry(entry, index, `${entry.total_points} puan`)
              )
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
