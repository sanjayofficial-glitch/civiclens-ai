import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { TopBar } from './top-bar';
import { DynamicIsland } from './DynamicIsland';
import { useIsland } from '@/providers/island-provider';
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
 * and DynamicIsland.
 */
export function AppShell({
  title,
  showBottomNav = true,
  className,
}: AppShellProps) {
  const location = useLocation();
  const { islandState, activity, queuedCount } = useIsland();

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

      {showBottomNav && (
        <DynamicIsland
          forceState={islandState}
          activity={activity}
          queuedCount={queuedCount}
        />
      )}
    </div>
  );
}
