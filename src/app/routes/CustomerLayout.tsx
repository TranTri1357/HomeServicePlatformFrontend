import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Wifi } from "lucide-react";
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

  // Live nav badges chỉ nạp cho khách hàng thật (guest/thợ -> không gọi API khách).
  // Gọi hook trước mọi early-return để tuân thủ rules-of-hooks.
  const { notifDot, jobBadge } = useNavBadges("customer", isCustomer);

  // Người đã đăng nhập nhưng KHÔNG phải khách (thợ/admin) không được lạc vào khu
  // khách hàng — đưa về đúng khu theo vai trò. Khách vãng lai (chưa đăng nhập)
  // vẫn được xem bình thường.
  if (isAuthenticated && !isCustomer) {
    return <Navigate to={getHomePath()} replace />;
  }
  const navItems = (isAuthenticated ? CUSTOMER_NAV_ITEMS : GUEST_NAV_ITEMS).map((i) =>
    i.screen === "bookingManagement" && jobBadge > 0 ? { ...i, badge: jobBadge } : i,
  );

  const hideBottomNav = (NO_BOTTOM_NAV_SCREENS as readonly string[]).includes(screen);

  // ⚠️ MỘT <Outlet/> DUY NHẤT: trước đây layout render hai Outlet (một cho desktop,
  // một cho mobile) và chỉ ẩn/hiện bằng CSS. Nhưng `display:none` KHÔNG unmount React —
  // mọi màn con mount HAI lần, mở hai kết nối SignalR (mỗi push realtime hiện 2 toast
  // giống nhau) và gọi mọi API hai lần. Giờ chỉ đổi phần KHUNG nav theo breakpoint,
  // nội dung dùng chung một nhánh cây.
  return (
    <div
      className="w-full h-full flex flex-col bg-background"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Thanh điều hướng trên cùng — chỉ desktop */}
      <div className="hidden lg:block flex-shrink-0">
        <DesktopTopNav
          screen={screen}
          currentNavItems={navItems}
          onNavigate={onNavigate}
          notifDot={notifDot}
        />
      </div>

      {/* Thanh trạng thái giả lập — chỉ mobile */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 flex-shrink-0 text-xs font-semibold z-20 bg-white text-foreground border-b border-border">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <Wifi className="w-3 h-3" />
          <span>5G</span>
        </div>
      </div>

      {/* Nội dung dùng chung */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col lg:max-w-5xl lg:mx-auto">
          <Outlet />
        </div>
      </div>

      {/* Thanh điều hướng dưới — chỉ mobile */}
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
