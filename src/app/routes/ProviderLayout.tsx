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

  // Live nav badges: unread-notification dot + count of ongoing jobs.
  const { notifDot, jobBadge } = useNavBadges("provider");
  const navItems = PROVIDER_NAV_ITEMS.map((i) =>
    i.screen === "providerJobManagement" && jobBadge > 0 ? { ...i, badge: jobBadge } : i,
  );

  // ⚠️ MỘT <Outlet/> DUY NHẤT — xem giải thích trong CustomerLayout: hai Outlet ẩn/hiện
  // bằng CSS khiến mọi màn con mount hai lần (2 kết nối SignalR → toast nhân đôi, API gọi 2 lần).
  return (
    <div
      className="w-full h-full flex flex-col bg-background"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Global emergency request modal (SignalR-driven) */}
      <EmergencyListener onNavigate={onNavigate} />

      {/* Thanh điều hướng trên cùng — chỉ desktop */}
      <div className="hidden lg:block flex-shrink-0">
        <DesktopTopNav
          screen={screen}
          currentNavItems={navItems}
          onNavigate={onNavigate}
          notifDot={notifDot}
        />
      </div>

      {/* Chừa chỗ cho status bar THẬT của máy khi chạy standalone. Cao 0px ở
          trình duyệt thường nên không tạo khoảng trắng thừa. */}
      <div className="lg:hidden flex-shrink-0 safe-area-top bg-slate-900" />

      {/* Nội dung dùng chung */}
      <div className="flex-1 overflow-hidden lg:bg-slate-100">
        <div className="h-full flex flex-col lg:max-w-5xl lg:mx-auto">
          <Outlet />
        </div>
      </div>

      {/* Thanh điều hướng dưới — chỉ mobile */}
      {screen !== "auth" && (
        <div className="lg:hidden flex-shrink-0">
          <ProviderNav current={screen} onNavigate={onNavigate} jobBadge={jobBadge} />
        </div>
      )}
    </div>
  );
}
