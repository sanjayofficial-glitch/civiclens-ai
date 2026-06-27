import { NavLink } from 'react-router-dom';
import { Home, Map as MapIcon, Plus, BarChart3, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const navItems = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/map', label: 'Map', icon: MapIcon },
    { to: '/report', label: 'Report', icon: Plus, isFab: true },
    { to: '/impact', label: 'Impact', icon: BarChart3 },
    { to: '/profile', label: 'Profile', icon: User },
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/50 bg-background/80 px-4 pb-safe pt-2 backdrop-blur-md sm:hidden">
      <ul className="mx-auto flex max-w-md items-end justify-between">
        {navItems.map((item) => {
          const isFab = 'isFab' in item && item.isFab;
          return (
            <li key={item.to} className={isFab ? '-mt-6' : ''}>
              {isFab ? (
                <NavLink
                  to={item.to}
                  className="flex flex-col items-center gap-1"
                  aria-label="Report an issue"
                >
                  <span className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95">
                    <item.icon className="size-6" aria-hidden="true" />
                  </span>
                </NavLink>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
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
                      <item.icon
                        className={cn(
                          'size-5 transition-transform',
                          isActive && 'scale-110',
                        )}
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              )}
            </li>
          );
        })}
      </ul>
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
