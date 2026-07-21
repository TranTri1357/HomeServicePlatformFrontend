import { BarChart2, Briefcase, Package, Calendar, Wallet } from "lucide-react";
import type { Screen } from "@/shared/types";

interface ProviderNavProps {
  current: Screen;
  onNavigate: (s: Screen) => void;
  
  jobBadge?: number;
}

const ITEMS = [
  { screen: "providerDashboard" as Screen, icon: BarChart2, label: "Dashboard" },
  { screen: "providerJobManagement" as Screen, icon: Briefcase, label: "Công việc" },
  { screen: "providerServiceManagement" as Screen, icon: Package, label: "Dịch vụ" },
  { screen: "providerSchedule" as Screen, icon: Calendar, label: "Lịch" },
  { screen: "providerIncome" as Screen, icon: Wallet, label: "Ví" },
];

export function ProviderNav({ current, onNavigate, jobBadge = 0 }: ProviderNavProps) {
  return (
    <div className="bg-slate-900 border-t border-slate-700 flex items-center px-2 py-2">
      {ITEMS.map((item) => {
        const active = current === item.screen;
        const badge = item.screen === "providerJobManagement" ? jobBadge : 0;
        return (
          <button
            key={item.screen}
            onClick={() => onNavigate(item.screen)}
            className="flex-1 flex flex-col items-center gap-1 py-1 rounded-xl transition-colors"
          >
            <span className="relative">
              <item.icon className={`w-5 h-5 ${active ? "text-blue-400" : "text-slate-500"}`} />
              {badge > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </span>
            <span
              className={`text-[10px] font-semibold ${active ? "text-blue-400" : "text-slate-500"}`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
