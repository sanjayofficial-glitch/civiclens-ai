import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '@blockseblock/shared/types';
import { PageLoader } from './PageLoader';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

/** UI-only dev mode bypasses Firebase auth so screens can be previewed without backend. */
const UI_DEV_MODE = import.meta.env.VITE_UI_DEV_MODE !== 'false';

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();

  if (UI_DEV_MODE) {
    if (allowedRoles && role && !allowedRoles.includes(role)) {
      return <Navigate to="/unauthorized" replace />;
    }
    return <Outlet />;
  }

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
};
