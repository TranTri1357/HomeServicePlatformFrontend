import { useState } from "react";
import { Bell, DollarSign, Briefcase, Star, TrendingUp, Timer, Calendar } from "lucide-react";
import type { Screen } from "@/shared/types";
import { providerJobs } from "@/services/Provider/provider.data";
import { technicians } from "@/services/Technician/technician.data";
import { Avatar } from "@/shared/ui";

export function ProviderDashboard({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [online, setOnline] = useState(true);

  return (
    <div className="overflow-y-auto h-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-4 pt-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-slate-400 text-sm">Thứ Sáu, 20/06/2026</p>
            <h2 className="text-white text-xl font-bold">Nguyễn Văn An</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigate("providerJobManagement")}
              className="relative w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"
            >
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                3
              </span>
            </button>
            <button
              onClick={() => onNavigate("providerProfile")}
              className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/30"
            >
              <Avatar src={technicians[0].avatar} size={40} name={technicians[0].name} />
            </button>
          </div>
        </div>

        {/* Online Toggle */}
        <div className="bg-white/10 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">Trạng thái nhận việc</p>
            <p
              className={`text-xs mt-0.5 font-medium ${online ? "text-green-400" : "text-slate-400"}`}
            >
              {online ? "🟢 Đang nhận việc" : "⭕ Không nhận việc"}
            </p>
          </div>
          <button
            onClick={() => setOnline(!online)}
            className={`relative w-14 h-7 rounded-full transition-colors ${online ? "bg-green-500" : "bg-slate-600"}`}
          >
            <div
              className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${online ? "translate-x-7" : "translate-x-0.5"}`}
            />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Thu nhập hôm nay",
              value: "850,000đ",
              icon: DollarSign,
              color: "text-green-600",
              bg: "bg-green-100",
            },
            {
              label: "Công việc hôm nay",
              value: "3",
              icon: Briefcase,
              color: "text-blue-600",
              bg: "bg-blue-100",
            },
            {
              label: "Đánh giá TB",
              value: "4.9 ★",
              icon: Star,
              color: "text-amber-600",
              bg: "bg-amber-100",
            },
            {
              label: "Tháng này",
              value: "18.5M đ",
              icon: TrendingUp,
              color: "text-purple-600",
              bg: "bg-purple-100",
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm">
              <div
                className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-2`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-xl font-extrabold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Today's Jobs */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-foreground">Công việc hôm nay</h3>
            <button
              onClick={() => onNavigate("providerJobManagement")}
              className="text-blue-600 text-xs font-semibold"
            >
              Xem tất cả
            </button>
          </div>
          <div className="divide-y divide-border">
            {providerJobs.map((job) => (
              <div key={job.id} className="px-4 py-3 flex items-start gap-3">
                <div className="w-2 mt-2 flex-shrink-0">
                  <div
                    className={`w-2 h-2 rounded-full ${job.status === "in_progress" ? "bg-purple-500 animate-pulse" : "bg-blue-500"}`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm text-foreground">{job.service}</p>
                    <span className="text-sm font-bold text-green-600">{job.price}đ</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {job.customer} · {job.time}
                  </p>
                  <p className="text-xs text-muted-foreground">{job.address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart placeholder */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Doanh thu 7 ngày</h3>
            <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full">
              +12% so với tuần trước
            </span>
          </div>
          <div className="flex items-end gap-2 h-24">
            {[65, 80, 45, 90, 70, 85, 100].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-lg transition-all ${i === 6 ? "bg-blue-600" : "bg-blue-100"}`}
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {["T2", "T3", "T4", "T5", "T6", "T7", "CN"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate("providerJobSheet")}
            className="bg-blue-600 text-white rounded-2xl p-4 shadow-lg flex flex-col gap-2"
          >
            <Timer className="w-6 h-6" />
            <span className="font-bold text-sm">Yêu cầu khẩn cấp</span>
            <span className="text-blue-200 text-xs">3 yêu cầu đang chờ</span>
          </button>
          <button
            onClick={() => onNavigate("providerSchedule")}
            className="bg-white border-2 border-border rounded-2xl p-4 shadow-sm flex flex-col gap-2 hover:bg-muted transition-colors"
          >
            <Calendar className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-sm text-foreground">Lịch làm việc</span>
            <span className="text-muted-foreground text-xs">5 slot còn trống</span>
          </button>
        </div>
      </div>
    </div>
  );
}
