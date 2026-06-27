import { useState, useEffect } from 'react';
import { AnalyticsService, type GlobalStats } from '../../services/analytics.service';

export const useCommunityStats = () => {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = AnalyticsService.listenToCommunityStats((fetchedStats) => {
      setStats(fetchedStats);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { stats, loading };
};
