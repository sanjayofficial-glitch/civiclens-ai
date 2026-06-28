import { useState, useEffect } from 'react';
import { useAuth } from '../useAuth';
import type { User as DomainUser } from '@blockseblock/shared';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase/firestore.service';
import { userConverter } from '../../services/converters';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { BADGES } from '../../lib/constants';

export const useUser = () => {
  const { user: authUser, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<DomainUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Track badges to detect when a new one is awarded
  const [prevBadges, setPrevBadges] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!authUser) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      doc(db, 'users', authUser.uid).withConverter(userConverter),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setUserProfile(data);
          
          // Check for new badges
          const currentBadgesSet = new Set(data.badges || []);
          if (prevBadges !== null) {
            const newBadges = (data.badges || []).filter(b => !prevBadges.has(b));
            if (newBadges.length > 0) {
              // Trigger confetti
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                zIndex: 10000,
              });
              
              // Show toast for each new badge
              newBadges.forEach(badgeId => {
                const badgeDef = BADGES.find(b => b.id === badgeId);
                if (badgeDef) {
                  toast.success(`Badge Unlocked: ${badgeDef.name}`, {
                    description: badgeDef.description,
                    icon: badgeDef.icon,
                    duration: 5000,
                  });
                }
              });
            }
          }
          setPrevBadges(currentBadgesSet);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching user profile:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [authUser, authLoading]);

  return { user: userProfile, loading: loading || authLoading };
};
