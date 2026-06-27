import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface FabProps {
  /** Content inside the FAB — typically an icon. */
  children: ReactNode;
  /** Optional click handler. */
  onClick?: () => void;
  /** Visually hide the button (animated). */
  hidden?: boolean;
  className?: string;
  'aria-label': string;
}

/**
 * Floating Action Button — positioned above the bottom nav, safe-area
 * aware. Used for the primary "Report Issue" action on mobile.
 * Desktop hides this in favour of in-nav / sidebar CTA.
 */
export function Fab({ children, onClick, hidden = false, className, ...props }: FabProps) {
  return (
    <AnimatePresence>
      {!hidden && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClick}
          className={cn(
            'fixed right-4 z-50 grid size-14 place-items-center rounded-full',
            'bg-primary text-primary-foreground shadow-xl',
            'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            'transition-shadow hover:shadow-2xl',
            'lg:hidden',
            // Position above the 64px bottom-nav + safe-area
            'bottom-[calc(4rem+env(safe-area-inset-bottom)+0.75rem)]',
            className,
          )}
          aria-label={props['aria-label']}
        >
          {children}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
