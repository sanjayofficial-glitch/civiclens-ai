import type { ReactNode } from 'react';
import { ThemeProvider } from './theme-provider';
import { QueryProvider } from './query-provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/useAuth';

/**
 * Composes the global providers in the correct order:
 * Theme (outermost, drives .dark class) -> Query -> Toaster -> app.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
