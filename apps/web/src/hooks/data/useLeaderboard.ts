import { useState, useEffect } from 'react';
import { LeaderboardService } from '../../services/leaderboard.service';
import type { User } from '@blockseblock/shared';

export const useLeaderboard = (limitCount = 50) => {
  const [leaders, setLeaders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = LeaderboardService.listenToTopUsers(limitCount, (fetchedLeaders) => {
      setLeaders(fetchedLeaders);
      setLoading(false);
    });

    return () => unsub();
  }, [limitCount]);

  return { leaders, loading };
};
