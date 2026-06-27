import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Star } from 'lucide-react';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import { useUser } from '@/hooks/data/useUser';
import { BADGES } from '@/lib/constants';
import type { LeaderboardPeriod } from '@blockseblock/shared';
import { cn } from '@/lib/utils';

const PERIODS: { value: LeaderboardPeriod; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'all_time', label: 'All Time' },
];

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="size-5 text-warning" aria-hidden="true" />;
  if (rank === 2) return <Medal className="size-5 text-muted-foreground" aria-hidden="true" />;
  if (rank === 3) return <Medal className="size-5 text-orange-400" aria-hidden="true" />;
  return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly');
  const { leaders, loading } = useLeaderboard(50);
  const { user } = useUser();
  const entries = leaders;
  
  // Create an array mapping for top 3: [2nd, 1st, 3rd]
  const topThree = [entries[1], entries[0], entries[2]];

  return (
    <AppLayout>
      <PageHeader
        title="Leaderboard"
        subtitle="Top community contributors"
        action={<Trophy className="size-6 text-primary" aria-hidden="true" />}
      />

      <div className="px-4 py-4">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as LeaderboardPeriod)}>
          <TabsList className="mb-6 w-full">
            {PERIODS.map((p) => (
              <TabsTrigger key={p.value} value={p.value} className="flex-1">
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {PERIODS.map((p) => (
            <TabsContent key={p.value} value={p.value}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-end justify-center gap-4 pb-2">
                      {topThree.map((entry, i) => {
                        if (!entry) return null;
                        const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
                        const heights = ['h-20', 'h-28', 'h-16'];
                        return (
                          <div
                            key={entry.uid}
                            className={cn(
                              'flex flex-col items-center',
                              i === 1 && '-mt-2',
                            )}
                          >
                            <Avatar className={cn('mb-2', i === 1 ? 'size-16' : 'size-12')}>
                              <AvatarFallback>
                                {entry.displayName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <RankIcon rank={rank} />
                            <p className="mt-1 max-w-[80px] truncate text-xs font-medium">
                              {entry.displayName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.reputation.toLocaleString()} pts
                            </p>
                            <div
                              className={cn(
                                'mt-2 w-16 rounded-t-lg bg-primary/20',
                                heights[i],
                              )}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-2">
                      {entries.map((entry, i) => {
                        const rank = i + 1;
                        const isMe = user ? entry.uid === user.uid : false;
                        return (
                          <Card
                            key={entry.uid}
                            className={cn(isMe && 'border-primary/30 bg-primary/5')}
                          >
                            <CardContent className="flex items-center gap-3 p-3">
                              <div className="flex w-8 justify-center">
                                <RankIcon rank={rank} />
                              </div>
                              <Avatar>
                                <AvatarFallback>
                                  {entry.displayName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">
                                  {entry.displayName}
                                  {isMe && (
                                    <Badge variant="secondary" className="ml-2">
                                      You
                                    </Badge>
                                  )}
                                </p>
                              </div>
                              <p className="font-bold text-primary">
                                {entry.reputation.toLocaleString()}
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>

        <section className="mt-8" aria-label="Badges and achievements">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Star className="size-4 text-warning" aria-hidden="true" />
            Badges & Achievements
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {BADGES.map((badge) => {
              const earned = user?.badges?.includes(badge.id);
              return (
                <Card
                  key={badge.id}
                  className={cn(!earned && 'opacity-50 grayscale')}
                >
                  <CardContent className="p-4 text-center">
                    <span className="text-2xl" role="img" aria-label={badge.name}>
                      {badge.icon}
                    </span>
                    <p className="mt-2 text-sm font-medium">{badge.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {badge.description}
                    </p>
                    {earned && (
                      <Badge className="mt-2" variant="secondary">
                        Earned
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
