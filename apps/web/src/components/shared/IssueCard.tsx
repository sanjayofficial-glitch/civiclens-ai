import { Link } from 'react-router-dom';
import type { Issue } from '@blockseblock/shared';
import { MapPin, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getCategoryMeta,
  getSeverityMeta,
  getStatusMeta,
} from '@/lib/issue-meta';
import { formatRelativeTime } from '@/data/mock-data';
import { cn } from '@/lib/utils';

interface IssueCardProps {
  issue: Issue;
  variant?: 'default' | 'compact' | 'horizontal';
  className?: string;
}

export function IssueCard({
  issue,
  variant = 'default',
  className,
}: IssueCardProps) {
  const status = getStatusMeta(issue.status);
  const severity = getSeverityMeta(issue.severity);
  const category = getCategoryMeta(issue.category);
  const CategoryIcon = category.icon;
  const thumbnail =
    issue.media.thumbnail ?? issue.media.images[0] ?? undefined;

  if (variant === 'horizontal') {
    return (
      <Link to={`/issues/${issue.id}`} className={cn('block', className)}>
        <Card className="overflow-hidden transition-shadow hover:shadow-md">
          <CardContent className="flex gap-3 p-3">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt=""
                className="size-16 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="grid size-16 shrink-0 place-items-center rounded-lg bg-muted">
                <CategoryIcon className="size-6 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="line-clamp-1 font-medium">{issue.title}</p>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge className={status.softBadge}>{status.label}</Badge>
                <Badge className={severity.softBadge}>{severity.label}</Badge>
              </div>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" aria-hidden="true" />
                <span className="truncate">{issue.location.address}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/issues/${issue.id}`} className={cn('block', className)}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        {thumbnail && variant === 'default' ? (
          <div className="relative aspect-[16/9] overflow-hidden">
            <img
              src={thumbnail}
              alt=""
              className="size-full object-cover"
            />
            <div className="absolute left-2 top-2">
              <Badge className={status.softBadge}>{status.label}</Badge>
            </div>
          </div>
        ) : null}
        <CardContent className={cn('p-4', variant === 'compact' && 'p-3')}>
          <div className="flex items-start gap-2">
            <div
              className={cn(
                'grid size-8 shrink-0 place-items-center rounded-lg',
                category.chip,
              )}
            >
              <CategoryIcon className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 font-medium leading-snug">
                {issue.title}
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{issue.location.address}</span>
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-1.5">
              {!thumbnail || variant === 'compact' ? (
                <Badge className={status.softBadge}>{status.label}</Badge>
              ) : null}
              <Badge className={severity.softBadge}>{severity.label}</Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(String(issue.createdAt))}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
