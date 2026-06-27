import { useState, useEffect } from 'react';
import { LeaderboardService } from '../../services/leaderboard.service';
import type { LeaderboardPeriod } from '@blockseblock/shared';

export const useLeaderboard = (period: LeaderboardPeriod, limitCount = 50) => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = LeaderboardService.listenToLeaderboard(period, limitCount, (fetchedLeaders) => {
      setLeaders(fetchedLeaders);
      setLoading(false);
    });

    return () => unsub();
  }, [period, limitCount]);

  return { leaders, loading };
};
