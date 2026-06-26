import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: ReactNode;
  /** Hide bottom navigation (e.g. full-screen flows) */
  hideNav?: boolean;
  className?: string;
}

export function AppLayout({ children, hideNav = false, className }: AppLayoutProps) {
  return (
    <div className="min-h-dvh bg-background">
      <main
        className={cn(
          'mx-auto w-full max-w-lg',
          !hideNav && 'pb-24',
          className,
        )}
      >
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-start justify-between gap-4 border-b border-border/50 bg-background/80 px-4 py-4 pt-safe backdrop-blur-md',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div
      className={cn(
        'relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-8',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute -left-1/4 -top-1/4 size-[600px] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 size-[500px] rounded-full bg-info/15 blur-3xl" />
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

interface GovLayoutProps {
  children: ReactNode;
}

export function GovLayout({ children }: GovLayoutProps) {
  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
