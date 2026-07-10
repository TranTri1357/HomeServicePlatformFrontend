import { useEffect, useState } from "react";
import { X, RefreshCw, Loader2, AlertCircle, ClipboardList, MapPin, Wrench, Phone } from "lucide-react";
import type { AdminBookingItem, AdminBookingDetail } from "@/shared/types";
import { adminBookingApi } from "@/services/api";
import { useApi } from "@/shared/hooks";
import { notify, formatVnd, formatDateVn } from "@/shared/lib";
import { ConfirmModal, AdminPagination } from "@/components/Admin";

const PAGE_SIZE = 10;

// Numeric BookingStatus → label + colors.
const STATUS: Record<number, { label: string; cls: string; dot: string }> = {
  0: { label: "Chờ xác nhận", cls: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  1: { label: "Đã xác nhận", cls: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  2: { label: "Đang đến", cls: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-500" },
  3: { label: "Đang thực hiện", cls: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  4: { label: "Hoàn thành", cls: "bg-green-100 text-green-700", dot: "bg-green-500" },
  5: { label: "Đã hủy", cls: "bg-red-100 text-red-700", dot: "bg-red-500" },
  6: { label: "Đang hoàn tiền", cls: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
};

// Admin may cancel an order that isn't finished/cancelled/refunding.
const CANCELLABLE = [0, 1, 2, 3];

function Badge({ status }: { status: number }) {
  const cfg = STATUS[status] ?? STATUS[0];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function Orders() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data: paged, loading, error, refetch } = useApi(
    () =>
      adminBookingApi.getBookings({
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

  const [selected, setSelected] = useState<AdminBookingItem | null>(null);
  const [detail, setDetail] = useState<AdminBookingDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<AdminBookingItem | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const openDetail = async (o: AdminBookingItem) => {
    setSelected(o);
    setDetail(null);
    setLoadingDetail(true);
    try {
      setDetail(await adminBookingApi.getBookingDetail(o.bookingId));
    } catch (err) {
      notify.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDetail = () => {
    setSelected(null);
    setDetail(null);
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await adminBookingApi.updateBookingStatus(cancelTarget.bookingId, 5, cancelTarget.rowVersion);
      notify.success("Đã hủy đơn hàng.");
      setCancelTarget(null);
      void refetch();
    } catch (err) {
      notify.error(err);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý đơn hàng</h1>
          <p className="text-sm text-muted-foreground">Theo dõi và can thiệp các đơn đặt lịch</p>
        </div>
        <button
          onClick={() => void refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-xl font-semibold text-sm hover:bg-accent transition-colors flex-shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
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
            <ClipboardList className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium">Không có đơn hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-muted/40">
                <tr>
                  {["Mã đơn", "Khách hàng", "Địa chỉ", "Ngày tạo", "Tổng tiền", "Trạng thái", ""].map(
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
                {items.map((o) => (
                  <tr key={o.bookingId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-bold text-blue-600">BK{o.bookingId}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{o.customerName}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-[220px] truncate">
                      {o.addressLine}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDateVn(o.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-foreground">
                      {formatVnd(o.finalAmount)}đ
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={o.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openDetail(o)}
                          className="px-2 py-1 bg-muted hover:bg-accent rounded-lg text-xs font-semibold transition-colors"
                        >
                          Chi tiết
                        </button>
                        {CANCELLABLE.includes(o.status) && (
                          <button
                            onClick={() => setCancelTarget(o)}
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
        )}

        <AdminPagination page={page} total={total} perPage={PAGE_SIZE} onChange={setPage} />
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex justify-end" onClick={closeDetail}>
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-border px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-foreground">Chi tiết đơn BK{selected.bookingId}</h3>
              <button
                onClick={closeDetail}
                className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-extrabold text-blue-600">
                  {formatVnd((detail ?? selected).finalAmount)}đ
                </span>
                <Badge status={(detail ?? selected).status} />
              </div>

              {loadingDetail && !detail ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang tải chi tiết...
                </div>
              ) : detail ? (
                <>
                  <div className="space-y-0.5">
                    {[
                      ["Khách hàng", detail.customerName],
                      ["Người nhận", detail.contactName],
                    ].map(([l, v]) => (
                      <div key={l} className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">{l}</span>
                        <span className="text-sm font-semibold text-right">{v}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> Liên hệ
                      </span>
                      {detail.contactPhone ? (
                        <a
                          href={`tel:${detail.contactPhone}`}
                          className="text-sm font-semibold text-blue-600"
                        >
                          {detail.contactPhone}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5" /> Thợ thực hiện
                      </span>
                      <span className="text-sm font-semibold text-right">
                        {detail.taskerName || "Chưa có thợ"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Ngày tạo đơn</span>
                      <span className="text-sm font-semibold text-right">
                        {formatDateVn(detail.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="bg-muted rounded-xl p-3 space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span className="font-medium">{formatVnd(detail.subtotalAmount)}đ</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Giảm giá</span>
                      <span className="font-medium text-green-600">
                        -{formatVnd(detail.discountAmount)}đ
                      </span>
                    </div>
                    <div className="h-px bg-border my-1" />
                    <div className="flex justify-between">
                      <span className="font-bold">Tổng thanh toán</span>
                      <span className="font-extrabold text-blue-600">
                        {formatVnd(detail.finalAmount)}đ
                      </span>
                    </div>
                  </div>

                  {detail.note && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-0.5">Ghi chú của khách</p>
                      <p className="text-sm text-amber-900">{detail.note}</p>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{detail.fullAddress}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-2 py-2">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{selected.addressLine}</span>
                </div>
              )}

              {CANCELLABLE.includes(selected.status) && (
                <button
                  onClick={() => {
                    setCancelTarget(selected);
                    closeDetail();
                  }}
                  className="w-full py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
                >
                  Hủy đơn hàng này
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {cancelTarget && (
        <ConfirmModal
          title="Hủy đơn hàng?"
          message={`Đơn BK${cancelTarget.bookingId} của ${cancelTarget.customerName} sẽ bị hủy.`}
          confirmLabel={cancelling ? "Đang hủy..." : "Hủy đơn"}
          onConfirm={confirmCancel}
          onCancel={() => !cancelling && setCancelTarget(null)}
        />
      )}
    </div>
  );
}
