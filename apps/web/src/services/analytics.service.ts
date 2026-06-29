import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase/firestore.service';

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

function getDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const parseDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  const d = new Date(timestamp);
  return isNaN(d.getTime()) ? null : d;
};

export const AnalyticsService = {
  getCommunityStats: async (): Promise<GlobalStats | null> => {
    const snap = await getDocs(collection(db, 'issues'));
    const issues = snap.docs.map(d => d.data());
    
    const totalReports = issues.length;
    const activeIssues = issues.filter(
      i => i.status === 'reported' || i.status === 'verified' || i.status === 'in_progress'
    ).length;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const resolvedThisWeek = issues.filter(i => {
      if (i.status !== 'resolved') return false;
      const resolvedAt = parseDate(i.resolution?.resolvedAt || i.updatedAt);
      return resolvedAt && resolvedAt >= oneWeekAgo;
    }).length;

    const communityVerifications = issues.reduce(
      (sum, i) => sum + (i.verification?.upvotes || 0),
      0
    );

    return {
      totalReports,
      resolvedThisWeek,
      activeIssues,
      communityVerifications,
    };
  },

  listenToCommunityStats: (callback: (stats: GlobalStats | null) => void) => {
    return onSnapshot(collection(db, 'issues'), (snap) => {
      const issues = snap.docs.map(d => d.data());
      
      const totalReports = issues.length;
      const activeIssues = issues.filter(
        i => i.status === 'reported' || i.status === 'verified' || i.status === 'in_progress'
      ).length;
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const resolvedThisWeek = issues.filter(i => {
        if (i.status !== 'resolved') return false;
        const resolvedAt = parseDate(i.resolution?.resolvedAt || i.updatedAt);
        return resolvedAt && resolvedAt >= oneWeekAgo;
      }).length;

      const communityVerifications = issues.reduce(
        (sum, i) => sum + (i.verification?.upvotes || 0),
        0
      );

      callback({
        totalReports,
        resolvedThisWeek,
        activeIssues,
        communityVerifications,
      });
    });
  },

  getDailyMetrics: async (dateStr: string): Promise<DailyMetrics | null> => {
    const snap = await getDocs(collection(db, 'issues'));
    const issues = snap.docs.map(d => d.data());
    
    const dayIssues = issues.filter(i => {
      const d = parseDate(i.createdAt);
      return d && getDateStr(d) === dateStr;
    });

    const upvotes = dayIssues.reduce((sum, i) => sum + (i.verification?.upvotes || 0), 0);

    return {
      newIssues: dayIssues.length,
      verifications: upvotes,
      comments: 0,
    };
  },

  listenToDailyMetrics: (dateStr: string, callback: (metrics: DailyMetrics | null) => void) => {
    return onSnapshot(collection(db, 'issues'), (snap) => {
      const issues = snap.docs.map(d => d.data());
      const dayIssues = issues.filter(i => {
        const d = parseDate(i.createdAt);
        return d && getDateStr(d) === dateStr;
      });
      const upvotes = dayIssues.reduce((sum, i) => sum + (i.verification?.upvotes || 0), 0);
      callback({
        newIssues: dayIssues.length,
        verifications: upvotes,
        comments: 0,
      });
    });
  },

  getCategoryBreakdown: async (): Promise<CategoryMetric[]> => {
    const snap = await getDocs(collection(db, 'issues'));
    const counts: Record<string, number> = {};
    
    snap.docs.forEach((d) => {
      const issue = d.data();
      const cat = issue.category || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts).map(([category, reportCount]) => ({
      category,
      reportCount,
    }));
  },

  getStatusDistribution: async (): Promise<StatusMetric[]> => {
    const snap = await getDocs(collection(db, 'issues'));
    const counts: Record<string, number> = {
      reported: 0,
      verified: 0,
      in_progress: 0,
      resolved: 0,
      rejected: 0,
    };
    
    snap.docs.forEach((d) => {
      const issue = d.data();
      let status = issue.status || 'reported';
      
      // If the issue is 'reported' but has community verifications (upvotes),
      // represent it as 'verified' in the status distribution chart.
      if (status === 'reported' && (issue.verification?.upvotes || 0) > 0) {
        status = 'verified';
      }
      
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts).map(([status, issueCount]) => ({
      status,
      issueCount,
    }));
  },

  getImpactMetrics: async (days: number = 7): Promise<ImpactMetrics> => {
    const issuesSnap = await getDocs(collection(db, 'issues'));
    const issuesList = issuesSnap.docs.map(d => d.data());
    
    const commentsSnap = await getDocs(collection(db, 'comments'));
    const commentsList = commentsSnap.docs.map(d => d.data());

    const results: ImpactDay[] = [];
    let totalIssues = 0;
    let totalVerifications = 0;
    let totalComments = 0;

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = getDateStr(d);
      
      const dayIssues = issuesList.filter(issue => {
        const createdAt = parseDate(issue.createdAt);
        return createdAt && getDateStr(createdAt) === dateStr;
      });
      
      const dayComments = commentsList.filter(comment => {
        const createdAt = parseDate(comment.createdAt);
        return createdAt && getDateStr(createdAt) === dateStr;
      });

      const dayVerifications = dayIssues.reduce((sum, issue) => sum + (issue.verification?.upvotes || 0), 0);

      results.push({
        date: dateStr,
        newIssues: dayIssues.length,
        verifications: dayVerifications,
        comments: dayComments.length,
      });

      totalIssues += dayIssues.length;
      totalVerifications += dayVerifications;
      totalComments += dayComments.length;
    }

    return { days: results, totalIssues, totalVerifications, totalComments };
  },
};
