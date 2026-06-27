import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '@blockseblock/shared';
import { PageLoader } from './PageLoader';
import { AuthService } from '@/services/auth.service';

interface ProtectedRouteAuthProps {
  allowedRoles?: UserRole[];
  allowGuestEntry?: boolean;
}

export function ProtectedRouteAuth({
  allowedRoles,
  allowGuestEntry = false,
}: ProtectedRouteAuthProps) {
  const { user, role, loading } = useAuth();
  const [guestLoginStarted, setGuestLoginStarted] = useState(false);

  useEffect(() => {
    if (!loading && !user && allowGuestEntry && !guestLoginStarted) {
      setGuestLoginStarted(true);
      void AuthService.signInAsGuest().catch(() => {
        setGuestLoginStarted(false);
      });
    }
  }, [allowGuestEntry, guestLoginStarted, loading, user]);

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return allowGuestEntry ? <PageLoader /> : <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
