import { NavLink } from 'react-router-dom';
import {
  Home,
  Map,
  Trophy,
  Bell,
  User,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/report', label: 'Report', icon: Plus, isFab: true },
  { to: '/leaderboard', label: 'Rank', icon: Trophy },
  { to: '/profile', label: 'Profile', icon: User },
] as const;

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/80 glass pb-safe"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-end justify-around px-2 pt-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, isFab }) =>
          isFab ? (
            <NavLink
              key={to}
              to={to}
              className="relative -mt-6 flex flex-col items-center gap-1"
              aria-label="Report an issue"
            >
              <span className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95">
                <Icon className="size-6" aria-hidden="true" />
              </span>
            </NavLink>
          ) : (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex min-w-[56px] flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn('size-5', isActive && 'fill-primary/15')}
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ),
        )}
      </div>
    </nav>
  );
}

export function NotificationBellLink() {
  return (
    <NavLink
      to="/notifications"
      className={({ isActive }) =>
        cn(
          'relative grid size-10 place-items-center rounded-full transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )
      }
      aria-label="Notifications"
    >
      <Bell className="size-5" aria-hidden="true" />
      <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
    </NavLink>
  );
}
