import { useState } from "react";
import { Calendar, CreditCard, TrendingUp, Bell } from "lucide-react";
import type { Screen } from "@/shared/types";
import { notifications } from "@/services/Notification/notification.data";
import { TopBar } from "@/shared/ui";

export function Notifications({
  onNavigate,
}: {
  onNavigate: (s: Screen) => void;
}) {
  const [items, setItems] = useState(notifications);

  const typeConfig = {
    booking: {
      color: "bg-blue-100",
      iconColor: "text-blue-600",
      icon: Calendar,
    },
    payment: {
      color: "bg-green-100",
      iconColor: "text-green-600",
      icon: CreditCard,
    },
    promo: {
      color: "bg-amber-100",
      iconColor: "text-amber-600",
      icon: TrendingUp,
    },
    system: {
      color: "bg-gray-100",
      iconColor: "text-gray-600",
      icon: Bell,
    },
  };

  const markAllRead = () =>
    setItems(items.map((i) => ({ ...i, read: true })));

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Thông báo"
        onBack={() => onNavigate("customerHome")}
        actions={
          <button
            onClick={markAllRead}
            className="text-blue-600 text-xs font-semibold"
          >
            Đọc tất cả
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto">
        {items.map((notif) => {
          const cfg =
            typeConfig[notif.type as keyof typeof typeConfig];
          return (
            <button
              key={notif.id}
              onClick={() =>
                setItems(
                  items.map((i) =>
                    i.id === notif.id
                      ? { ...i, read: true }
                      : i,
                  ),
                )
              }
              className={`w-full flex items-start gap-3 px-4 py-4 border-b border-border hover:bg-muted transition-colors ${!notif.read ? "bg-blue-50/40" : "bg-white"}`}
            >
              <div
                className={`w-10 h-10 ${cfg.color} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}
              >
                <cfg.icon
                  className={`w-5 h-5 ${cfg.iconColor}`}
                />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={`text-sm font-semibold text-foreground ${!notif.read ? "font-bold" : ""}`}
                  >
                    {notif.title}
                  </p>
                  {!notif.read && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {notif.body}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">
                  {notif.time}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

