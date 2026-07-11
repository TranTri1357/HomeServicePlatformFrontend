import { useEffect, useState } from "react";
import { Bell, DollarSign, Briefcase, Star, TrendingUp, Timer, Calendar } from "lucide-react";
import type { Screen } from "@/shared/types";
import { taskerApi } from "@/services/api";
import { useApi, useHasUnreadNotifications } from "@/shared/hooks";
import { useAuth } from "@/app/providers";
import { Avatar } from "@/shared/ui";
import { formatVnd, notify } from "@/shared/lib";

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function ProviderDashboard({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { user } = useAuth();

  const { data: dashboard, loading } = useApi(() => taskerApi.getTaskerDashboard());
  const { data: jobs = [] } = useApi(() => taskerApi.getTaskerJobs(), { initialData: [] });
  const hasUnread = useHasUnreadNotifications("provider");

  const [online, setOnline] = useState(true);
  const [togglingOnline, setTogglingOnline] = useState(false);

  // Seed the toggle from the server state once loaded.
  useEffect(() => {
    if (dashboard) setOnline(dashboard.isAvailable);
  }, [dashboard]);

  const toggleOnline = async () => {
    const next = !online;
    setOnline(next); // optimistic
    setTogglingOnline(true);
    try {
      await taskerApi.setAvailability(next);
    } catch (err) {
      setOnline(!next); // revert
      notify.error(err);
    } finally {
      setTogglingOnline(false);
    }
  };

  const name = dashboard?.fullName || user?.fullName || "Thợ";
  const todayJobs = jobs.filter((j) => isToday(j.startAt) && j.jobStatus !== 5);

  const weekly = dashboard?.weeklyRevenue ?? [];
  const maxRevenue = Math.max(1, ...weekly.map((d) => d.amount));

  const stats = [
    {
      label: "Thu nhập hôm nay",
      value: `${formatVnd(dashboard?.todayEarnings ?? 0)}đ`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Công việc hôm nay",
      value: `${dashboard?.todayJobsCount ?? 0}`,
      icon: Briefcase,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Đánh giá TB",
      value: `${dashboard?.ratingAvg ?? 0} ★`,
      icon: Star,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      label: "Tháng này",
      value: `${formatVnd(dashboard?.monthEarnings ?? 0)}đ`,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="overflow-y-auto h-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-4 pt-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-slate-400 text-sm">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
            <h2 className="text-white text-xl font-bold">{name}</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigate("providerNotifications")}
              className="relative w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"
            >
              <Bell className="w-5 h-5 text-white" />
              {hasUnread && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-slate-800" />
              )}
            </button>
            <button
              onClick={() => onNavigate("providerProfile")}
              className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/40 ring-offset-2 ring-offset-slate-900"
            >
              <Avatar size={40} name={name} />
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
            onClick={toggleOnline}
            disabled={togglingOnline}
            className={`relative w-14 h-7 rounded-full transition-colors disabled:opacity-60 ${online ? "bg-green-500" : "bg-slate-600"}`}
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
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-2`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-xl font-extrabold text-foreground">
                {loading && !dashboard ? "…" : stat.value}
              </p>
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
          {todayJobs.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground text-center">
              Chưa có công việc nào hôm nay.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {todayJobs.map((job) => (
                <div key={job.bookingItemId} className="px-4 py-3 flex items-start gap-3">
                  <div className="w-2 mt-2 flex-shrink-0">
                    <div
                      className={`w-2 h-2 rounded-full ${job.jobStatus === 3 ? "bg-purple-500 animate-pulse" : "bg-blue-500"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-foreground">{job.serviceName}</p>
                      <span className="text-sm font-bold text-green-600">
                        {formatVnd(job.totalPrice)}đ
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {job.customerName} ·{" "}
                      {new Date(job.startAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">{job.fullAddress}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-foreground mb-4">Doanh thu 7 ngày</h3>
          <div className="flex items-end gap-2 h-24">
            {weekly.length === 0
              ? [1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="flex-1 bg-slate-100 rounded-t-lg h-1/2" />
                ))
              : weekly.map((d, i) => {
                  const pct = Math.round((d.amount / maxRevenue) * 100);
                  const isLast = i === weekly.length - 1;
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t-lg transition-all ${isLast ? "bg-blue-600" : "bg-blue-100"}`}
                        style={{ height: `${Math.max(pct, 4)}%` }}
                        title={`${formatVnd(d.amount)}đ`}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {WEEKDAYS[new Date(d.date).getDay()]}
                      </span>
                    </div>
                  );
                })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate("providerJobManagement")}
            className="bg-blue-600 text-white rounded-2xl p-4 shadow-lg flex flex-col gap-2"
          >
            <Timer className="w-6 h-6" />
            <span className="font-bold text-sm">Quản lý công việc</span>
            <span className="text-blue-200 text-xs">{jobs.length} việc</span>
          </button>
          <button
            onClick={() => onNavigate("providerSchedule")}
            className="bg-white border-2 border-border rounded-2xl p-4 shadow-sm flex flex-col gap-2 hover:bg-muted transition-colors"
          >
            <Calendar className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-sm text-foreground">Lịch làm việc</span>
            <span className="text-muted-foreground text-xs">Xem lịch</span>
          </button>
        </div>
      </div>
    </div>
  );
}
