import { Home, Search, Calendar, User } from "lucide-react";
import type { Screen } from "@/shared/types";

interface CustomerNavProps {
  current: Screen;
  onNavigate: (s: Screen) => void;
}

const ITEMS = [
  { screen: "customerHome" as Screen, icon: Home, label: "Trang chủ" },
  { screen: "serviceList" as Screen, icon: Search, label: "Dịch vụ" },
  { screen: "bookingManagement" as Screen, icon: Calendar, label: "Lịch đặt" },
  { screen: "customerProfile" as Screen, icon: User, label: "Hồ sơ" },
];

const HOME_ADJACENT: Screen[] = ["serviceDetail", "technicianMap", "technicianDetail"];

export function CustomerNav({ current, onNavigate }: CustomerNavProps) {
  return (
    <div className="bg-white border-t border-border flex items-center px-2 py-2 safe-area-bottom">
      {ITEMS.map((item) => {
        const active =
          current === item.screen ||
          (item.screen === "customerHome" && HOME_ADJACENT.includes(current));
        return (
          <button
            key={item.screen}
            onClick={() => onNavigate(item.screen)}
            className={`flex-1 flex flex-col items-center gap-1 py-1 rounded-xl transition-colors ${active ? "text-blue-600" : "text-muted-foreground"}`}
          >
            <item.icon
              className={`w-5 h-5 ${active ? "text-blue-600" : "text-muted-foreground"}`}
            />
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
