import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Constrained-width scrollable content area used inside each screen.
 * Adds bottom padding to clear the fixed bottom nav (mobile) and provides
 * consistent horizontal margins.
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main className={cn('mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 pb-24 pt-4 lg:pb-6', className)}>
      {children}
    </main>
  );
}
