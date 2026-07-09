import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Wifi } from "lucide-react";
import type { Screen } from "@/shared/types";
import { NO_BOTTOM_NAV_SCREENS } from "@/shared/constants";
import { CUSTOMER_NAV_ITEMS } from "@/app/config";
import { DesktopTopNav } from "@/layouts";
import { CustomerNav } from "@/components/Navigation";
import { getPathForScreen, getScreenForPath } from "./screenPaths";

export function CustomerLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const screen = getScreenForPath(pathname);

  const onNavigate = (nextScreen: Screen, data?: object) => {
    navigate(getPathForScreen(nextScreen), { state: data });
  };

  const hideBottomNav = (NO_BOTTOM_NAV_SCREENS as readonly string[]).includes(screen);

  return (
    <div className="w-full h-full flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Desktop */}
      <div className="hidden lg:flex flex-col h-full">
        <DesktopTopNav
          screen={screen}
          currentNavItems={CUSTOMER_NAV_ITEMS}
          onNavigate={onNavigate}
        />
        <div className="flex-1 overflow-hidden bg-background">
          <div className="h-full max-w-5xl mx-auto flex flex-col">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden w-full h-full flex flex-col bg-background">
        <div className="flex items-center justify-between px-4 py-2 flex-shrink-0 text-xs font-semibold z-20 bg-white text-foreground border-b border-border">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <Wifi className="w-3 h-3" />
            <span>5G</span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <Outlet />
        </div>

        {!hideBottomNav && <CustomerNav current={screen} onNavigate={onNavigate} />}
      </div>
    </div>
  );
}
