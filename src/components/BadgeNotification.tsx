import React, { useEffect, useState, useRef } from 'react';
import { useBadges } from '@/hooks/useBadges';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface BadgeNotificationProps {
  children: React.ReactNode;
}

export const BadgeNotification: React.FC<BadgeNotificationProps> = ({ children }) => {
  const { userBadges } = useBadges();
  const [showDialog, setShowDialog] = useState(false);
  const [newBadge, setNewBadge] = useState<typeof userBadges[0] | null>(null);
  const initialLoadDone = useRef(false);
  const [seenBadgeIds, setSeenBadgeIds] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('seen_badge_ids');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  useEffect(() => {
    if (userBadges.length === 0) return;

    // On first load, mark all existing badges as seen (no popup)
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      const allIds = new Set(userBadges.map(ub => ub.badge_id));
      const storedIds = new Set(seenBadgeIds);
      // Only show popup for badges that were never in localStorage
      const unseenBadge = userBadges.find(ub => !storedIds.has(ub.badge_id));
      
      if (storedIds.size === 0) {
        // First time ever - mark all as seen, no popup
        setSeenBadgeIds(allIds);
        localStorage.setItem('seen_badge_ids', JSON.stringify([...allIds]));
        return;
      }

      if (unseenBadge) {
        setNewBadge(unseenBadge);
        setShowDialog(true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
      return;
    }

    // After initial load, check for newly earned badges
    const unseenBadge = userBadges.find(ub => !seenBadgeIds.has(ub.badge_id));
    if (unseenBadge) {
      setNewBadge(unseenBadge);
      setShowDialog(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [userBadges]);

  const handleClose = () => {
    if (newBadge) {
      const updatedSeen = new Set(seenBadgeIds);
      updatedSeen.add(newBadge.badge_id);
      setSeenBadgeIds(updatedSeen);
      localStorage.setItem('seen_badge_ids', JSON.stringify([...updatedSeen]));
    }
    setShowDialog(false);
    setNewBadge(null);
  };

  return (
    <>
      {children}
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">🎉 Tebrikler!</DialogTitle>
          </DialogHeader>
          
          {newBadge && (
            <div className="py-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mx-auto flex items-center justify-center text-5xl mb-4 animate-bounce">
                {newBadge.badge?.icon || '🏆'}
              </div>
              <h3 className="text-xl font-bold mb-2">{newBadge.badge?.name}</h3>
              <p className="text-muted-foreground mb-4">{newBadge.badge?.description}</p>
              <p className="text-sm text-primary font-medium">
                Yeni bir rozet kazandın!
              </p>
            </div>
          )}
          
          <Button onClick={handleClose} className="w-full">
            Harika! 🚀
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
