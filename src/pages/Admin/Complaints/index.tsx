import { useState } from "react";
import { X, Flag } from "lucide-react";
import { AdminBadge, ConfirmModal, AdminPagination, AdminSearchBar } from "@/components/Admin";
import { useComplaints } from "@/hooks/Admin/useComplaints";
import type { AdminComplaint } from "@/shared/types";

export function Complaints() {
  const { search, setSearch, statusFilter, setStatusFilter, page, setPage, filtered, paged, perPage, items, updateStatus } = useComplaints();
  const [selected, setSelected] = useState<AdminComplaint | null>(null);
  const [confirm, setConfirm] = useState<{
    show: boolean;
    action: string;
    item: AdminComplaint | null;
  }>({ show: false, action: "", item: null });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Quản lý khiếu nại
        </h1>
        <p className="text-sm text-muted-foreground">
          Tiếp nhận và xử lý khiếu nại từ người dùng
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Khiếu nại mới",
            value: items.filter((c) => c.status === "open")
              .length,
            color: "text-red-600",
            bg: "bg-red-100",
          },
          {
            label: "Đang xử lý",
            value: items.filter(
              (c) => c.status === "processing",
            ).length,
            color: "text-amber-600",
            bg: "bg-amber-100",
          },
          {
            label: "Đã giải quyết",
            value: items.filter((c) => c.status === "resolved")
              .length,
            color: "text-green-600",
            bg: "bg-green-100",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}
            >
              <Flag className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p
                className={`text-xl font-extrabold ${s.color}`}
              >
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground">
                {s.label}
              </p>
            </div>
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
            placeholder="Tìm theo mã, khách hàng, loại..."
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
            <option value="open">Mới</option>
            <option value="processing">Đang xử lý</option>
            <option value="resolved">Đã giải quyết</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px]">
            <thead className="bg-muted/40">
              <tr>
                {[
                  "Mã KN",
                  "Khách hàng",
                  "Thợ",
                  "Loại",
                  "Nội dung",
                  "Mức độ",
                  "Trạng thái",
                  "Ngày",
                  "Thao tác",
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
              {paged.map((c) => (
                <tr
                  key={c.id}
                  className={`hover:bg-muted/30 transition-colors ${c.priority === "high" && c.status === "open" ? "bg-red-50/40" : ""}`}
                >
                  <td className="px-4 py-3 text-sm font-bold text-blue-600">
                    {c.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {c.customer}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {c.provider}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-accent text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {c.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">
                    {c.content}
                  </td>
                  <td className="px-4 py-3">
                    <AdminBadge status={c.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <AdminBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {c.date}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setSelected(c)}
                        className="px-2 py-1 bg-muted hover:bg-accent rounded-lg text-xs font-semibold transition-colors"
                      >
                        Xem
                      </button>
                      {c.status === "open" && (
                        <button
                          onClick={() =>
                            setConfirm({
                              show: true,
                              action: "process",
                              item: c,
                            })
                          }
                          className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Xử lý
                        </button>
                      )}
                      {c.status === "processing" && (
                        <button
                          onClick={() =>
                            setConfirm({
                              show: true,
                              action: "resolve",
                              item: c,
                            })
                          }
                          className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Đóng
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
              <h3 className="font-bold">
                Chi tiết khiếu nại {selected.id}
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <AdminBadge status={selected.status} />
                <AdminBadge status={selected.priority} />
                <span className="bg-accent text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {selected.type}
                </span>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm font-medium text-red-800 leading-relaxed">
                  {selected.content}
                </p>
              </div>
              {[
                ["Khách hàng", selected.customer],
                ["Thợ bị khiếu nại", selected.provider],
                ["Đơn hàng liên quan", selected.order],
                ["Ngày khiếu nại", selected.date],
              ].map(([l, v]) => (
                <div
                  key={l}
                  className="flex justify-between py-2 border-b border-border last:border-0"
                >
                  <span className="text-sm text-muted-foreground">
                    {l}
                  </span>
                  <span className="text-sm font-semibold">
                    {v}
                  </span>
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Ghi chú xử lý
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-muted px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Nhập ghi chú xử lý khiếu nại..."
                />
              </div>
              {selected.status !== "resolved" && (
                <button
                  onClick={() => {
                    setSelected(null);
                    setConfirm({
                      show: true,
                      action: "resolve",
                      item: selected,
                    });
                  }}
                  className="w-full py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                >
                  Đánh dấu đã giải quyết
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {confirm.show && confirm.item && (
        <ConfirmModal
          title={
            confirm.action === "process"
              ? "Nhận xử lý khiếu nại?"
              : "Đóng khiếu nại?"
          }
          message={`Khiếu nại ${confirm.item.id} từ ${confirm.item.customer} sẽ ${confirm.action === "process" ? "được chuyển sang trạng thái đang xử lý." : "được đánh dấu đã giải quyết."}`}
          confirmLabel={
            confirm.action === "process"
              ? "Nhận xử lý"
              : "Đóng khiếu nại"
          }
          danger={false}
          onConfirm={() => {
            updateStatus(
              confirm.item!.id,
              confirm.action === "process" ? "processing" : "resolved",
            );
            setConfirm({ show: false, action: "", item: null });
          }}
          onCancel={() =>
            setConfirm({ show: false, action: "", item: null })
          }
        />
      )}
    </div>
  );
}
