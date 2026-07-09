import { Bell, Wrench, User, ChevronDown, LogOut } from "lucide-react";
import type { Screen, NavItem } from "@/shared/types";
import type { UserMode } from "@/shared/types";
import { technicians } from "@/services/Technician/technician.data";

interface DesktopTopNavProps {
  screen: Screen;
  mode: UserMode;
  isCustomer: boolean;
  isProviderScreen: boolean;
  currentNavItems: NavItem[];
  onNavigate: (s: Screen) => void;
  onSwitchMode: () => void;
  onLogout: () => void;
}

export function DesktopTopNav({
  screen,
  mode,
  isCustomer,
  isProviderScreen,
  currentNavItems,
  onNavigate,
  onSwitchMode,
  onLogout,
}: DesktopTopNavProps) {
  return (
    <nav
      className={`hidden lg:flex items-center h-16 px-6 sticky top-0 z-50 border-b ${
        isProviderScreen
          ? "bg-slate-900 border-slate-700"
          : "bg-white border-border shadow-sm"
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
        <span className={`font-extrabold text-xl tracking-tight ${isProviderScreen ? "text-white" : "text-foreground"}`}>
          Fix<span className="text-blue-500">Now</span>
        </span>
      </button>

      {/* Mode badge */}
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
                <span className="w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                  {item.badge}
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
        {/* Mode switcher */}
        <button
          onClick={onSwitchMode}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors border ${
            isProviderScreen
              ? "border-slate-600 text-slate-300 hover:bg-slate-800"
              : "border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          {isCustomer ? (
            <><Wrench className="w-3.5 h-3.5" />Chế độ thợ</>
          ) : (
            <><User className="w-3.5 h-3.5" />Chế độ KH</>
          )}
        </button>

        {/* Bell */}
        <button
          onClick={() => onNavigate(isCustomer ? "notifications" : "providerJobManagement")}
          className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            isProviderScreen ? "hover:bg-slate-800" : "hover:bg-muted"
          }`}
        >
          <Bell className={`w-4 h-4 ${isProviderScreen ? "text-slate-300" : "text-muted-foreground"}`} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Avatar */}
        <button
          onClick={() => onNavigate(isCustomer ? "customerProfile" : "providerProfile")}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-muted transition-colors"
        >
          <img
            src={`https://images.unsplash.com/${isCustomer ? "photo-1472099645785-5658abf4ff4e" : technicians[0].avatar}?w=64&h=64&fit=crop&auto=format`}
            alt="avatar"
            className="w-7 h-7 rounded-full object-cover"
          />
          <span className={`text-sm font-semibold ${isProviderScreen ? "text-slate-200" : "text-foreground"}`}>
            {isCustomer ? "Minh Khoa" : "Văn An"}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 ${isProviderScreen ? "text-slate-400" : "text-muted-foreground"}`} />
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
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
