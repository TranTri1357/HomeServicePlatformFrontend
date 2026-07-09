import { useState } from "react";
import { Calendar, MapPin, MessageCircle, Map, Star } from "lucide-react";
import type { Screen } from "@/shared/types";
import type { BookingStatus } from "@/shared/types";
import { bookings } from "@/services/Booking/booking.data";
import { Badge, TopBar } from "@/shared/ui";

export function BookingManagement({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [activeTab, setActiveTab] = useState("all");
  const tabs = ["all", "pending", "in_progress", "completed", "cancelled"] as const;
  const tabLabels = {
    all: "Tất cả",
    pending: "Chờ",
    in_progress: "Đang làm",
    completed: "Xong",
    cancelled: "Hủy",
  };

  const filtered = activeTab === "all" ? bookings : bookings.filter((b) => b.status === activeTab);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Lịch đặt của tôi" onBack={() => onNavigate("customerHome")} />

      {/* Tabs */}
      <div className="bg-white border-b border-border px-4 py-2 flex gap-1 overflow-x-auto scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${activeTab === t ? "bg-blue-600 text-white" : "text-muted-foreground hover:bg-muted"}`}
          >
            {tabLabels[t]}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.map((bk) => (
          <div key={bk.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-foreground">{bk.service}</p>
                  {bk.status === "in_progress" && (
                    <span className="flex items-center gap-1 text-xs text-purple-600 font-medium">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {bk.id} · Thợ: {bk.tech}
                </p>
              </div>
              <Badge status={bk.status as BookingStatus} />
            </div>

            <div className="space-y-1.5 mb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  {bk.date}, {bk.time}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{bk.address}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold text-blue-600">{bk.price}đ</span>
              <div className="flex gap-2">
                <button
                  onClick={() => onNavigate("chat")}
                  className="px-3 py-1.5 bg-muted rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-accent transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Chat
                </button>
                {bk.status === "in_progress" && (
                  <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1">
                    <Map className="w-3.5 h-3.5" />
                    Theo dõi
                  </button>
                )}
                {bk.status === "completed" && (
                  <button className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" />
                    Đánh giá
                  </button>
                )}
                {bk.status === "pending" && (
                  <button className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold">
                    Hủy
                  </button>
                )}
              </div>
            </div>

            {/* Progress for in_progress */}
            {bk.status === "in_progress" && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Tiến độ công việc</span>
                  <span className="text-blue-600 font-semibold">60%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: "60%" }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
