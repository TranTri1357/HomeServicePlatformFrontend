import { DollarSign, FileText, Users, Wrench } from "lucide-react";
import type { Screen } from "@/shared/types";
import { AdminBadge } from "@/components/Admin";
import { useDashboard } from "@/hooks/Admin/useDashboard";

export function Dashboard({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { revenueChartData, maxRev, pendingProviders, recentOrders } = useDashboard();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Tổng quan hoạt động hệ thống – Thứ Sáu, 20/06/2026
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Doanh thu hôm nay",
            value: "4,250,000đ",
            change: "+12.5%",
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-100",
            up: true,
          },
          {
            label: "Đơn hàng hôm nay",
            value: "38",
            change: "+8.2%",
            icon: FileText,
            color: "text-blue-600",
            bg: "bg-blue-100",
            up: true,
          },
          {
            label: "Khách hàng",
            value: "3,241",
            change: "+124 tháng này",
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-100",
            up: true,
          },
          {
            label: "Thợ hoạt động",
            value: "187",
            change: "12 chờ duyệt",
            icon: Wrench,
            color: "text-amber-600",
            bg: "bg-amber-100",
            up: false,
          },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${kpi.up ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
              >
                {kpi.change}
              </span>
            </div>
            <p className="text-2xl font-extrabold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-foreground">Doanh thu 7 ngày gần nhất</h3>
              <p className="text-xs text-muted-foreground">Tổng: 37,100,000đ</p>
            </div>
            <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
              +15% so với tuần trước
            </span>
          </div>
          <div className="flex items-end gap-2 h-36">
            {revenueChartData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground font-medium">
                  {(d.value / 1000000).toFixed(1)}M
                </span>
                <div className="w-full relative group">
                  <div
                    className={`w-full rounded-t-lg transition-all ${i === revenueChartData.length - 1 ? "bg-blue-600" : "bg-blue-100 group-hover:bg-blue-300"}`}
                    style={{
                      height: `${(d.value / maxRev) * 100}px`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Service breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-foreground mb-4">Đơn hàng theo loại dịch vụ</h3>
          <div className="space-y-3">
            {[
              {
                name: "Điện",
                pct: 35,
                count: 312,
                color: "bg-amber-400",
              },
              {
                name: "Dọn dẹp",
                pct: 28,
                count: 421,
                color: "bg-green-400",
              },
              {
                name: "Điều hòa",
                pct: 18,
                count: 198,
                color: "bg-blue-400",
              },
              {
                name: "Nước",
                pct: 12,
                count: 245,
                color: "bg-cyan-400",
              },
              {
                name: "Khác",
                pct: 7,
                count: 156,
                color: "bg-purple-400",
              },
            ].map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-foreground">{item.name}</span>
                  <span className="text-muted-foreground">{item.count} đơn</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
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
          <div className="divide-y divide-border">
            {recentOrders.map((order) => (
              <div key={order.id} className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{order.service}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {order.customer} → {order.provider}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-foreground">{order.price}đ</p>
                  <AdminBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending providers */}
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
          <div className="divide-y divide-border">
            {pendingProviders.map((p) => (
              <div key={p.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs font-bold">{p.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.skill} · {p.joined}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors">
                    Duyệt
                  </button>
                  <button className="px-2 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors">
                    Từ chối
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
