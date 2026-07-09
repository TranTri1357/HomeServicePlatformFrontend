import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAccessToken } from "@/services/api";
import { getHomePathByRole, hasAnyRole, type FrontendRole } from "@/shared/auth/roles";
import { useAuth } from "@/app/providers";

interface ProtectedRouteProps {
  allowedRoles: FrontendRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const { user, roles, mode, isAuthenticated } = useAuth();
  const token = getAccessToken();

  if (!token || !isAuthenticated || !user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (!hasAnyRole(roles, allowedRoles)) {
    const fallbackRole = mode ?? roles[0] ?? "customer";
    return <Navigate to={getHomePathByRole(fallbackRole)} replace />;
  }

  return <Outlet />;
}
