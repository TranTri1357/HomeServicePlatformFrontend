import { useState } from "react";
import { X, RefreshCw } from "lucide-react";
import { adminOrdersList } from "@/services/Admin/order.data";
import { AdminBadge, ConfirmModal, AdminPagination, AdminSearchBar } from "@/components/Admin";
import { useOrders } from "@/hooks/Admin/useOrders";

// ─── Shared helpers (booking status) ─────────────────────────────────────────
const statusConfig = {
  pending:     { label: "Chờ xác nhận",   color: "bg-amber-100 text-amber-700",   dot: "bg-amber-500"  },
  accepted:    { label: "Đã xác nhận",    color: "bg-blue-100 text-blue-700",     dot: "bg-blue-500"   },
  in_progress: { label: "Đang thực hiện", color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  completed:   { label: "Hoàn thành",     color: "bg-green-100 text-green-700",   dot: "bg-green-500"  },
  cancelled:   { label: "Đã hủy",         color: "bg-red-100 text-red-700",       dot: "bg-red-500"    },
  upcoming:    { label: "Sắp tới",        color: "bg-blue-100 text-blue-700",     dot: "bg-blue-500"   },
};

function Badge({ status }: { status: keyof typeof statusConfig }) {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function Orders() {
  const { search, setSearch, statusFilter, setStatusFilter, page, setPage, filtered, paged, perPage } = useOrders();
  const [selected, setSelected] = useState<
    (typeof adminOrdersList)[0] | null
  >(null);
  const [confirm, setConfirm] = useState<{
    show: boolean;
    item: (typeof adminOrdersList)[0] | null;
  }>({ show: false, item: null });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Quản lý đơn hàng
          </h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi và quản lý tất cả đơn đặt lịch
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-xl font-semibold text-sm hover:bg-accent transition-colors flex-shrink-0">
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          {
            label: "Tổng đơn",
            value: adminOrdersList.length,
            color: "text-blue-600",
          },
          {
            label: "Chờ xác nhận",
            value: adminOrdersList.filter(
              (o) => o.status === "pending",
            ).length,
            color: "text-amber-600",
          },
          {
            label: "Đang làm",
            value: adminOrdersList.filter(
              (o) => o.status === "in_progress",
            ).length,
            color: "text-purple-600",
          },
          {
            label: "Hoàn thành",
            value: adminOrdersList.filter(
              (o) => o.status === "completed",
            ).length,
            color: "text-green-600",
          },
          {
            label: "Đã hủy",
            value: adminOrdersList.filter(
              (o) => o.status === "cancelled",
            ).length,
            color: "text-red-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-3 shadow-sm text-center"
          >
            <p className={`text-2xl font-extrabold ${s.color}`}>
              {s.value}
            </p>
            <p className="text-xs text-muted-foreground">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap gap-3">
          <AdminSearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Tìm theo mã, khách hàng, dịch vụ..."
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border border-border rounded-xl px-3 py-2 text-sm focus:outline-none bg-background"
          >
            <option value="all">Tất cả</option>
            {[
              "pending",
              "accepted",
              "in_progress",
              "completed",
              "cancelled",
            ].map((s) => (
              <option key={s} value={s}>
                {statusConfig[s as keyof typeof statusConfig]
                  ?.label ?? s}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-muted/40">
              <tr>
                {[
                  "Mã đơn",
                  "Khách hàng",
                  "Thợ",
                  "Dịch vụ",
                  "Ngày / Giờ",
                  "Tổng tiền",
                  "Hoa hồng",
                  "Trạng thái",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-bold text-muted-foreground px-4 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.map((o) => (
                <tr
                  key={o.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-bold text-blue-600">
                    {o.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {o.customer}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {o.provider}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {o.service}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {o.date}
                    <br />
                    {o.time}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-foreground">
                    {o.price}đ
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600">
                    {o.commission}đ
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      status={
                        o.status as keyof typeof statusConfig
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setSelected(o)}
                        className="px-2 py-1 bg-muted hover:bg-accent rounded-lg text-xs font-semibold transition-colors"
                      >
                        Chi tiết
                      </button>
                      {o.status !== "cancelled" &&
                        o.status !== "completed" && (
                          <button
                            onClick={() =>
                              setConfirm({
                                show: true,
                                item: o,
                              })
                            }
                            className="px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Hủy
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AdminPagination
          page={page}
          total={filtered.length}
          perPage={perPage}
          onChange={setPage}
        />
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/40 z-[100] flex justify-end"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-border px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-foreground">
                Chi tiết đơn {selected.id}
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-extrabold text-blue-600">
                  {selected.price}đ
                </span>
                <Badge
                  status={
                    selected.status as keyof typeof statusConfig
                  }
                />
              </div>
              {[
                { label: "Dịch vụ", value: selected.service },
                {
                  label: "Khách hàng",
                  value: selected.customer,
                },
                {
                  label: "Thợ kỹ thuật",
                  value: selected.provider,
                },
                {
                  label: "Ngày thực hiện",
                  value: `${selected.date}, ${selected.time}`,
                },
                { label: "Địa chỉ", value: selected.address },
                {
                  label: "Hoa hồng hệ thống",
                  value: `${selected.commission}đ`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between py-2 border-b border-border last:border-0"
                >
                  <span className="text-sm text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-foreground text-right max-w-[60%]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {confirm.show && confirm.item && (
        <ConfirmModal
          title="Hủy đơn hàng?"
          message={`Đơn hàng ${confirm.item.id} sẽ bị hủy. Thao tác này không thể hoàn tác.`}
          confirmLabel="Hủy đơn"
          onConfirm={() =>
            setConfirm({ show: false, item: null })
          }
          onCancel={() =>
            setConfirm({ show: false, item: null })
          }
        />
      )}
    </div>
  );
}
