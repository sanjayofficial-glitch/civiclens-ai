import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { TopBar } from './top-bar';
import { BottomNav } from './bottom-nav';
import { cn } from '@/lib/utils';

export interface AppShellProps {
  /** Override the default TopBar title. */
  title?: string;
  /** Show the bottom nav on these routes. Default: always on mobile. */
  showBottomNav?: boolean;
  className?: string;
}

/**
 * Root layout shell — renders TopBar, page content (animated transitions),
 * and BottomNav. On desktop the BottomNav hides; a sidebar will replace it
 * in a future iteration.
 */
export function AppShell({
  title,
  showBottomNav = true,
  className,
}: AppShellProps) {
  const location = useLocation();

  return (
    <div className={cn('flex min-h-dvh flex-col bg-background', className)}>
      <TopBar title={title} />

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>

      {showBottomNav && <BottomNav />}
    </div>
  );
}
