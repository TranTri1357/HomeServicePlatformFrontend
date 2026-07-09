import { useState } from "react";
import {
  Bell, Wrench, BarChart2, FileText, Package, Layers, Percent, Flag,
  Star, Users, Menu, Search, ChevronDown, ChevronRight, LogOut,
} from "lucide-react";
import type { Screen } from "@/shared/types";

const adminMenu = [
  {
    group: "Tổng quan",
    items: [
      { screen: "adminDashboard" as Screen, icon: BarChart2, label: "Dashboard" },
      { screen: "adminOrders" as Screen,    icon: FileText,  label: "Đơn hàng",     badge: 3 },
    ],
  },
  {
    group: "Quản lý",
    items: [
      { screen: "adminProviders" as Screen,    icon: Wrench,  label: "Quản lý thợ",  badge: 2 },
      { screen: "adminServices" as Screen,     icon: Package, label: "Dịch vụ"              },
      { screen: "adminServiceTypes" as Screen, icon: Layers,  label: "Loại dịch vụ"         },
      { screen: "adminAccounts" as Screen,     icon: Users,   label: "Tài khoản"             },
      { screen: "adminReviews" as Screen,      icon: Star,    label: "Đánh giá",      badge: 2 },
    ],
  },
  {
    group: "Cấu hình",
    items: [
      { screen: "adminCommissions" as Screen, icon: Percent, label: "Hoa hồng"              },
      { screen: "adminComplaints" as Screen,  icon: Flag,    label: "Khiếu nại",     badge: 2 },
    ],
  },
];

interface AdminLayoutProps {
  currentScreen: Screen;
  onNavigate: (s: Screen) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export function AdminLayout({ currentScreen, onNavigate, onLogout, children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminSearch, setAdminSearch] = useState("");

  const currentLabel =
    adminMenu.flatMap((g) => g.items).find((i) => i.screen === currentScreen)?.label ?? "Admin";

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`${mobile ? "w-64" : sidebarOpen ? "w-60" : "w-16"} flex flex-col h-full bg-white border-r border-border transition-all duration-200`}>
      <div className="h-16 flex items-center px-4 border-b border-border gap-3 flex-shrink-0">
        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Wrench className="w-4 h-4 text-white" />
        </div>
        {(sidebarOpen || mobile) && (
          <div>
            <span className="font-extrabold text-lg text-foreground">Fix<span className="text-blue-500">Now</span></span>
            <span className="ml-1.5 text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Admin</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-3 space-y-1 px-2">
        {adminMenu.map((group) => (
          <div key={group.group} className="mb-2">
            {(sidebarOpen || mobile) && (
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1">{group.group}</p>
            )}
            {group.items.map((item) => {
              const active = currentScreen === item.screen;
              return (
                <button
                  key={item.screen}
                  onClick={() => { onNavigate(item.screen); if (mobile) setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-xl text-sm font-semibold transition-colors mb-0.5 ${active ? "bg-blue-600 text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : ""}`} />
                  {(sidebarOpen || mobile) && <span className="flex-1 text-left">{item.label}</span>}
                  {(sidebarOpen || mobile) && "badge" in item && (item as { badge?: number }).badge ? (
                    <span className={`text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${active ? "bg-white text-blue-600" : "bg-red-500 text-white"}`}>
                      {(item as { badge?: number }).badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border flex-shrink-0">
        {sidebarOpen || mobile ? (
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">Super Admin</p>
              <p className="text-[10px] text-muted-foreground truncate">admin@fixnow.vn</p>
            </div>
            <button onClick={onLogout} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button onClick={onLogout} className="w-full flex items-center justify-center py-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-full bg-background">
      <div className="hidden lg:flex flex-shrink-0"><Sidebar /></div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 h-full shadow-2xl"><Sidebar mobile /></div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-border flex items-center px-4 gap-4 flex-shrink-0 sticky top-0 z-40">
          <button
            onClick={() => { if (window.innerWidth < 1024) setMobileOpen(true); else setSidebarOpen(!sidebarOpen); }}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
          >
            <Menu className="w-4 h-4 text-muted-foreground" />
          </button>

          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-semibold text-foreground">{currentLabel}</span>
          </div>

          <div className="flex-1" />

          <div className="hidden md:flex items-center gap-2 w-64 bg-muted rounded-xl px-3 py-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} className="flex-1 bg-transparent text-sm focus:outline-none" placeholder="Tìm kiếm..." />
          </div>

          <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-muted transition-colors cursor-pointer">
            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="hidden md:block text-sm font-semibold text-foreground">Super Admin</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">{children}</main>
      </div>
    </div>
  );
}
