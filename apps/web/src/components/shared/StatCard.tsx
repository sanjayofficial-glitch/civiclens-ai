import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
            {trend ? (
              <p
                className={cn(
                  'mt-1 text-xs font-medium',
                  trendUp ? 'text-success' : 'text-muted-foreground',
                )}
              >
                {trend}
              </p>
            ) : null}
          </div>
          <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickActionProps {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function QuickAction({
  label,
  icon: Icon,
  onClick,
  className,
}: QuickActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card p-3 transition-colors hover:bg-accent',
        className,
      )}
    >
      <div className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
