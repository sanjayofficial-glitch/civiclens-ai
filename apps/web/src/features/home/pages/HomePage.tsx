import { Link, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Map,
  Camera,
  Trophy,
  TrendingUp,
  Activity,
  FileText,
  CheckCircle,
} from 'lucide-react';

const recentActivityIcons = [CheckCircle, Activity, Trophy] as const;
const recentActivityColors = ['text-success', 'text-info', 'text-warning'] as const;
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { NotificationBellLink } from '@/components/layout/BottomNav';
import { SearchInput } from '@/components/ui/search-input';
import { IssueCard } from '@/components/shared/IssueCard';
import { StatCard, QuickAction } from '@/components/shared/StatCard';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { useUser } from '@/hooks/data/useUser';
import { useIssues } from '@/hooks/data/useIssues';
import { useCommunityStats } from '@/hooks/data/useAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { formatRelativeTime } from '@/lib/constants';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const { user: authUser } = useAuth();
  const { user, loading: userLoading } = useUser();
  const { issues, loading: issuesLoading } = useIssues({}, 10);
  const { stats, loading: statsLoading } = useCommunityStats();

  // User-specific stats — use live query so they update immediately
  const myIssueFilters = useMemo(
    () => (user?.uid ? { reporterId: user.uid } : undefined),
    [user?.uid],
  );
  const { issues: myIssues } = useIssues(myIssueFilters, 50);

  const myReportCount = myIssueFilters
    ? myIssues.length || (user?.issuesReported ?? 0)
    : (user?.issuesReported ?? 0);
  const myVerifiedCount = myIssueFilters
    ? myIssues.filter(
        (i) => i.status === 'verified' || i.status === 'resolved' || i.status === 'in_progress',
      ).length || (user?.issuesVerified ?? 0)
    : (user?.issuesVerified ?? 0);

  const nearby = useMemo(() => issues.slice(0, 3), [issues]);
  const trending = useMemo(
    () =>
      [...issues]
        .sort((a, b) => (b.verification?.upvotes ?? 0) - (a.verification?.upvotes ?? 0))
        .slice(0, 3),
    [issues],
  );

  const recentActivity = useMemo(
    () =>
      issues.slice(0, 3).map((issue, i) => ({
        icon: recentActivityIcons[i] ?? CheckCircle,
        text: issue.title,
        time: formatRelativeTime(issue.createdAt),
        color: recentActivityColors[i] ?? 'text-muted-foreground',
      })),
    [issues],
  );

  const displayName = user?.displayName ?? authUser?.displayName ?? 'Citizen';
  const firstName = displayName.split(' ')[0];

  return (
    <AppLayout>
      <PageHeader
        title={`${greeting}, ${firstName}`}
        subtitle="Here's what's happening nearby"
        action={<NotificationBellLink />}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6 px-4 py-4"
      >
        <motion.div variants={item}>
          <SearchInput placeholder="Search issues, locations..." aria-label="Search issues" />
        </motion.div>

        <motion.section variants={item} aria-label="Quick actions">
          <h2 className="mb-3 text-sm font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-2">
            <QuickAction label="Report" icon={Camera} onClick={() => navigate('/report')} />
            <QuickAction label="Map" icon={Map} onClick={() => navigate('/map')} />
            <QuickAction label="Leaderboard" icon={Trophy} onClick={() => navigate('/leaderboard')} />
            <QuickAction label="My Reports" icon={FileText} onClick={() => navigate('/profile')} />
          </div>
        </motion.section>

        <motion.section variants={item} aria-label="Statistics">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Your Reports"
              value={userLoading ? 0 : myReportCount}
              icon={FileText}
            />
            <StatCard
              label="Verifications"
              value={userLoading ? 0 : myVerifiedCount}
              icon={CheckCircle}
            />
          </div>
        </motion.section>

        <motion.section variants={item} aria-label="Nearby issues">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Nearby Issues</h2>
            <Link to="/map" className="text-xs font-medium text-primary hover:underline">
              View map
            </Link>
          </div>
          <div className="space-y-3">
            {issuesLoading ? (
              <>
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </>
            ) : nearby.map((issue) => (
              <IssueCard key={issue.id} issue={issue} variant="horizontal" />
            ))}
          </div>
        </motion.section>

        <motion.section variants={item} aria-label="Trending issues">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-semibold">Trending</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            {issuesLoading ? (
              <Skeleton className="h-48 w-64 shrink-0 rounded-xl" />
            ) : trending.map((issue) => (
              <div key={issue.id} className="w-64 shrink-0">
                <IssueCard issue={issue} variant="default" />
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section variants={item} aria-label="Community statistics">
          <h2 className="mb-3 text-sm font-semibold">Community Impact</h2>
          <div className="glass-medium rounded-2xl border border-white/5 dark:border-border/50 p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">
                  {statsLoading ? '-' : (stats?.totalReports.toLocaleString() ?? '0')}
                </p>
                <p className="text-xs text-muted-foreground">Total Reports</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">
                  {statsLoading ? '-' : (stats?.resolvedThisWeek ?? '0')}
                </p>
                <p className="text-xs text-muted-foreground">Resolved This Week</p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section variants={item} aria-label="Recent activity">
          <h2 className="mb-3 text-sm font-semibold">Recent Activity</h2>
          <div className="space-y-2">
            {recentActivity.map((act, i) => (
              <div
                key={i}
                className="glass-light flex items-center gap-3 rounded-xl border border-white/5 dark:border-border/50 p-3"
              >
                <div className={`grid size-9 place-items-center rounded-full bg-muted ${act.color}`}>
                  <act.icon className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{act.text}</p>
                  <p className="text-xs text-muted-foreground">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section variants={item} className="pb-4" aria-label="Your rank">
          <Link
            to="/leaderboard"
            className="glass-light flex items-center gap-3 rounded-xl border border-indigo-500/20 p-4 transition-colors hover:bg-white/5"
          >
            <Avatar>
              <AvatarFallback className="bg-primary/15 text-primary">
                {firstName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">Your Community Rank</p>
              <p className="text-xs text-muted-foreground">
                {userLoading ? '-' : (user?.reputation?.toLocaleString() ?? '0')} points · {userLoading ? '-' : (user?.streakDays ?? '0')}-day streak
              </p>
            </div>
            <Badge variant="secondary">View</Badge>
          </Link>
        </motion.section>
      </motion.div>
    </AppLayout>
  );
}
