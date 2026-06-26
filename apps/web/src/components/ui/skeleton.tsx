import * as React from 'react';
import { cn } from '@/lib/utils';

/** Animated placeholder used in loading states to mimic content blocks. */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Skeleton };
