import { useNavigate } from "react-router-dom";
import { AuthScreen } from "@/pages/Auth";
import type { UserMode } from "@/shared/types";
import { getPathForScreen } from "./screenPaths";

export function AuthLayout() {
  const navigate = useNavigate();

  const handleLogin = (mode: UserMode) => {
    if (mode === "customer") navigate(getPathForScreen("customerHome"), { replace: true });
    else if (mode === "provider") navigate(getPathForScreen("providerDashboard"), { replace: true });
    else if (mode === "admin") navigate(getPathForScreen("adminDashboard"), { replace: true });
  };

  return (
    <div className="w-full h-full" style={{ fontFamily: "'Inter', sans-serif" }}>
      <AuthScreen onLogin={handleLogin} />
    </div>
  );
}
