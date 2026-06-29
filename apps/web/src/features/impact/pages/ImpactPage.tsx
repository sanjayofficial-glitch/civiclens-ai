import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useImpactMetrics, useCategoryBreakdown, useStatusDistribution } from '@/hooks/data/useAnalytics';
import { getCategoryMeta } from '@/lib/issue-meta';
import { CATEGORY_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { IssueCategory } from '@civiclens/shared';

const DAY_LABELS: Record<string, string> = {
  '0': 'Mon',
  '1': 'Tue',
  '2': 'Wed',
  '3': 'Thu',
  '4': 'Fri',
  '5': 'Sat',
  '6': 'Sun',
};

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return DAY_LABELS[String(d.getDay())] ?? dateStr.slice(-2);
}

function Bar({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-medium tabular-nums text-muted-foreground">{value}</span>
      <div className="flex h-24 w-6 items-end rounded-full bg-muted">
        <div
          className={cn('w-full rounded-full transition-all duration-500', color)}
          style={{ height: `${Math.max(pct, 2)}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

function HorizontalBar({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 truncate text-sm">{label}</span>
      <div className="flex h-5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn('rounded-full transition-all duration-500', color)}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
      <span className="w-8 text-right text-sm tabular-nums text-muted-foreground">{value}</span>
    </div>
  );
}

export default function ImpactPage() {
  const { impact, loading: impactLoading } = useImpactMetrics(7);
  const { categories, loading: catLoading } = useCategoryBreakdown();
  const { statuses, loading: statusLoading } = useStatusDistribution();

  const maxDaily = useMemo(() => {
    if (!impact?.days.length) return 0;
    return Math.max(...impact.days.map((d) => d.newIssues + d.verifications + d.comments), 1);
  }, [impact]);

  const maxCat = useMemo(() => {
    if (!categories.length) return 0;
    return Math.max(...categories.map((c) => c.reportCount), 1);
  }, [categories]);

  const maxStatus = useMemo(() => {
    if (!statuses.length) return 0;
    return Math.max(...statuses.map((s) => s.issueCount), 1);
  }, [statuses]);

  const loading = impactLoading || catLoading || statusLoading;

  return (
    <AppLayout>
      <PageHeader
        title="Community Impact"
        subtitle="See how your community makes a difference"
        action={<TrendingUp className="size-6 text-primary" aria-hidden="true" />}
      />

      <div className="space-y-6 px-4 py-4">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : (
          <>
            {impact && (
              <section aria-label="Daily activity">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <Activity className="size-4 text-primary" aria-hidden="true" />
                      Last 7 Days
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {impact.totalIssues} reports &middot; {impact.totalVerifications} verifications &middot; {impact.totalComments} comments
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between">
                      {impact.days.map((day) => (
                        <Bar
                          key={day.date}
                          value={day.newIssues + day.verifications + day.comments}
                          max={maxDaily}
                          label={dayLabel(day.date)}
                          color="bg-primary"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            <section aria-label="Category breakdown">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <BarChart3 className="size-4 text-primary" aria-hidden="true" />
                    Reports by Category
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {CATEGORY_OPTIONS.map((opt) => {
                    const meta = getCategoryMeta(opt.value);
                    const cat = categories.find((c) => c.category === opt.value);
                    const value = cat?.reportCount ?? 0;
                    const chip = meta?.chip ?? 'bg-muted';
                    return (
                      <div key={opt.value} className="flex items-center gap-3">
                        <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg', chip)}>
                          {meta && <meta.icon className="size-4" aria-hidden="true" />}
                        </span>
                        <HorizontalBar
                          value={value}
                          max={maxCat}
                          label={opt.label}
                          color={chip}
                        />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </section>

            <section aria-label="Status distribution">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <PieChart className="size-4 text-primary" aria-hidden="true" />
                    Issue Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {['reported', 'verified', 'in_progress', 'resolved', 'rejected'].map((s) => {
                    const st = statuses.find((st) => st.status === s);
                    const value = st?.issueCount ?? 0;
                    return (
                      <HorizontalBar
                        key={s}
                        value={value}
                        max={maxStatus}
                        label={s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        color="bg-primary/60"
                      />
                    );
                  })}
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
}
