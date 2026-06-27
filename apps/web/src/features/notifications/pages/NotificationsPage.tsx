import { useCallback, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  MessageSquare,
  Trophy,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { timestampToDate, type NotificationType, type Notification } from '@blockseblock/shared';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatRelativeTime } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/data/useNotifications';
import { NotificationService } from '@/services/notification.service';
import { useAuth } from '@/hooks/useAuth';

const TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  issue_update: AlertCircle,
  vote: Bell,
  comment: MessageSquare,
  verification: CheckCheck,
  assignment: Bell,
  resolution: Sparkles,
  leaderboard: Trophy,
  general: Bell,
};

type Filter = 'all' | 'unread';

function groupByDate(notifications: (Notification & { id: string })[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; items: (Notification & { id: string })[] }[] = [];
  const todayItems: (Notification & { id: string })[] = [];
  const yesterdayItems: (Notification & { id: string })[] = [];
  const olderItems: (Notification & { id: string })[] = [];

  for (const n of notifications) {
    const d = timestampToDate(n.createdAt);
    if (d >= today) todayItems.push(n);
    else if (d >= yesterday) yesterdayItems.push(n);
    else olderItems.push(n);
  }

  if (todayItems.length) groups.push({ label: 'Today', items: todayItems });
  if (yesterdayItems.length) groups.push({ label: 'Yesterday', items: yesterdayItems });
  if (olderItems.length) groups.push({ label: 'Earlier', items: olderItems });
  return groups;
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const { notifications: items, unreadCount, loading } = useNotifications();

  const filtered = useMemo(
    () => (filter === 'unread' ? items.filter((n) => !n.read) : items),
    [filter, items],
  );

  const groups = groupByDate(filtered.slice(0, page * 5));
  const hasMore = filtered.length > page * 5;

  const markAllRead = async () => {
    if (user) {
      await NotificationService.markAllAsRead(user.uid);
    }
  };

  const refresh = useCallback(() => {
    setPage(1);
  }, []);

  return (
    <AppLayout>
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread`}
        action={
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck className="size-4" aria-hidden="true" />
            Mark all read
          </Button>
        }
      />

      <div className="px-4 py-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          variant="outline"
          size="sm"
          fullWidth
          className="mb-4"
          onClick={refresh}
          isLoading={loading}
        >
          Pull to refresh
        </Button>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up!"
          />
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <section key={group.label} aria-label={group.label}>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </h2>
                <div className="space-y-2">
                  {group.items.map((n, i) => {
                    const Icon = TYPE_ICONS[n.type];
                    const issueId = n.data?.issueId as string | undefined;
                    return (
                      <motion.div
                        key={`${n.title}-${i}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link
                          to={issueId ? `/issues/${issueId}` : '#'}
                          className={cn(
                            'flex gap-3 rounded-xl border p-3 transition-colors hover:bg-accent',
                            !n.read
                              ? 'border-primary/20 bg-primary/5'
                              : 'border-border/50 bg-card',
                          )}
                          onClick={() => {
                            if (!n.read) NotificationService.markAsRead(n.id);
                          }}
                        >
                          <div
                            className={cn(
                              'grid size-10 shrink-0 place-items-center rounded-full',
                              !n.read ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
                            )}
                          >
                            <Icon className="size-5" aria-hidden="true" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium">{n.title}</p>
                              {!n.read && (
                                <span className="size-2 shrink-0 rounded-full bg-primary" />
                              )}
                            </div>
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                              {n.body}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatRelativeTime(n.createdAt)}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            ))}

            {hasMore && (
              <Button
                variant="outline"
                fullWidth
                onClick={() => setPage((p) => p + 1)}
              >
                Load more
              </Button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
