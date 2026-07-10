import { useEffect, useState } from "react";
import { X, Flag, Loader2, AlertCircle } from "lucide-react";
import type { AdminDisputeItem } from "@/shared/types";
import { adminDisputeApi } from "@/services/api";
import { useApi } from "@/shared/hooks";
import { notify, getErrorMessage, formatVnd, formatDateVn } from "@/shared/lib";
import { AdminPagination } from "@/components/Admin";

const PAGE_SIZE = 10;

const STATUS: Record<number, { label: string; cls: string }> = {
  0: { label: "Chờ xử lý", cls: "bg-amber-100 text-amber-700" },
  1: { label: "Đã hoàn tiền", cls: "bg-green-100 text-green-700" },
  2: { label: "Đã từ chối", cls: "bg-slate-200 text-slate-600" },
};

function StatusBadge({ status }: { status: number }) {
  const s = STATUS[status] ?? STATUS[0];
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>;
}

export function Complaints() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data: paged, loading, error, refetch } = useApi(
    () =>
      adminDisputeApi.getDisputes({
        status: statusFilter === "all" ? undefined : Number(statusFilter),
        pageIndex: page,
        pageSize: PAGE_SIZE,
      }),
    { immediate: false },
  );
  useEffect(() => {
    void refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  const items = paged?.items ?? [];
  const total = paged?.totalCount ?? 0;

  // Detail / resolve panel.
  const [selected, setSelected] = useState<AdminDisputeItem | null>(null);
  const [decision, setDecision] = useState<1 | 2>(1); // 1 hoàn tiền · 2 từ chối
  const [note, setNote] = useState("");
  const [refund, setRefund] = useState("");
  const [resolving, setResolving] = useState(false);

  const openDetail = (d: AdminDisputeItem) => {
    setSelected(d);
    setDecision(1);
    setNote("");
    setRefund("");
  };

  const resolve = async () => {
    if (!selected) return;
    if (!note.trim()) {
      notify.error("Vui lòng nhập ghi chú giải quyết.");
      return;
    }
    const refundAmount = decision === 1 ? Number(refund) || 0 : 0;
    setResolving(true);
    try {
      await adminDisputeApi.resolveDispute(
        selected.disputeId,
        decision,
        note.trim(),
        refundAmount,
        selected.rowVersion,
      );
      notify.success(decision === 1 ? "Đã duyệt hoàn tiền cho khách." : "Đã từ chối khiếu nại.");
      setSelected(null);
      void refetch();
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quản lý khiếu nại</h1>
        <p className="text-sm text-muted-foreground">Tiếp nhận và phán quyết khiếu nại từ khách hàng</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border border-border rounded-xl px-3 py-2 text-sm focus:outline-none bg-background"
          >
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {loading && items.length === 0 ? (
          <div className="py-16 flex items-center justify-center text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Đang tải...
          </div>
        ) : error ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => void refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
            >
              Thử lại
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
            <Flag className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium">Không có khiếu nại nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-muted/40">
                <tr>
                  {["Mã KN", "Người khiếu nại", "Đơn", "Lý do", "Hoàn tiền", "Trạng thái", "Ngày", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-bold text-muted-foreground px-4 py-3"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((d) => (
                  <tr
                    key={d.disputeId}
                    className={`hover:bg-muted/30 transition-colors ${d.status === 0 ? "bg-amber-50/40" : ""}`}
                  >
                    <td className="px-4 py-3 text-sm font-bold text-blue-600">KN{d.disputeId}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{d.raisedByName}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">BK{d.bookingId}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[220px] truncate">
                      {d.reason}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">
                      {d.refundAmount && d.refundAmount > 0 ? `${formatVnd(d.refundAmount)}đ` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDateVn(d.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDetail(d)}
                        className="px-2 py-1 bg-muted hover:bg-accent rounded-lg text-xs font-semibold transition-colors"
                      >
                        {d.status === 0 ? "Xử lý" : "Xem"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AdminPagination page={page} total={total} perPage={PAGE_SIZE} onChange={setPage} />
      </div>

      {/* Detail / resolve panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex justify-end" onClick={() => setSelected(null)}>
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-border px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold">Khiếu nại KN{selected.disputeId}</h3>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={selected.status} />
                <span className="text-xs text-muted-foreground">Đơn BK{selected.bookingId}</span>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-red-700 mb-1">Nội dung khiếu nại</p>
                <p className="text-sm text-red-800 leading-relaxed">{selected.reason}</p>
              </div>

              {[
                ["Người khiếu nại", selected.raisedByName],
                ["Ngày gửi", formatDateVn(selected.createdAt)],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">{l}</span>
                  <span className="text-sm font-semibold">{v}</span>
                </div>
              ))}

              {selected.status === 0 ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                      Phán quyết
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setDecision(1)}
                        className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${decision === 1 ? "border-green-600 bg-green-50 text-green-700" : "border-transparent bg-muted text-foreground"}`}
                      >
                        Đồng ý hoàn tiền
                      </button>
                      <button
                        onClick={() => setDecision(2)}
                        className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${decision === 2 ? "border-red-600 bg-red-50 text-red-600" : "border-transparent bg-muted text-foreground"}`}
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>

                  {decision === 1 && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                        Số tiền hoàn (đ)
                      </label>
                      <input
                        value={refund}
                        onChange={(e) => setRefund(e.target.value.replace(/\D/g, ""))}
                        inputMode="numeric"
                        className="w-full bg-muted px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="VD: 150000"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                      Ghi chú giải quyết *
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      className="w-full bg-muted px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Nhập phán quyết / hướng xử lý..."
                    />
                  </div>

                  <button
                    onClick={resolve}
                    disabled={resolving}
                    className={`w-full py-2.5 rounded-xl font-bold text-white transition-colors disabled:opacity-70 flex items-center justify-center gap-2 ${decision === 1 ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                  >
                    {resolving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {decision === 1 ? "Duyệt hoàn tiền & đóng ca" : "Từ chối & đóng ca"}
                  </button>
                  <p className="text-[11px] text-muted-foreground">
                    Đồng ý hoàn tiền → đơn chuyển "Đang hoàn tiền"; từ chối → đơn giữ "Hoàn thành".
                  </p>
                </div>
              ) : (
                <div className="bg-muted rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Số tiền hoàn</span>
                    <span className="text-sm font-bold text-green-600">
                      {selected.refundAmount && selected.refundAmount > 0
                        ? `${formatVnd(selected.refundAmount)}đ`
                        : "0đ"}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Ghi chú xử lý</p>
                    <p className="text-sm text-foreground">{selected.resolutionNote || "—"}</p>
                  </div>
                  {selected.resolvedAt && (
                    <p className="text-[11px] text-muted-foreground">
                      Đã xử lý: {formatDateVn(selected.resolvedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
