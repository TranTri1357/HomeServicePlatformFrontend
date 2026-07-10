import { DollarSign, FileText, Users, Wrench, Flag, Loader2, AlertCircle } from "lucide-react";
import type { Screen, AdminTaskerItem } from "@/shared/types";
import { adminDashboardApi, adminTaskerApi } from "@/services/api";
import { useApi } from "@/shared/hooks";
import { formatVnd, formatDateVn, notify } from "@/shared/lib";
import { useState } from "react";

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const STATUS: Record<number, { label: string; cls: string; bar: string }> = {
  0: { label: "Chờ xác nhận", cls: "bg-amber-100 text-amber-700", bar: "bg-amber-400" },
  1: { label: "Đã xác nhận", cls: "bg-blue-100 text-blue-700", bar: "bg-blue-400" },
  2: { label: "Đang đến", cls: "bg-indigo-100 text-indigo-700", bar: "bg-indigo-400" },
  3: { label: "Đang thực hiện", cls: "bg-purple-100 text-purple-700", bar: "bg-purple-400" },
  4: { label: "Hoàn thành", cls: "bg-green-100 text-green-700", bar: "bg-green-400" },
  5: { label: "Đã hủy", cls: "bg-red-100 text-red-700", bar: "bg-red-400" },
  6: { label: "Hoàn tiền", cls: "bg-orange-100 text-orange-700", bar: "bg-orange-400" },
};

export function Dashboard({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { data: d, loading, error, refetch } = useApi(() => adminDashboardApi.getDashboard());
  const { data: pending = [], refetch: refetchPending } = useApi(
    () => adminTaskerApi.getTaskers({ status: 0, pageSize: 5 }).then((p) => p.items),
    { initialData: [] },
  );

  const [busyId, setBusyId] = useState<number | null>(null);

  const act = async (t: AdminTaskerItem, action: "approve" | "reject") => {
    setBusyId(t.taskerId);
    try {
      if (action === "approve") await adminTaskerApi.approveTasker(t.taskerId);
      else await adminTaskerApi.rejectTasker(t.taskerId, "Hồ sơ chưa đạt yêu cầu.");
      notify.success(action === "approve" ? "Đã duyệt thợ." : "Đã từ chối hồ sơ.");
      void refetchPending();
      void refetch();
    } catch (err) {
      notify.error(err);
    } finally {
      setBusyId(null);
    }
  };

  if (loading && !d) {
    return (
      <div className="py-24 flex items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="w-6 h-6 animate-spin" /> Đang tải số liệu...
      </div>
    );
  }
  if (error && !d) {
    return (
      <div className="py-24 flex flex-col items-center gap-3 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          onClick={() => void refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
        >
          Thử lại
        </button>
      </div>
    );
  }
  if (!d) return null;

  const weekly = d.weeklyRevenue;
  const maxRev = Math.max(1, ...weekly.map((x) => x.amount));
  const maxStatus = Math.max(1, ...d.bookingsByStatus.map((x) => x.count));

  const kpis = [
    {
      label: "Doanh thu hôm nay",
      value: `${formatVnd(d.todayRevenue)}đ`,
      sub: `Tổng: ${formatVnd(d.totalRevenue)}đ`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Đơn hôm nay",
      value: `${d.todayBookings}`,
      sub: `Tổng: ${d.totalBookings} đơn`,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Khách hàng",
      value: `${d.totalCustomers}`,
      sub: `${d.openDisputes} khiếu nại đang mở`,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Thợ hoạt động",
      value: `${d.activeTaskers}`,
      sub: `${d.pendingTaskers} chờ duyệt · ${d.totalTaskers} tổng`,
      icon: Wrench,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Tổng quan hoạt động hệ thống</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center mb-3`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-foreground mb-1">Doanh thu 7 ngày gần nhất</h3>
          <p className="text-xs text-muted-foreground mb-5">
            Tổng: {formatVnd(weekly.reduce((a, x) => a + x.amount, 0))}đ
          </p>
          <div className="flex items-end gap-2 h-36">
            {weekly.map((x) => {
              const pct = Math.round((x.amount / maxRev) * 100);
              return (
                <div key={x.date} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {x.amount > 0 ? `${(x.amount / 1_000_000).toFixed(1)}M` : ""}
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-blue-500 transition-all"
                    style={{ height: `${Math.max(pct, 2)}%` }}
                    title={`${formatVnd(x.amount)}đ`}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {WEEKDAYS[new Date(x.date).getDay()]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bookings by status */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-foreground mb-4">Đơn theo trạng thái</h3>
          {d.bookingsByStatus.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có đơn nào.</p>
          ) : (
            <div className="space-y-3">
              {d.bookingsByStatus.map((s) => {
                const cfg = STATUS[s.status] ?? STATUS[0];
                return (
                  <div key={s.status}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-foreground">{cfg.label}</span>
                      <span className="text-muted-foreground">{s.count} đơn</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cfg.bar} rounded-full`}
                        style={{ width: `${(s.count / maxStatus) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent bookings */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-foreground">Đơn hàng gần đây</h3>
            <button
              onClick={() => onNavigate("adminOrders")}
              className="text-blue-600 text-xs font-semibold hover:underline"
            >
              Xem tất cả
            </button>
          </div>
          {d.recentBookings.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted-foreground text-center">Chưa có đơn nào.</p>
          ) : (
            <div className="divide-y divide-border">
              {d.recentBookings.map((o) => {
                const cfg = STATUS[o.status] ?? STATUS[0];
                return (
                  <div key={o.bookingId} className="px-5 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">BK{o.bookingId}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {o.customerName} · {formatDateVn(o.createdAt)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-foreground">{formatVnd(o.finalAmount)}đ</p>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending taskers */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-foreground">Thợ chờ duyệt</h3>
            <button
              onClick={() => onNavigate("adminProviders")}
              className="text-blue-600 text-xs font-semibold hover:underline"
            >
              Xem tất cả
            </button>
          </div>
          {pending.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted-foreground text-center">
              Không có hồ sơ chờ duyệt.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {pending.map((p) => (
                <div key={p.taskerId} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-xs font-bold">{p.fullName.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{p.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.skills[0] ?? "Thợ"} · {formatDateVn(p.joinedDate)}
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => act(p, "approve")}
                      disabled={busyId === p.taskerId}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors disabled:opacity-60"
                    >
                      Duyệt
                    </button>
                    <button
                      onClick={() => act(p, "reject")}
                      disabled={busyId === p.taskerId}
                      className="px-2 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors disabled:opacity-60"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {d.openDisputes > 0 && (
        <button
          onClick={() => onNavigate("adminComplaints")}
          className="w-full bg-red-50 border border-red-200 rounded-2xl px-5 py-3 flex items-center gap-3 hover:bg-red-100 transition-colors"
        >
          <Flag className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-sm font-semibold text-red-700">
            Có {d.openDisputes} khiếu nại đang chờ xử lý
          </span>
        </button>
      )}
    </div>
  );
}
