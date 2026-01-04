import React from 'react';
import { Card } from '@/components/ui/card';
import { useBadges } from '@/hooks/useBadges';
import { cn } from '@/lib/utils';
import { Loader2, Lock, Trophy } from 'lucide-react';

interface BadgesDisplayProps {
  showAll?: boolean;
  compact?: boolean;
}

export const BadgesDisplay: React.FC<BadgesDisplayProps> = ({ 
  showAll = true, 
  compact = false 
}) => {
  const { allBadges, userBadges, earnedBadgeIds, isLoading } = useBadges();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const displayBadges = showAll ? allBadges : allBadges.filter(b => earnedBadgeIds.has(b.id));
  
  // Group badges by category
  const groupedBadges = displayBadges.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, typeof displayBadges>);

  const categoryNames: Record<string, string> = {
    video: 'Video Rozetleri',
    exam: 'Sınav Rozetleri',
    homework: 'Ödev Rozetleri',
    general: 'Genel Rozetler'
  };

  if (compact) {
    // Compact view for dashboard
    const recentBadges = userBadges.slice(0, 5);
    
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Rozetlerim</h3>
          <span className="text-sm text-muted-foreground ml-auto">
            {userBadges.length}/{allBadges.length}
          </span>
        </div>
        
        {recentBadges.length === 0 ? (
          <p className="text-sm text-muted-foreground">Henüz rozet kazanmadın.</p>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {recentBadges.map(ub => (
              <div
                key={ub.id}
                className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl"
                title={ub.badge.name}
              >
                {ub.badge.icon}
              </div>
            ))}
            {userBadges.length > 5 && (
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-sm font-medium">
                +{userBadges.length - 5}
              </div>
            )}
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-bold">Başarı Rozetleri</h2>
          <p className="text-sm text-muted-foreground">
            Kazandığın rozetler: {userBadges.length}/{allBadges.length}
          </p>
        </div>
      </div>

      {Object.entries(groupedBadges).map(([category, badges]) => (
        <div key={category} className="space-y-3">
          <h3 className="font-semibold text-lg">{categoryNames[category] || category}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {badges.map(badge => {
              const isEarned = earnedBadgeIds.has(badge.id);
              const earnedData = userBadges.find(ub => ub.badge_id === badge.id);
              
              return (
                <Card
                  key={badge.id}
                  className={cn(
                    "p-4 text-center transition-all",
                    isEarned 
                      ? "bg-primary/5 border-primary/20" 
                      : "opacity-60 grayscale"
                  )}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl",
                    isEarned ? "bg-primary/10" : "bg-muted"
                  )}>
                    {isEarned ? badge.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{badge.name}</h4>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                  {earnedData && (
                    <p className="text-xs text-primary mt-2">
                      {new Date(earnedData.earned_at).toLocaleDateString('tr-TR')}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
