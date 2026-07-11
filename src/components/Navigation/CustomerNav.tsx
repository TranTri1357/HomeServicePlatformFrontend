import { Home, Search, Calendar, User, LogIn } from "lucide-react";
import type { Screen } from "@/shared/types";

interface CustomerNavProps {
  current: Screen;
  onNavigate: (s: Screen) => void;
  /** Count shown as a red badge on "Lịch đặt". */
  jobBadge?: number;
  /** Khách vãng lai (chưa đăng nhập): hiện nav rút gọn + nút Đăng nhập. */
  guest?: boolean;
}

const ITEMS = [
  { screen: "customerHome" as Screen, icon: Home, label: "Trang chủ" },
  { screen: "serviceList" as Screen, icon: Search, label: "Dịch vụ" },
  { screen: "bookingManagement" as Screen, icon: Calendar, label: "Lịch đặt" },
  { screen: "customerProfile" as Screen, icon: User, label: "Hồ sơ" },
];

const GUEST_ITEMS = [
  { screen: "customerHome" as Screen, icon: Home, label: "Trang chủ" },
  { screen: "serviceList" as Screen, icon: Search, label: "Dịch vụ" },
  { screen: "auth" as Screen, icon: LogIn, label: "Đăng nhập" },
];

const HOME_ADJACENT: Screen[] = [
  "serviceDetail",
  "technicianMap",
  "technicianDetail",
  "emergencyBooking",
];

export function CustomerNav({ current, onNavigate, jobBadge = 0, guest = false }: CustomerNavProps) {
  const items = guest ? GUEST_ITEMS : ITEMS;
  return (
    <div className="bg-white border-t border-border flex items-center px-2 py-2 safe-area-bottom">
      {items.map((item) => {
        const active =
          current === item.screen ||
          (item.screen === "customerHome" && HOME_ADJACENT.includes(current));
        const badge = item.screen === "bookingManagement" ? jobBadge : 0;
        return (
          <button
            key={item.screen}
            onClick={() => onNavigate(item.screen)}
            className={`flex-1 flex flex-col items-center gap-1 py-1 rounded-xl transition-colors ${active ? "text-blue-600" : "text-muted-foreground"}`}
          >
            <span className="relative">
              <item.icon
                className={`w-5 h-5 ${active ? "text-blue-600" : "text-muted-foreground"}`}
              />
              {badge > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </span>
            <span
              className={`text-[10px] font-semibold ${active ? "text-blue-600" : "text-muted-foreground"}`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
