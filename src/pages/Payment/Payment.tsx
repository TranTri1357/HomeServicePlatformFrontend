import { useState } from "react";
import {
  CheckCircle,
  Wallet,
  Smartphone,
  Check,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { Screen, PaymentMethodCode } from "@/shared/types";
import { paymentApi } from "@/services/api";
import { useGoBack } from "@/app/routes/useGoBack";
import { TopBar } from "@/shared/ui";
import { formatVnd, notify, getErrorMessage } from "@/shared/lib";

type PaymentMethodOption = {
  id: PaymentMethodCode;
  label: string;
  icon: typeof Wallet;
  desc: string;
};

// Ví (1) trừ số dư ngay; MoMo (3) & ZaloPay (4) qua cổng giả lập (demo, chưa có
// merchant credentials). Đã bỏ phương thức "Tiền mặt" theo yêu cầu nghiệp vụ.
const METHODS: PaymentMethodOption[] = [
  { id: 1, label: "Ví hệ thống", icon: Wallet, desc: "Trừ trực tiếp từ số dư ví, xác nhận ngay" },
  { id: 3, label: "MoMo", icon: Smartphone, desc: "Cổng giả lập (demo)" },
  { id: 4, label: "ZaloPay", icon: Smartphone, desc: "Cổng giả lập (demo)" },
];

const DEPOSIT_RATE = 0.3; // Đặt cọc 30%, phần còn lại trả tiền mặt khi hoàn thành.
type PayType = "deposit" | "full";

export function Payment({
  onNavigate,
  data,
}: {
  onNavigate: (s: Screen, d?: object) => void;
  data?: {
    // The order already exists (created as a "hold" at booking time, or an
    // earlier payment was cancelled). Payment only checks it out — never creates.
    bookingId?: number;
    finalAmount?: number;
  };
}) {
  const bookingId = data?.bookingId;
  const goBack = useGoBack("bookingManagement");

  const [method, setMethod] = useState<PaymentMethodCode>(1);
  const [payType, setPayType] = useState<PayType>("deposit");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ isPaid: boolean; bookingId: number } | null>(null);

  // ── No context (no order to pay — e.g. page refreshed) ──────────────────────
  if (bookingId == null) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm text-muted-foreground">
          Không có đơn cần thanh toán. Vui lòng đặt lịch lại.
        </p>
        <button
          onClick={() => onNavigate("customerHome")}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  const displayTotal = data?.finalAmount ?? 0;
  const depositAmount = Math.round(displayTotal * DEPOSIT_RATE);
  const displayPay = payType === "deposit" ? depositAmount : displayTotal;

  const availableMethods = METHODS;
  const selectPayType = (t: PayType) => setPayType(t);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      // Số tiền do SERVER tự tính từ FinalAmount (chống giả mạo); client chỉ báo full/deposit.
      // payAmount ở đây CHỈ để hiển thị / truyền sang màn cổng giả lập.
      const isDeposit = payType === "deposit";
      const payAmount = isDeposit ? Math.round(displayTotal * DEPOSIT_RATE) : displayTotal;
      const res = await paymentApi.checkout({ bookingId, isDeposit, method });

      // Simulated MoMo/ZaloPay: open the in-app mock gateway screen.
      if (paymentApi.isMockGatewayUrl(res.paymentUrl)) {
        onNavigate("mockGateway", {
          paymentId: res.paymentId,
          bookingId,
          amount: payAmount,
          provider: method === 4 ? "zalopay" : "momo",
        });
        return;
      }
      // A real third-party gateway would return an http(s) redirect URL.
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
        return;
      }

      setDone({ isPaid: res.isPaid, bookingId });
      notify.success(
        res.isPaid ? "Thanh toán thành công!" : "Đã ghi nhận đơn, thanh toán khi hoàn thành.",
      );
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success / recorded ────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 bg-background">
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${done.isPaid ? "bg-green-100" : "bg-amber-100"}`}
        >
          {done.isPaid ? (
            <CheckCircle className="w-12 h-12 text-green-600" />
          ) : (
            <Clock className="w-12 h-12 text-amber-600" />
          )}
        </div>
        <h2 className="text-2xl font-extrabold text-foreground mb-2">
          {done.isPaid ? "Thanh toán thành công!" : "Đã ghi nhận đơn!"}
        </h2>
        <p className="text-muted-foreground text-center mb-2">
          Mã đặt lịch: <span className="font-bold text-foreground">BK{done.bookingId}</span>
        </p>
        <p className="text-muted-foreground text-center text-sm mb-8">
          {payType === "deposit"
            ? "Bạn đã đặt cọc. Phần còn lại thanh toán tiền mặt cho thợ khi hoàn thành."
            : done.isPaid
              ? "Thợ sẽ liên hệ xác nhận sớm. Theo dõi tiến trình trong Lịch đặt của tôi."
              : "Bạn sẽ thanh toán tiền mặt cho thợ khi công việc hoàn thành."}
        </p>
        <div className="w-full space-y-3">
          <button
            onClick={() => onNavigate("bookingManagement")}
            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold"
          >
            Theo dõi đặt lịch
          </button>
          <button
            onClick={() => onNavigate("customerHome")}
            className="w-full py-3.5 border border-border text-foreground rounded-xl font-semibold hover:bg-muted transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Thanh toán" onBack={goBack} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Amount */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-3">Tóm tắt đơn hàng</h3>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Tổng giá trị đơn</span>
            <span className="font-semibold text-foreground">{formatVnd(displayTotal)}đ</span>
          </div>
          <div className="h-px bg-border my-3" />
          <div className="flex justify-between items-center">
            <span className="font-bold text-foreground">Cần thanh toán</span>
            <span className="font-extrabold text-blue-600 text-xl">{formatVnd(displayPay)}đ</span>
          </div>
        </div>

        {/* Deposit vs Full */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-3">Hình thức thanh toán</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => selectPayType("deposit")}
              className={`p-3 rounded-xl border-2 text-left transition-colors ${payType === "deposit" ? "border-blue-600 bg-accent" : "border-transparent bg-muted"}`}
            >
              <p
                className={`font-bold text-sm ${payType === "deposit" ? "text-blue-600" : "text-foreground"}`}
              >
                Đặt cọc 30%
              </p>
              <p className="text-lg font-extrabold text-foreground mt-1">
                {formatVnd(depositAmount)}đ
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Còn lại trả khi hoàn thành</p>
            </button>
            <button
              onClick={() => selectPayType("full")}
              className={`p-3 rounded-xl border-2 text-left transition-colors ${payType === "full" ? "border-blue-600 bg-accent" : "border-transparent bg-muted"}`}
            >
              <p
                className={`font-bold text-sm ${payType === "full" ? "text-blue-600" : "text-foreground"}`}
              >
                Trả hết
              </p>
              <p className="text-lg font-extrabold text-foreground mt-1">
                {formatVnd(displayTotal)}đ
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Thanh toán toàn bộ ngay</p>
            </button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-3">Phương thức thanh toán</h3>
          <div className="space-y-2">
            {availableMethods.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-colors ${method === m.id ? "border-blue-600 bg-accent" : "border-transparent bg-muted"}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${method === m.id ? "bg-blue-600" : "bg-white"}`}
                >
                  <m.icon
                    className={`w-5 h-5 ${method === m.id ? "text-white" : "text-foreground"}`}
                  />
                </div>
                <div className="flex-1 text-left">
                  <p
                    className={`font-semibold text-sm ${method === m.id ? "text-blue-600" : "text-foreground"}`}
                  >
                    {m.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
                {method === m.id && <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            MoMo / ZaloPay hiện chạy ở chế độ giả lập phục vụ demo, chưa trừ tiền thật.
          </p>
        </div>
      </div>

      <div className="bg-white border-t border-border px-4 py-4">
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="w-full py-4 bg-blue-600 disabled:opacity-70 text-white rounded-xl font-bold text-base hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
          {submitting
            ? "Đang xử lý..."
            : method === 1
              ? `Thanh toán ${formatVnd(displayPay)}đ`
              : "Tiếp tục thanh toán"}
        </button>
      </div>
    </div>
  );
}
