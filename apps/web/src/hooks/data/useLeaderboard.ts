import type { LeaderboardPeriod } from '@civiclens/shared';

import { useState, useEffect, useCallback } from 'react';

import { LeaderboardService } from '../../services/leaderboard.service';

export const useLeaderboard = (period: LeaderboardPeriod, limitCount = 50) => {
  const [leaders, setLeaders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const unsub = LeaderboardService.listenToLeaderboard(
      period,
      limitCount,
      (fetchedLeaders) => {
        setLeaders(fetchedLeaders);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => {
      unsub();
    };
  }, [period, limitCount, retryKey]);

  const refresh = useCallback(() => {
    setRetryKey((k) => k + 1);
  }, []);

  return { leaders, loading, error, refresh };
};
