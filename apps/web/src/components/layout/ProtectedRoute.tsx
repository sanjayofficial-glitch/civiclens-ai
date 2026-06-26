import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '@blockseblock/shared';
import { ProtectedRouteAuth } from './ProtectedRouteAuth';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

/** UI-only dev mode bypasses Firebase auth so screens can be previewed without backend. */
const UI_DEV_MODE = import.meta.env.VITE_UI_DEV_MODE !== 'false';

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  if (UI_DEV_MODE) {
    return <Outlet />;
  }

  return <ProtectedRouteAuth allowedRoles={allowedRoles} />;
}
