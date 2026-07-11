import { Bell, Wrench, User, ChevronDown, LogOut } from "lucide-react";
import type { Screen, NavItem } from "@/shared/types";
import { Avatar } from "@/shared/ui";
import { useAuth } from "@/app/providers"; // Import Auth Context

interface DesktopTopNavProps {
  screen: Screen;
  currentNavItems: NavItem[];
  onNavigate: (s: Screen) => void;
  /** Show a red dot on the notification bell. */
  notifDot?: boolean;
}

export function DesktopTopNav({
  screen,
  currentNavItems,
  onNavigate,
  notifDot = false,
}: DesktopTopNavProps) {
  const { user, logout, hasRole } = useAuth();

  // Tự động nhận diện Role để đổi giao diện
  const isProviderScreen = hasRole("provider");
  const isCustomer = hasRole("customer");

  return (
    <nav
      className={`hidden lg:flex items-center h-16 px-6 sticky top-0 z-50 border-b ${
        isProviderScreen ? "bg-slate-900 border-slate-700" : "bg-white border-border shadow-sm"
      }`}
    >
      {/* Logo */}
      <button
        onClick={() => onNavigate(isCustomer ? "customerHome" : "providerDashboard")}
        className="flex items-center gap-2.5 mr-8 flex-shrink-0"
      >
        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-600">
          <Wrench className="w-4 h-4 text-white" />
        </div>
        <span
          className={`font-extrabold text-xl tracking-tight ${isProviderScreen ? "text-white" : "text-foreground"}`}
        >
          Fix<span className="text-blue-500">Now</span>
        </span>
      </button>

      {/* Role badge */}
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mr-6 flex-shrink-0 ${
          isProviderScreen ? "bg-slate-800 text-slate-300" : "bg-accent text-blue-600"
        }`}
      >
        {isCustomer ? <User className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
        {isCustomer ? "Khách hàng" : "Thợ kỹ thuật"}
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-none">
        {currentNavItems.map((item) => {
          const active = screen === item.screen;
          return (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen)}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex-shrink-0 ${
                active
                  ? isProviderScreen
                    ? "bg-slate-700 text-white"
                    : "bg-accent text-blue-600"
                  : isProviderScreen
                    ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
              {item.badge ? (
                <span className="min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              ) : null}
              {active && !isProviderScreen && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
        {/* Bell */}
        <button
          onClick={() => onNavigate(isCustomer ? "notifications" : "providerNotifications")}
          className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            isProviderScreen ? "hover:bg-slate-800" : "hover:bg-muted"
          }`}
        >
          <Bell
            className={`w-4 h-4 ${isProviderScreen ? "text-slate-300" : "text-muted-foreground"}`}
          />
          {notifDot && (
            <span
              className={`absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ${isProviderScreen ? "ring-slate-900" : "ring-white"}`}
            />
          )}
        </button>

        {/* Avatar */}
        <button
          onClick={() => onNavigate(isCustomer ? "customerProfile" : "providerProfile")}
          className={`flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border transition-colors ${
            isProviderScreen
              ? "border-slate-700 bg-slate-800 hover:bg-slate-700"
              : "border-border bg-white hover:bg-muted"
          }`}
        >
          <span
            className={`rounded-full p-0.5 ${isProviderScreen ? "bg-slate-600" : "bg-blue-100"}`}
          >
            <Avatar size={28} name={user?.fullName || (isCustomer ? "Khách hàng" : "Đối tác")} />
          </span>
          <span
            className={`text-sm font-semibold ${isProviderScreen ? "text-slate-200" : "text-foreground"}`}
          >
            {user?.fullName || (isCustomer ? "Khách hàng" : "Đối tác")}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 ${isProviderScreen ? "text-slate-400" : "text-muted-foreground"}`}
          />
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors text-red-400 hover:bg-red-50 ${
            isProviderScreen ? "hover:bg-red-900/30" : ""
          }`}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
