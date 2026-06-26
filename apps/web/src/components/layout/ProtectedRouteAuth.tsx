import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '@blockseblock/shared';
import { PageLoader } from './PageLoader';

interface ProtectedRouteAuthProps {
  allowedRoles?: UserRole[];
}

export function ProtectedRouteAuth({ allowedRoles }: ProtectedRouteAuthProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
