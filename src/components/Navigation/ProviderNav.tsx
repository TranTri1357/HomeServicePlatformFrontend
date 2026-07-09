import { BarChart2, Briefcase, Package, Route, MessageCircle } from "lucide-react";
import type { Screen } from "@/shared/types";

interface ProviderNavProps {
  current: Screen;
  onNavigate: (s: Screen) => void;
}

const ITEMS = [
  { screen: "providerDashboard"        as Screen, icon: BarChart2,    label: "Dashboard" },
  { screen: "providerJobManagement"    as Screen, icon: Briefcase,    label: "Công việc" },
  { screen: "providerServiceManagement"as Screen, icon: Package,      label: "Dịch vụ"   },
  { screen: "providerAreaRouting"      as Screen, icon: Route,        label: "Khu vực"   },
  { screen: "providerChat"             as Screen, icon: MessageCircle,label: "Chat"      },
];

export function ProviderNav({ current, onNavigate }: ProviderNavProps) {
  return (
    <div className="bg-slate-900 border-t border-slate-700 flex items-center px-2 py-2">
      {ITEMS.map((item) => {
        const active = current === item.screen;
        return (
          <button
            key={item.screen}
            onClick={() => onNavigate(item.screen)}
            className="flex-1 flex flex-col items-center gap-1 py-1 rounded-xl transition-colors"
          >
            <item.icon className={`w-5 h-5 ${active ? "text-blue-400" : "text-slate-500"}`} />
            <span className={`text-[10px] font-semibold ${active ? "text-blue-400" : "text-slate-500"}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
