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
