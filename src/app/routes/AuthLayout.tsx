import { useLocation, useNavigate } from "react-router-dom";
import { AuthScreen } from "@/pages/Auth";
import type { LoginResult } from "@/services/api/auth.api";
import { useAuth } from "@/app/providers";
import { getHomePathByRole } from "@/shared/auth/roles";

interface LocationState {
  from?: { pathname?: string };
}

export function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { setSession } = useAuth();

  const handleLogin = ({ user, mode }: LoginResult) => {
    setSession({
      userId: user.userId,
      fullName: user.fullName,
      roles: user.roles,
      mode,
    });
    // Return the user to the page they were bounced from, if any.
    // ProtectedRoute still guards it, so a role-mismatch falls back to home.
    const from = (location.state as LocationState | null)?.from?.pathname;
    navigate(from || getHomePathByRole(mode), { replace: true });
  };

  return (
    <div className="w-full h-full" style={{ fontFamily: "'Inter', sans-serif" }}>
      <AuthScreen onLogin={handleLogin} />
    </div>
  );
}
