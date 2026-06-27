import { useLocation } from 'react-router-dom';
import type { UserRole } from '@blockseblock/shared';
import { ProtectedRouteAuth } from './ProtectedRouteAuth';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const allowGuestEntry = location.pathname === '/home';

  return (
    <ProtectedRouteAuth
      allowedRoles={allowedRoles}
      allowGuestEntry={allowGuestEntry}
    />
  );
}
