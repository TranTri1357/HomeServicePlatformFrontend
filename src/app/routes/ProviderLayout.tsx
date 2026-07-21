import { Outlet, useLocation, useNavigate } from "react-router-dom";
import type { Screen } from "@/shared/types";
import { PROVIDER_NAV_ITEMS } from "@/app/config";
import { DesktopTopNav } from "@/layouts";
import { ProviderNav } from "@/components/Navigation";
import { EmergencyListener } from "@/components/Emergency/EmergencyListener";
import { useNavBadges } from "@/shared/hooks";
import { getPathForScreen, getScreenForPath } from "./screenPaths";

export function ProviderLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const screen = getScreenForPath(pathname);

  const onNavigate = (nextScreen: Screen, data?: object) => {
    navigate(getPathForScreen(nextScreen), { state: data });
  };

  
  const { notifDot, jobBadge } = useNavBadges("provider");
  const navItems = PROVIDER_NAV_ITEMS.map((i) =>
    i.screen === "providerJobManagement" && jobBadge > 0 ? { ...i, badge: jobBadge } : i,
  );

  
  
  return (
    <div
      className="w-full h-full flex flex-col bg-background"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {}
      <EmergencyListener onNavigate={onNavigate} />

      {}
      <div className="hidden lg:block flex-shrink-0">
        <DesktopTopNav
          screen={screen}
          currentNavItems={navItems}
          onNavigate={onNavigate}
          notifDot={notifDot}
        />
      </div>

      {}
      <div className="lg:hidden flex-shrink-0 safe-area-top bg-slate-900" />

      {}
      <div className="flex-1 overflow-hidden lg:bg-slate-100">
        <div className="h-full flex flex-col lg:max-w-5xl lg:mx-auto">
          <Outlet />
        </div>
      </div>

      {}
      {screen !== "auth" && (
        <div className="lg:hidden flex-shrink-0">
          <ProviderNav current={screen} onNavigate={onNavigate} jobBadge={jobBadge} />
        </div>
      )}
    </div>
  );
}
