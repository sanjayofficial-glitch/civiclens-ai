import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Menu, Moon, Sun, Bell } from 'lucide-react';
import { IconButton } from '@/components/ui/icon-button';
import { useTheme } from 'next-themes';

export interface TopBarProps {
  /** Title rendered in the centre or left of the bar. */
  title?: string;
  /** Content rendered on the left (before the title). Often a hamburger or back button. */
  leftAction?: ReactNode;
  /** Content rendered on the right (typically icons — notifications, theme toggle, avatar). */
  rightAction?: ReactNode;
  /** Show the default theme-toggle and notification bell on the right. */
  showDefaults?: boolean;
  className?: string;
}

/**
 * Sticky top navigation bar. Mobile-first: compact 56px height, safe-area
 * aware. Desktop shows at full width inside the AppShell.
 */
export function TopBar({
  title,
  leftAction,
  rightAction,
  showDefaults = true,
  className,
}: TopBarProps) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md pt-safe',
        className,
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-1">
        {leftAction ?? (
          <IconButton aria-label="Menu" variant="ghost" size="icon-sm" icon={<Menu className="size-5" />} />
        )}
      </div>

      {/* Centre — title */}
      {title ? (
        <h1 className="flex-1 truncate text-center text-base font-semibold">
          {title}
        </h1>
      ) : (
        <div className="flex-1" />
      )}

      {/* Right */}
      <div className="flex items-center gap-1">
        {rightAction}
        {showDefaults ? (
          <>
            <IconButton
              aria-label="Notifications"
              variant="ghost"
              size="icon-sm"
              icon={<Bell className="size-5" />}
            />
            <IconButton
              aria-label="Toggle theme"
              variant="ghost"
              size="icon-sm"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              icon={
                resolvedTheme === 'dark' ? (
                  <Sun className="size-5" />
                ) : (
                  <Moon className="size-5" />
                )
              }
            />
          </>
        ) : null}
      </div>
    </header>
  );
}
