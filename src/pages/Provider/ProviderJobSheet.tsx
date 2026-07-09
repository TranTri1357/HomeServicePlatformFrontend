import { useState, useEffect } from "react";
import {
  CheckCircle,
  X,
  Check,
  AlertCircle,
  MessageCircle,
  Navigation,
  MapPin,
  Phone,
  Clock,
  DollarSign,
} from "lucide-react";
import type { Screen } from "@/shared/types";

export function ProviderJobSheet({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [countdown, setCountdown] = useState(30);
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    if (accepted !== null || countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown, accepted]);

  useEffect(() => {
    if (countdown === 0 && accepted === null) setAccepted(false);
  }, [countdown, accepted]);

  const progress = (countdown / 30) * 100;
  const color = countdown > 15 ? "#2563EB" : countdown > 7 ? "#F59E0B" : "#EF4444";

  if (accepted === true) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 bg-background space-y-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-xl font-extrabold text-foreground">Đã nhận công việc!</h2>
        <p className="text-muted-foreground text-center text-sm">
          Vui lòng đến địa chỉ khách hàng trong thời gian sớm nhất.
        </p>
        <div className="w-full bg-white rounded-2xl p-4 shadow-sm space-y-2">
          <p className="font-semibold text-sm">
            <span className="text-muted-foreground">Khách hàng:</span> Hoàng Văn E
          </p>
          <p className="font-semibold text-sm">
            <span className="text-muted-foreground">Dịch vụ:</span> Sửa điện khẩn cấp
          </p>
          <p className="font-semibold text-sm">
            <span className="text-muted-foreground">Địa chỉ:</span> 123 Lê Lợi, Q.1
          </p>
          <p className="font-semibold text-sm">
            <span className="text-muted-foreground">SĐT:</span> 0901 234 567
          </p>
        </div>
        <div className="w-full grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate("providerChat")}
            className="py-3 bg-muted text-foreground rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Chat
          </button>
          <button className="py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
            <Navigation className="w-4 h-4" />
            Dẫn đường
          </button>
        </div>
        <button
          onClick={() => onNavigate("providerDashboard")}
          className="text-muted-foreground text-sm"
        >
          ← Về bảng điều khiển
        </button>
      </div>
    );
  }

  if (accepted === false) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 bg-background space-y-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <X className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Đã từ chối / Hết thời gian</h2>
        <button
          onClick={() => onNavigate("providerDashboard")}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold"
        >
          ← Về bảng điều khiển
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Urgent header */}
      <div className="bg-red-600 px-4 py-3 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-white animate-pulse" />
        <span className="text-white font-bold text-sm">YÊU CẦU KHẨN CẤP MỚI!</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Countdown */}
        <div className="bg-white rounded-2xl p-6 flex flex-col items-center shadow-sm">
          <p className="text-muted-foreground text-sm mb-4 font-medium">Thời gian phản hồi</p>
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#E2E8F0" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={color}
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-extrabold" style={{ color }}>
                {countdown}
              </span>
              <span className="text-xs text-muted-foreground font-medium">giây</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Chấp nhận hoặc từ chối trước khi hết giờ
          </p>
        </div>

        {/* Job Details */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 px-4 py-3">
            <span className="text-white text-xs font-bold bg-white/20 px-2 py-1 rounded-full">
              KHẨN CẤP
            </span>
            <h3 className="text-white text-lg font-extrabold mt-1">Sửa điện khẩn cấp</h3>
            <p className="text-white/80 text-sm">Mất điện toàn bộ tầng 3</p>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop"
                  alt="customer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">Hoàng Văn E</p>
                <p className="text-xs text-muted-foreground">Khách hàng xác minh ⭐4.8</p>
              </div>
            </div>

            {[
              {
                icon: MapPin,
                label: "Địa chỉ",
                value: "123 Lê Lợi, Phường Bến Nghé, Q.1, TP.HCM",
              },
              {
                icon: Phone,
                label: "Điện thoại",
                value: "0901 234 567",
              },
              {
                icon: Clock,
                label: "Thời gian",
                value: "Ngay bây giờ · 09:15 AM",
              },
              {
                icon: DollarSign,
                label: "Giá ước tính",
                value: "350,000 – 600,000đ",
              },
              {
                icon: Navigation,
                label: "Khoảng cách",
                value: "0.8 km · ~5 phút lái xe",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-semibold text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map preview */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm h-32 relative">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(37,99,235,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.06) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              backgroundColor: "#EEF2FF",
            }}
          />
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <path d="M0,60 Q100,55 200,65 T400,60" stroke="white" strokeWidth="8" fill="none" />
            <path d="M180,0 Q185,60 175,120" stroke="white" strokeWidth="6" fill="none" />
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow" />
          </div>
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow" />
          </div>
          <div className="absolute bottom-2 right-2">
            <button className="bg-white shadow rounded-lg px-3 py-1.5 text-xs font-bold text-blue-600 flex items-center gap-1">
              <Navigation className="w-3 h-3" />
              Chỉ đường
            </button>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="bg-white border-t border-border px-4 py-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => setAccepted(false)}
          className="py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2"
        >
          <X className="w-5 h-5" />
          Từ chối
        </button>
        <button
          onClick={() => setAccepted(true)}
          className="py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-200"
        >
          <Check className="w-5 h-5" />
          Chấp nhận
        </button>
      </div>
    </div>
  );
}
