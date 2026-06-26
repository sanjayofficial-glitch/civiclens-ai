import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings,
  LogOut,
  FileText,
  Trophy,
  Star,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { IssueCard } from '@/components/shared/IssueCard';
import { MOCK_USER, MOCK_BADGES, MOCK_ISSUES } from '@/data/mock-data';

export default function ProfilePage() {
  const myReports = MOCK_ISSUES.filter((i) => i.reporterId === MOCK_USER.uid);
  const earnedBadges = MOCK_BADGES.filter((b) => MOCK_USER.badges.includes(b.id));

  return (
    <AppLayout>
      <PageHeader
        title="Profile"
        action={
          <Button variant="ghost" size="icon-sm" asChild aria-label="Settings">
            <Link to="/settings">
              <Settings className="size-5" />
            </Link>
          </Button>
        }
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 px-4 py-4"
      >
        <div className="flex flex-col items-center text-center">
          <Avatar className="size-20">
            <AvatarFallback className="bg-primary/15 text-2xl text-primary">
              {MOCK_USER.displayName.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <h2 className="mt-3 text-xl font-bold">{MOCK_USER.displayName}</h2>
          <p className="text-sm text-muted-foreground">{MOCK_USER.email}</p>
          <div className="mt-3 flex gap-2">
            <Badge variant="secondary">
              <Trophy className="mr-1 size-3" aria-hidden="true" />
              {MOCK_USER.reputation.toLocaleString()} pts
            </Badge>
            <Badge variant="secondary">
              🔥 {MOCK_USER.streakDays}-day streak
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <Card>
            <CardContent className="p-3">
              <p className="text-xl font-bold">{MOCK_USER.issuesReported}</p>
              <p className="text-xs text-muted-foreground">Reports</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xl font-bold">{MOCK_USER.issuesVerified}</p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xl font-bold">{earnedBadges.length}</p>
              <p className="text-xs text-muted-foreground">Badges</p>
            </CardContent>
          </Card>
        </div>

        <section aria-label="Achievements">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Star className="size-4 text-warning" aria-hidden="true" />
            Achievements
          </h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="glass shrink-0 rounded-xl border border-border/50 px-4 py-3 text-center"
              >
                <span className="text-2xl" role="img" aria-label={badge.name}>
                  {badge.icon}
                </span>
                <p className="mt-1 text-xs font-medium">{badge.name}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="My reports">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="size-4" aria-hidden="true" />
              My Reports
            </h3>
            <Link to="/home" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          {myReports.length > 0 ? (
            <div className="space-y-3">
              {myReports.map((issue) => (
                <IssueCard key={issue.id} issue={issue} variant="horizontal" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No reports yet. Start by reporting a civic issue!
              </CardContent>
            </Card>
          )}
        </section>

        <Separator />

        <nav aria-label="Profile actions" className="space-y-1">
          <Link
            to="/settings"
            className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-accent"
          >
            <span className="flex items-center gap-3 text-sm">
              <Settings className="size-5 text-muted-foreground" aria-hidden="true" />
              Settings
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
          <Link
            to="/leaderboard"
            className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-accent"
          >
            <span className="flex items-center gap-3 text-sm">
              <Trophy className="size-5 text-muted-foreground" aria-hidden="true" />
              Leaderboard
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-xl p-3 text-destructive transition-colors hover:bg-destructive/10"
            onClick={() => {}}
          >
            <span className="flex items-center gap-3 text-sm">
              <LogOut className="size-5" aria-hidden="true" />
              Log Out
            </span>
          </button>
        </nav>
      </motion.div>
    </AppLayout>
  );
}
