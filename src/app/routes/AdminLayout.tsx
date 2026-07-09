import { Outlet, useLocation, useNavigate } from "react-router-dom";
import type { Screen } from "@/shared/types";
import { useAuth } from "@/app/providers";
import { AdminLayout as AdminShell } from "@/layouts";
import { getPathForScreen, getScreenForPath } from "./screenPaths";

export function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const screen = getScreenForPath(pathname);

  const onNavigate = (nextScreen: Screen, data?: object) => {
    navigate(getPathForScreen(nextScreen), { state: data });
  };

  return (
    <div className="w-full h-full" style={{ fontFamily: "'Inter', sans-serif" }}>
      <AdminShell currentScreen={screen} onNavigate={onNavigate} onLogout={logout}>
        <Outlet />
      </AdminShell>
    </div>
  );
}
