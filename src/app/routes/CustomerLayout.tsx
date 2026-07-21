import { Navigate, Outlet, useLocation } from "react-router-dom";
import { NO_BOTTOM_NAV_SCREENS } from "@/shared/constants";
import { CUSTOMER_NAV_ITEMS, GUEST_NAV_ITEMS } from "@/app/config";
import { DesktopTopNav } from "@/layouts";
import { CustomerNav } from "@/components/Navigation";
import { useNavBadges } from "@/shared/hooks";
import { useAuth } from "@/app/providers";
import { getScreenForPath } from "./screenPaths";
import { useGatedNavigate } from "./useGatedNavigate";

export function CustomerLayout() {
  const { pathname } = useLocation();
  const screen = getScreenForPath(pathname);

  const { isAuthenticated, hasRole, getHomePath } = useAuth();
  const onNavigate = useGatedNavigate();
  const isCustomer = hasRole("customer");

  
  
  const { notifDot, jobBadge } = useNavBadges("customer", isCustomer);

  
  
  
  if (isAuthenticated && !isCustomer) {
    return <Navigate to={getHomePath()} replace />;
  }
  const navItems = (isAuthenticated ? CUSTOMER_NAV_ITEMS : GUEST_NAV_ITEMS).map((i) =>
    i.screen === "bookingManagement" && jobBadge > 0 ? { ...i, badge: jobBadge } : i,
  );

  const hideBottomNav = (NO_BOTTOM_NAV_SCREENS as readonly string[]).includes(screen);

  
  
  
  
  
  return (
    <div
      className="w-full h-full flex flex-col bg-background"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
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
      <div className="lg:hidden flex-shrink-0 safe-area-top bg-white" />

      {}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col lg:max-w-5xl lg:mx-auto">
          <Outlet />
        </div>
      </div>

      {}
      {!hideBottomNav && (
        <div className="lg:hidden flex-shrink-0">
          <CustomerNav
            current={screen}
            onNavigate={onNavigate}
            jobBadge={jobBadge}
            guest={!isAuthenticated}
          />
        </div>
      )}
    </div>
  );
}
