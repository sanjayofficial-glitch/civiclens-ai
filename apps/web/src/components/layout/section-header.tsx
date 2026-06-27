import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  /** Right-aligned action (e.g. "See all" link). */
  action?: ReactNode;
  className?: string;
}

/**
 * A labelled section header used in feeds and lists — e.g.
 * "Nearby Issues", "Trending", "Leaderboard".
 */
export function SectionHeader({
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-2', className)}>
      <div className="space-y-0.5">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
