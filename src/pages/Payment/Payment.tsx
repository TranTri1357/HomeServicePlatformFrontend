import { useState } from "react";
import {
  CheckCircle,
  DollarSign,
  Building2,
  CreditCard,
  Wallet,
  Check,
  Zap,
} from "lucide-react";
import type { Screen } from "@/shared/types";
import { TopBar } from "@/shared/ui";

export function Payment({
  onNavigate,
}: {
  onNavigate: (s: Screen, d?: object) => void;
}) {
  const [method, setMethod] = useState("cash");
  const [success, setSuccess] = useState(false);

  const methods = [
    {
      id: "cash",
      label: "Tiền mặt",
      icon: DollarSign,
      desc: "Thanh toán khi hoàn thành",
    },
    {
      id: "bank",
      label: "Chuyển khoản",
      icon: Building2,
      desc: "VCB · MBBank · Techcombank",
    },
    {
      id: "card",
      label: "Thẻ tín dụng",
      icon: CreditCard,
      desc: "Visa · Mastercard · JCB",
    },
    {
      id: "wallet",
      label: "Ví điện tử",
      icon: Wallet,
      desc: "MoMo · ZaloPay · VNPay",
    },
  ];

  if (success) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 bg-background">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-foreground mb-2">
          Đặt lịch thành công!
        </h2>
        <p className="text-muted-foreground text-center mb-2">
          Mã đặt lịch:{" "}
          <span className="font-bold text-foreground">
            #BK00{Math.floor(Math.random() * 900) + 100}
          </span>
        </p>
        <p className="text-muted-foreground text-center text-sm mb-8">
          Thợ sẽ liên hệ xác nhận trong 5 phút. Bạn có thể theo
          dõi tiến trình trong Lịch sử đặt lịch.
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
      <TopBar
        title="Thanh toán"
        onBack={() => onNavigate("booking")}
      />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-3">
            Tóm tắt đơn hàng
          </h3>
          <div className="flex items-start gap-3 pb-3 border-b border-border mb-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-foreground">
                Sửa chữa điện
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Thợ: Nguyễn Văn An
              </p>
              <p className="text-xs text-muted-foreground">
                20/06/2026, 09:00 · 123 Lê Lợi, Q.1
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            {[
              ["Phí dịch vụ", "150,000đ"],
              ["Phí kiểm tra", "50,000đ"],
              ["Giảm giá", "-20,000đ"],
            ].map(([l, v]) => (
              <div
                key={l}
                className="flex justify-between text-sm"
              >
                <span className="text-muted-foreground">
                  {l}
                </span>
                <span
                  className={`font-semibold ${v.startsWith("-") ? "text-green-600" : ""}`}
                >
                  {v}
                </span>
              </div>
            ))}
            <div className="h-px bg-border mt-2 mb-2" />
            <div className="flex justify-between">
              <span className="font-bold text-foreground">
                Tổng thanh toán
              </span>
              <span className="font-extrabold text-blue-600 text-xl">
                180,000đ
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-3">
            Phương thức thanh toán
          </h3>
          <div className="space-y-2">
            {methods.map((m) => (
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
                  <p className="text-xs text-muted-foreground">
                    {m.desc}
                  </p>
                </div>
                {method === m.id && (
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Card Form */}
        {method === "card" && (
          <div className="bg-white rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-foreground">
              Thông tin thẻ
            </h3>
            <input
              className="w-full bg-muted px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Số thẻ"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className="bg-muted px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="MM/YY"
              />
              <input
                className="bg-muted px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="CVV"
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border-t border-border px-4 py-4">
        <button
          onClick={() => setSuccess(true)}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-base hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          Thanh toán 180,000đ
        </button>
      </div>
    </div>
  );
}

