import { useState } from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import type { Screen } from "@/shared/types";
import type { BookingStatus } from "@/shared/types";
import { providerJobs } from "@/services/Provider/provider.data";
import { Badge, TopBar } from "@/shared/ui";

export function ProviderSchedule({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const [selected, setSelected] = useState(3);
  const slots = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  const booked = ["09:00", "10:00", "14:00"];

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Lịch làm việc" onBack={() => onNavigate("providerDashboard")} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Calendar header */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Tháng 6, 2026</h3>
            <div className="flex gap-1">
              <button className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`flex flex-col items-center py-2 rounded-xl transition-colors ${selected === i ? "bg-blue-600 text-white" : "hover:bg-muted"}`}
              >
                <span
                  className={`text-[11px] font-medium ${selected === i ? "text-blue-200" : "text-muted-foreground"}`}
                >
                  {d}
                </span>
                <span
                  className={`text-base font-bold ${selected === i ? "text-white" : "text-foreground"}`}
                >
                  {18 + i}
                </span>
                {[0, 2, 4].includes(i) && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-0.5 ${selected === i ? "bg-white" : "bg-blue-400"}`}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-3">Khung giờ ngày {18 + selected}/06</h3>
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot) => {
              const isBooked = booked.includes(slot);
              return (
                <div
                  key={slot}
                  className={`py-3 rounded-xl text-sm font-semibold text-center ${isBooked ? "bg-blue-600 text-white" : "bg-green-50 text-green-700 border border-green-200"}`}
                >
                  {slot}
                  {isBooked && <p className="text-[10px] text-blue-200 mt-0.5">Đã đặt</p>}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-600" />
              <span>Đã đặt</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-200" />
              <span>Còn trống</span>
            </div>
          </div>
        </div>

        {/* Upcoming */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-bold text-foreground">Lịch sắp tới</h3>
          </div>
          {providerJobs.map((job) => (
            <div
              key={job.id}
              className="px-4 py-3 flex items-center gap-3 border-b border-border last:border-0"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {job.service} · {job.customer}
                </p>
                <p className="text-xs text-muted-foreground">
                  {job.time} · {job.address}
                </p>
              </div>
              <Badge status={job.status as BookingStatus} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
