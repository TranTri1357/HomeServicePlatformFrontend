import { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  MessageCircle,
  Map,
  Star,
  Flag,
  CreditCard,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { Screen, MyBooking, CancellationPreview } from "@/shared/types";
import { bookingApi } from "@/services/api";
import { connectBookingStatus } from "@/services/realtime/bookingHub";
import { useGoBack } from "@/app/routes/useGoBack";
import { useApi } from "@/shared/hooks";
import { TopBar } from "@/shared/ui";
import { formatVnd, notify } from "@/shared/lib";

// Nhãn trạng thái để hiện toast khi trạng thái đơn đổi realtime.
const STATUS_TOAST: Record<number, string> = {
  1: "Thợ đã xác nhận đơn",
  2: "Thợ đang trên đường đến",
  3: "Thợ đã bắt đầu thực hiện",
  4: "Đơn đã hoàn thành",
  5: "Đơn đã bị hủy",
};

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

// Khách được tự hủy khi đơn Chờ xác nhận / Đã xác nhận / Đang đến (Pending/Accepted/OnTheWay).
// Số tiền hoàn phụ thuộc chính sách, xem trước trong modal trước khi xác nhận.
const CANCELLABLE = [0, 1, 2];
// Chỉ cho khiếu nại khi đơn đã Hoàn thành (đánh giá chất lượng sau khi xong việc).
const DISPUTABLE = [4];
const MIN_DISPUTE_LEN = 10;

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

export function BookingManagement({
  onNavigate,
}: {
  onNavigate: (s: Screen, d?: object) => void;
}) {
  const [activeTab, setActiveTab] = useState("all");
  const goBack = useGoBack("customerHome");
  const { data: fetched = [], loading, error, refetch } = useApi(() => bookingApi.getMyBookings());

  // Realtime status pushes from the tasker, applied on top of the fetched list
  // so a single row updates in place without a full refetch (no empty-state flash).
  const [statusOverride, setStatusOverride] = useState<Record<number, number>>({});
  useEffect(() => {
    let dispose = () => {};
    connectBookingStatus((bookingId, status) => {
      setStatusOverride((prev) =>
        prev[bookingId] === status ? prev : { ...prev, [bookingId]: status },
      );
      const label = STATUS_TOAST[status];
      if (label) notify.info(`BK${bookingId}: ${label}`);
    })
      .then((d) => {
        dispose = d;
      })
      .catch(() => {
        /* fall back to manual refresh if the hub can't connect */
      });
    return () => dispose();
  }, []);

  const bookings: MyBooking[] = fetched.map((b) =>
    statusOverride[b.bookingId] != null && statusOverride[b.bookingId] !== b.status
      ? { ...b, status: statusOverride[b.bookingId] }
      : b,
  );

  // Cancel modal state.
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  // Xem trước chính sách hoàn tiền cho đơn sắp hủy.
  const [cancelPreview, setCancelPreview] = useState<CancellationPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Mở modal hủy và tải trước số tiền hoàn/phí hủy để khách cân nhắc.
  const openCancel = async (bookingId: number) => {
    setCancelTarget(bookingId);
    setCancelReason("");
    setCancelPreview(null);
    setPreviewLoading(true);
    try {
      setCancelPreview(await bookingApi.getCancellationPreview(bookingId));
    } catch (err) {
      notify.error(err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closeCancel = () => {
    setCancelTarget(null);
    setCancelPreview(null);
  };

  // Dispute (complaint) modal state.
  const [disputeTarget, setDisputeTarget] = useState<number | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputing, setDisputing] = useState(false);

  // Review modal state (keyed by bookingItemId).
  const [reviewTarget, setReviewTarget] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewing, setReviewing] = useState(false);

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
      closeCancel();
      setCancelReason("");
      void refetch();
    } catch (err) {
      notify.error(err);
    } finally {
      setCancelling(false);
    }
  };

  const confirmDispute = async () => {
    if (disputeTarget == null) return;
    if (disputeReason.trim().length < MIN_DISPUTE_LEN) {
      notify.error(`Lý do khiếu nại cần ít nhất ${MIN_DISPUTE_LEN} ký tự.`);
      return;
    }
    setDisputing(true);
    try {
      await bookingApi.createDispute(disputeTarget, { reason: disputeReason.trim() });
      notify.success("Đã gửi khiếu nại. Chúng tôi sẽ xem xét sớm nhất.");
      setDisputeTarget(null);
      setDisputeReason("");
      void refetch();
    } catch (err) {
      notify.error(err);
    } finally {
      setDisputing(false);
    }
  };

  const openReview = (bookingItemId: number | null) => {
    if (bookingItemId == null) {
      notify.error("Đơn này chưa có hạng mục để đánh giá.");
      return;
    }
    setReviewTarget(bookingItemId);
    setReviewRating(5);
    setReviewComment("");
  };

  const confirmReview = async () => {
    if (reviewTarget == null) return;
    setReviewing(true);
    try {
      await bookingApi.createReview(reviewTarget, {
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      notify.success("Cảm ơn bạn đã gửi đánh giá!");
      setReviewTarget(null);
      void refetch();
    } catch (err) {
      notify.error(err);
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Lịch đặt của tôi" onBack={goBack} />

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
            const discount = bk.discountAmount ?? 0;
            const canReview = bk.status === 4; // Chỉ đánh giá khi đơn đã hoàn thành.
            const showPay = bk.status === 0 && !bk.isPaid; // Ẩn nút khi đã thanh toán.
            return (
              <div key={bk.bookingId} className="bg-white rounded-2xl p-4 shadow-sm">
                {/* Header: mã đơn + ngày tạo + trạng thái */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-foreground">Đơn BK{bk.bookingId}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {bk.items.length} dịch vụ · {formatDateTime(bk.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                </div>

                {/* Địa chỉ */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{bk.fullAddress}</span>
                </div>

                {/* Danh sách hạng mục dịch vụ (một đơn có thể gồm nhiều dịch vụ) */}
                <div className="space-y-2 mb-3">
                  {bk.items.map((it) => (
                    <div key={it.bookingItemId} className="rounded-xl bg-muted/50 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {it.serviceName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Thợ: {it.taskerName || "Đang tìm thợ..."}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>{formatDateTime(it.startAt)}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-blue-600">
                            {formatVnd(it.totalPrice)}đ
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {formatVnd(it.unitPrice)}đ × {it.quantity}
                          </p>
                        </div>
                      </div>

                      {/* Đánh giá theo từng hạng mục — đã đánh giá thì khoá lại */}
                      {canReview &&
                        (it.hasReview ? (
                          <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                            <Star className="w-3.5 h-3.5 fill-green-500 text-green-500" />
                            Đã đánh giá
                          </div>
                        ) : (
                          <button
                            onClick={() => openReview(it.bookingItemId)}
                            className="mt-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1 hover:bg-amber-100 transition-colors"
                          >
                            <Star className="w-3.5 h-3.5" />
                            Đánh giá
                          </button>
                        ))}
                    </div>
                  ))}
                </div>

                {/* Tóm tắt tiền + hành động cho cả đơn */}
                <div className="flex items-end justify-between border-t border-border pt-3">
                  <div>
                    {discount > 0 && (
                      <p className="text-[11px] text-muted-foreground line-through">
                        {formatVnd(bk.subtotalAmount)}đ
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground">Tổng cộng</p>
                    <span className="text-base font-extrabold text-blue-600">
                      {formatVnd(bk.finalAmount)}đ
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <button
                      onClick={() => onNavigate("chat", { bookingId: bk.bookingId })}
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
                    {DISPUTABLE.includes(bk.status) &&
                      (bk.hasDispute ? (
                        <span className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs font-semibold flex items-center gap-1">
                          <Flag className="w-3.5 h-3.5" />
                          Đã khiếu nại
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setDisputeTarget(bk.bookingId);
                            setDisputeReason("");
                          }}
                          className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-orange-100 transition-colors"
                        >
                          <Flag className="w-3.5 h-3.5" />
                          Khiếu nại
                        </button>
                      ))}
                    {showPay && (
                      <button
                        onClick={() =>
                          onNavigate("payment", {
                            bookingId: bk.bookingId,
                            finalAmount: bk.finalAmount,
                          })
                        }
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-blue-700 transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Thanh toán
                      </button>
                    )}
                    {CANCELLABLE.includes(bk.status) && (
                      <button
                        onClick={() => void openCancel(bk.bookingId)}
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

            {/* Xem trước chính sách hoàn tiền */}
            {previewLoading ? (
              <div className="flex items-center gap-2 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang tính số tiền được hoàn...
              </div>
            ) : cancelPreview ? (
              cancelPreview.totalPaid > 0 ? (
                <div className="rounded-xl border border-border bg-muted/50 p-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Đã thanh toán</span>
                    <span className="font-medium">{formatVnd(cancelPreview.totalPaid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Hoàn lại ({cancelPreview.refundPercent}%)
                    </span>
                    <span className="font-semibold text-green-600">
                      {formatVnd(cancelPreview.refundAmount)}
                    </span>
                  </div>
                  {cancelPreview.penaltyAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phí hủy (đền thợ)</span>
                      <span className="font-medium text-red-600">
                        −{formatVnd(cancelPreview.penaltyAmount)}
                      </span>
                    </div>
                  )}
                  <p className="pt-1 text-xs text-muted-foreground border-t border-border/60">
                    {cancelPreview.reason}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
                  {cancelPreview.reason}
                </div>
              )
            ) : null}

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
                onClick={closeCancel}
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

      {/* Dispute modal */}
      {disputeTarget != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <div>
              <h3 className="font-bold text-foreground">Khiếu nại đơn BK{disputeTarget}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Mô tả chi tiết vấn đề bạn gặp phải (ít nhất {MIN_DISPUTE_LEN} ký tự).
              </p>
            </div>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              rows={4}
              maxLength={1000}
              autoFocus
              className="w-full bg-muted rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              placeholder="VD: Thợ đến trễ, chất lượng chưa đạt, tính phí sai..."
            />
            <div className="flex gap-2">
              <button
                onClick={() => setDisputeTarget(null)}
                disabled={disputing}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold disabled:opacity-60"
              >
                Quay lại
              </button>
              <button
                onClick={confirmDispute}
                disabled={disputing}
                className="flex-1 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {disputing && <Loader2 className="w-4 h-4 animate-spin" />}
                {disputing ? "Đang gửi..." : "Gửi khiếu nại"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review modal */}
      {reviewTarget != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <div>
              <h3 className="font-bold text-foreground">Đánh giá dịch vụ</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Chọn số sao và chia sẻ cảm nhận của bạn về thợ.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  aria-label={`${star} sao`}
                >
                  <Star
                    className={`w-8 h-8 ${star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-gray-300 fill-gray-200"}`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full bg-muted rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              placeholder="VD: Thợ làm việc chuyên nghiệp, đúng giờ... (không bắt buộc)"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setReviewTarget(null)}
                disabled={reviewing}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold disabled:opacity-60"
              >
                Quay lại
              </button>
              <button
                onClick={confirmReview}
                disabled={reviewing}
                className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {reviewing && <Loader2 className="w-4 h-4 animate-spin" />}
                {reviewing ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
