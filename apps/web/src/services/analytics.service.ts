import { doc, getDoc, getDocs, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase/firestore.service';

const ANALYTICS_COLLECTION = 'analytics';
const GLOBAL_DOC = 'global';

export interface GlobalStats {
  totalReports: number;
  resolvedThisWeek: number;
  activeIssues: number;
  communityVerifications: number;
}

export interface DailyMetrics {
  newIssues?: number;
  verifications?: number;
  comments?: number;
}

export interface CategoryMetric {
  category: string;
  reportCount: number;
}

export interface StatusMetric {
  status: string;
  issueCount: number;
}

export interface ImpactDay {
  date: string;
  newIssues: number;
  verifications: number;
  comments: number;
}

export interface ImpactMetrics {
  days: ImpactDay[];
  totalIssues: number;
  totalVerifications: number;
  totalComments: number;
}

function dailyDocId(date?: Date): string {
  const d = date ?? new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `daily_${y}-${m}-${day}`;
}

function getDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function pluckMetrics(data: Record<string, unknown>): Record<string, number> {
  const m = data.metrics as Record<string, number> | undefined;
  return m ?? {};
}

export const AnalyticsService = {
  getCommunityStats: async (): Promise<GlobalStats | null> => {
    const docRef = doc(db, ANALYTICS_COLLECTION, GLOBAL_DOC);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    const m = (data.metrics as Record<string, number>) || {};
    return {
      totalReports: m.totalReports || m.totalIssues || 0,
      resolvedThisWeek: m.resolvedThisWeek || 0,
      activeIssues: m.activeIssues || 0,
      communityVerifications: m.communityVerifications || 0,
    };
  },

  listenToCommunityStats: (callback: (stats: GlobalStats | null) => void) => {
    return onSnapshot(doc(db, ANALYTICS_COLLECTION, GLOBAL_DOC), (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }
      const data = snap.data();
      const m = (data.metrics as Record<string, number>) || {};
      callback({
        totalReports: m.totalReports || m.totalIssues || 0,
        resolvedThisWeek: m.resolvedThisWeek || 0,
        activeIssues: m.activeIssues || 0,
        communityVerifications: m.communityVerifications || 0,
      });
    });
  },

  getDailyMetrics: async (dateStr: string): Promise<DailyMetrics | null> => {
    const docRef = doc(db, ANALYTICS_COLLECTION, `daily_${dateStr}`);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return pluckMetrics(snap.data() as Record<string, unknown>) as unknown as DailyMetrics;
  },

  listenToDailyMetrics: (dateStr: string, callback: (metrics: DailyMetrics | null) => void) => {
    return onSnapshot(doc(db, ANALYTICS_COLLECTION, `daily_${dateStr}`), (snap) => {
      callback(snap.exists() ? (pluckMetrics(snap.data() as Record<string, unknown>) as unknown as DailyMetrics) : null);
    });
  },

  getCategoryBreakdown: async (): Promise<CategoryMetric[]> => {
    const q = query(collection(db, ANALYTICS_COLLECTION), where('scope', '==', 'category'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      const metrics = pluckMetrics(data);
      return {
        category: d.id.replace('category_', ''),
        reportCount: (metrics.reportCount ?? 0) as number,
      };
    });
  },

  getStatusDistribution: async (): Promise<StatusMetric[]> => {
    const q = query(collection(db, ANALYTICS_COLLECTION), where('scope', '==', 'status'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      const metrics = pluckMetrics(data);
      return {
        status: d.id.replace('status_', ''),
        issueCount: (metrics.issueCount ?? 0) as number,
      };
    });
  },

  getImpactMetrics: async (days: number = 7): Promise<ImpactMetrics> => {
    const results: ImpactDay[] = [];
    let totalIssues = 0;
    let totalVerifications = 0;
    let totalComments = 0;

    const today = new Date();
    const reads: Promise<void>[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = getDateStr(d);
      reads.push(
        AnalyticsService.getDailyMetrics(dateStr).then((metrics) => {
          const m = metrics ?? {};
          const ni = m.newIssues ?? 0;
          const ve = m.verifications ?? 0;
          const co = m.comments ?? 0;
          results.push({ date: dateStr, newIssues: ni, verifications: ve, comments: co });
          totalIssues += ni;
          totalVerifications += ve;
          totalComments += co;
        }),
      );
    }

    await Promise.all(reads);

    return { days: results, totalIssues, totalVerifications, totalComments };
  },
};
