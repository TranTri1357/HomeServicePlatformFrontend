import { useState } from "react";
import { Calendar, MapPin, MessageCircle, Map, Star, AlertCircle, Loader2 } from "lucide-react";
import type { Screen } from "@/shared/types";
import { bookingApi } from "@/services/api";
import { useApi } from "@/shared/hooks";
import { TopBar } from "@/shared/ui";
import { formatVnd, notify } from "@/shared/lib";

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

const TABS: { key: string; label: string; statuses: number[] | null }[] = [
  { key: "all", label: "Tất cả", statuses: null },
  { key: "waiting", label: "Chờ", statuses: [0, 1, 2] },
  { key: "working", label: "Đang làm", statuses: [3] },
  { key: "done", label: "Xong", statuses: [4] },
  { key: "cancelled", label: "Hủy", statuses: [5, 6] },
];

// A booking can be cancelled before the tasker starts working.
const CANCELLABLE = [0, 1];

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BookingManagement({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [activeTab, setActiveTab] = useState("all");
  const { data: bookings = [], loading, error, refetch } = useApi(() => bookingApi.getMyBookings());

  // Cancel modal state.
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const activeStatuses = TABS.find((t) => t.key === activeTab)?.statuses ?? null;
  const filtered = activeStatuses ? bookings.filter((b) => activeStatuses.includes(b.status)) : bookings;

  const confirmCancel = async () => {
    if (cancelTarget == null) return;
    if (!cancelReason.trim()) {
      notify.error("Vui lòng nhập lý do hủy.");
      return;
    }
    setCancelling(true);
    try {
      await bookingApi.cancelBooking(cancelTarget, cancelReason.trim());
      notify.success("Đã hủy đơn thành công");
      setCancelTarget(null);
      setCancelReason("");
      void refetch();
    } catch (err) {
      notify.error(err);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Lịch đặt của tôi" onBack={() => onNavigate("customerHome")} />

      {/* Tabs */}
      <div className="bg-white border-b border-border px-4 py-2 flex gap-1 overflow-x-auto scrollbar-none">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${activeTab === t.key ? "bg-blue-600 text-white" : "text-muted-foreground hover:bg-muted"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && bookings.length === 0 ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse space-y-3">
              <div className="h-4 w-1/2 bg-slate-200 rounded" />
              <div className="h-3 w-1/3 bg-slate-200 rounded" />
              <div className="h-3 w-2/3 bg-slate-200 rounded" />
            </div>
          ))
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => void refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
            >
              Thử lại
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Calendar className="w-10 h-10 text-slate-300" />
            <p className="text-sm text-muted-foreground">Chưa có đơn đặt lịch nào</p>
          </div>
        ) : (
          filtered.map((bk) => {
            const s = STATUS[bk.status] ?? STATUS[0];
            return (
              <div key={bk.bookingId} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-foreground">{bk.serviceName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      BK{bk.bookingId} · Thợ: {bk.taskerName || "Đang tìm thợ..."}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                </div>

                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{formatDateTime(bk.startAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{bk.fullAddress}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-blue-600">
                    {formatVnd(bk.finalAmount)}đ
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onNavigate("chat")}
                      className="px-3 py-1.5 bg-muted rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-accent transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Chat
                    </button>
                    {bk.status === 3 && (
                      <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1">
                        <Map className="w-3.5 h-3.5" />
                        Theo dõi
                      </button>
                    )}
                    {bk.status === 4 && (
                      <button className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5" />
                        Đánh giá
                      </button>
                    )}
                    {CANCELLABLE.includes(bk.status) && (
                      <button
                        onClick={() => {
                          setCancelTarget(bk.bookingId);
                          setCancelReason("");
                        }}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cancel modal */}
      {cancelTarget != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <div>
              <h3 className="font-bold text-foreground">Hủy đơn BK{cancelTarget}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Vui lòng cho biết lý do bạn muốn hủy đơn này.
              </p>
            </div>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              autoFocus
              className="w-full bg-muted rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              placeholder="VD: Tôi đã đặt nhầm dịch vụ / thay đổi lịch..."
            />
            <div className="flex gap-2">
              <button
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold disabled:opacity-60"
              >
                Quay lại
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelling}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                {cancelling ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
