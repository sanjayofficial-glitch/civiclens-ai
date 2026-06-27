import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  MapPin,
  PlusCircle,
  Trophy,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { to: '/home', label: 'Home', icon: <Home className="size-5" /> },
  { to: '/map', label: 'Map', icon: <MapPin className="size-5" /> },
  { to: '/report', label: 'Report', icon: <PlusCircle className="size-5" /> },
  { to: '/leaderboard', label: 'Board', icon: <Trophy className="size-5" /> },
  { to: '/profile', label: 'Profile', icon: <User className="size-5" /> },
];

export interface BottomNavProps {
  /** Override the default nav items. */
  items?: NavItem[];
  className?: string;
}

/**
 * Fixed bottom navigation for mobile. Each item is a React Router NavLink
 * that highlights the active route. Includes safe-area inset padding for
 * notched devices.
 *
 * Hidden on desktop (lg and up) — the sidebar takes over there.
 */
export function BottomNav({ items = DEFAULT_NAV_ITEMS, className }: BottomNavProps) {
  const location = useLocation();

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t bg-background/80 backdrop-blur-md lg:hidden',
        className,
      )}
      aria-label="Main navigation"
    >
      <ul className="flex h-16 items-center justify-around px-2 pb-safe">
        {items.map((item) => {
          const isActive =
            item.to === '/home'
              ? location.pathname === '/home' || location.pathname === '/'
              : location.pathname.startsWith(item.to);

          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'transition-transform',
                    isActive && 'scale-110',
                  )}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
