import { useState, useEffect, useCallback } from 'react';
import {
  AnalyticsService,
  type GlobalStats,
  type DailyMetrics,
  type CategoryMetric,
  type StatusMetric,
  type ImpactMetrics,
} from '../../services/analytics.service';

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

export const useDailyMetrics = (dateStr: string) => {
  const [metrics, setMetrics] = useState<DailyMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = AnalyticsService.listenToDailyMetrics(dateStr, (m) => {
      setMetrics(m);
      setLoading(false);
    });
    return () => unsub();
  }, [dateStr]);

  return { metrics, loading };
};

export const useCategoryBreakdown = () => {
  const [categories, setCategories] = useState<CategoryMetric[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AnalyticsService.getCategoryBreakdown();
      setCategories(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { categories, loading, refresh };
};

export const useStatusDistribution = () => {
  const [statuses, setStatuses] = useState<StatusMetric[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AnalyticsService.getStatusDistribution();
      setStatuses(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { statuses, loading, refresh };
};

export const useImpactMetrics = (days: number = 7) => {
  const [impact, setImpact] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AnalyticsService.getImpactMetrics(days);
      setImpact(data);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { impact, loading, refresh };
};
