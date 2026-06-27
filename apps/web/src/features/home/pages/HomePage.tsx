import { Link, useNavigate } from 'react-router-dom';
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

  const { user, loading: userLoading } = useUser();
  const { issues, loading: issuesLoading } = useIssues({}, 10);
  const { stats, loading: statsLoading } = useCommunityStats();

  const nearby = issues.slice(0, 3);
  const trending = [...issues]
    .sort((a, b) => b.verification.upvotes - a.verification.upvotes)
    .slice(0, 3);

  const recentActivityIcons = [CheckCircle, Activity, Trophy] as const;
  const recentActivityColors = ['text-success', 'text-info', 'text-warning'] as const;
  const recentActivity = issues.slice(0, 3).map((issue, i) => ({
    icon: recentActivityIcons[i] ?? CheckCircle,
    text: issue.title,
    time: formatRelativeTime(issue.createdAt),
    color: recentActivityColors[i] ?? 'text-muted-foreground',
  }));

  const displayName = user?.displayName ?? 'Citizen';
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
              value={userLoading ? 0 : (user?.issuesReported ?? 0)}
              icon={FileText}
              trend="+3 this week"
              trendUp
            />
            <StatCard
              label="Verifications"
              value={userLoading ? 0 : (user?.issuesVerified ?? 0)}
              icon={CheckCircle}
              trend="+8 this week"
              trendUp
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
          <div className="glass rounded-xl border border-border/50 p-4">
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
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3"
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
            className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 transition-colors hover:bg-primary/10"
          >
            <Avatar>
              <AvatarFallback className="bg-primary/15 text-primary">
                {firstName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">You&apos;re ranked #3 this week</p>
              <p className="text-xs text-muted-foreground">
                {userLoading ? '-' : (user?.reputation.toLocaleString() ?? '0')} points · {userLoading ? '-' : (user?.streakDays ?? '0')}-day streak
              </p>
            </div>
            <Badge variant="secondary">View</Badge>
          </Link>
        </motion.section>
      </motion.div>
    </AppLayout>
  );
}
