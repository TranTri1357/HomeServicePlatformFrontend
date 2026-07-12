import { useLocation, useNavigate } from "react-router-dom";
import { AuthScreen } from "@/pages/Auth";
import type { LoginResult } from "@/services/api/auth.api";
import { useAuth } from "@/app/providers";
import { getHomePathByRole } from "@/shared/auth/roles";

interface LocationState {
  from?: { pathname?: string; state?: unknown };
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
    // Return the user to the page they were bounced from, if any — kèm theo
    // state gốc (vd: { serviceId }) để màn đích có đủ tham số. Dùng chung cho cả
    // luồng popup (AuthGate) lẫn ProtectedRoute (from = location, có sẵn .state).
    // ProtectedRoute still guards it, so a role-mismatch falls back to home.
    const from = (location.state as LocationState | null)?.from;
    navigate(from?.pathname || getHomePathByRole(mode), {
      replace: true,
      state: from?.state,
    });
  };

  return (
    <div className="w-full h-full" style={{ fontFamily: "'Inter', sans-serif" }}>
      <AuthScreen onLogin={handleLogin} onBack={() => navigate("/customer/home")} />
    </div>
  );
}
