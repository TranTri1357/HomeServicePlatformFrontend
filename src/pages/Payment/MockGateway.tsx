import { useState } from "react";
import { QrCode, ShieldCheck, Loader2, AlertCircle, X } from "lucide-react";
import type { Screen, TopUpMethodCode } from "@/shared/types";
import { paymentApi, walletApi } from "@/services/api";
import { formatVnd, notify, getErrorMessage } from "@/shared/lib";

type Provider = "momo" | "zalopay";

/**
 * "booking" — xác nhận khoản thanh toán đơn đã tạo sẵn (đóng vai IPN của cổng).
 * "topup"   — nạp ví: chưa có bản ghi nào ở backend, tiền chỉ được cộng khi bấm xác nhận.
 */
type GatewayMode = "booking" | "topup";

const BRAND: Record<Provider, { name: string; color: string; text: string }> = {
  momo: { name: "MoMo", color: "#a50064", text: "text-white" },
  zalopay: { name: "ZaloPay", color: "#0068ff", text: "text-white" },
};

const METHOD_CODE: Record<Provider, TopUpMethodCode> = { momo: 3, zalopay: 4 };

export function MockGateway({
  onNavigate,
  data,
}: {
  onNavigate: (s: Screen, d?: object) => void;
  data?: {
    mode?: GatewayMode;
    paymentId?: number;
    bookingId?: number;
    amount?: number;
    provider?: Provider;
  };
}) {
  const mode: GatewayMode = data?.mode === "topup" ? "topup" : "booking";
  const paymentId = data?.paymentId;
  const amount = data?.amount ?? 0;
  const provider: Provider = data?.provider === "zalopay" ? "zalopay" : "momo";
  const brand = BRAND[provider];

  const isTopUp = mode === "topup";
  const returnScreen: Screen = isTopUp ? "customerWallet" : "bookingManagement";

  const [busy, setBusy] = useState<"none" | "pay" | "cancel">("none");

  // Nạp ví thì chưa có paymentId (chưa có gì ở backend), chỉ cần số tiền hợp lệ.
  const invalid = isTopUp ? amount <= 0 : !paymentId;

  if (invalid) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm text-muted-foreground">
          {isTopUp
            ? "Không xác định được số tiền cần nạp."
            : "Không xác định được giao dịch thanh toán."}
        </p>
        <button
          onClick={() => onNavigate(returnScreen)}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
        >
          {isTopUp ? "Về ví của tôi" : "Về lịch đặt"}
        </button>
      </div>
    );
  }

  const handlePay = async () => {
    setBusy("pay");
    try {
      if (isTopUp) {
        // Đây là lần gọi backend DUY NHẤT của luồng nạp: tiền vào ví ngay tại đây.
        const newBalance = await walletApi.topUpWallet({
          amount,
          method: METHOD_CODE[provider],
        });
        notify.success(`Nạp ${formatVnd(amount)}đ qua ${brand.name} thành công! Số dư: ${formatVnd(newBalance)}đ`);
      } else {
        await paymentApi.confirmMockPayment(paymentId!, true);
        notify.success(`Thanh toán ${brand.name} thành công!`);
      }
      onNavigate(returnScreen);
    } catch (err) {
      notify.error(getErrorMessage(err));
      setBusy("none");
    }
  };

  const handleCancel = async () => {
    setBusy("cancel");
    try {
      if (isTopUp) {
        // Chưa có giao dịch nào ở backend nên hủy chỉ là quay lại màn ví.
        notify.info("Đã hủy giao dịch nạp tiền.");
      } else {
        await paymentApi.confirmMockPayment(paymentId!, false);
        // Đơn đã được tạo ở trạng thái Chờ; hủy thanh toán thì về xem lịch đặt.
        notify.info("Đã hủy giao dịch. Đơn của bạn đang chờ thanh toán.");
      }
      onNavigate(returnScreen);
    } catch (err) {
      notify.error(getErrorMessage(err));
      setBusy("none");
    }
  };

  const disabled = busy !== "none";

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Gateway brand header */}
      <div className="px-4 py-4 flex items-center justify-between" style={{ background: brand.color }}>
        <div className={`flex items-center gap-2 font-extrabold text-lg ${brand.text}`}>
          <ShieldCheck className="w-5 h-5" />
          Cổng {brand.name}
        </div>
        <button
          onClick={handleCancel}
          disabled={disabled}
          className={`${brand.text} opacity-90 disabled:opacity-50`}
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        <span className="mt-2 inline-block px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold">
          MÔI TRƯỜNG GIẢ LẬP – DEMO
        </span>

        <p className="mt-6 text-sm text-muted-foreground">
          {isTopUp ? "Số tiền nạp vào ví" : "Số tiền cần thanh toán"}
        </p>
        <p className="text-3xl font-extrabold" style={{ color: brand.color }}>
          {formatVnd(amount)}đ
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {isTopUp ? "Giao dịch nạp ví" : `Mã giao dịch: MOCK${paymentId}`}
        </p>

        {/* Fake QR */}
        <div className="mt-6 w-52 h-52 rounded-2xl border-2 border-dashed border-border bg-white flex items-center justify-center">
          <QrCode className="w-28 h-28 text-foreground/80" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground text-center max-w-xs">
          Đây là cổng thanh toán mô phỏng cho đồ án. Bấm “Tôi đã thanh toán” để giả lập việc cổng xác
          nhận đã nhận tiền.
        </p>
      </div>

      {/* Actions */}
      <div className="bg-white border-t border-border px-4 py-4 space-y-2">
        <button
          onClick={handlePay}
          disabled={disabled}
          className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-70"
          style={{ background: brand.color }}
        >
          {busy === "pay" && <Loader2 className="w-5 h-5 animate-spin" />}
          {busy === "pay" ? "Đang xác nhận..." : "Tôi đã thanh toán"}
        </button>
        <button
          onClick={handleCancel}
          disabled={disabled}
          className="w-full py-3 rounded-xl font-semibold border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {busy === "cancel" && <Loader2 className="w-4 h-4 animate-spin" />}
          Hủy giao dịch
        </button>
      </div>
    </div>
  );
}
