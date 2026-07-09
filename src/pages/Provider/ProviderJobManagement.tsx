import { useState } from "react";
import {
  AlertCircle,
  MapPin,
  Phone,
  X,
  Check,
  MessageCircle,
  Navigation,
} from "lucide-react";
import type { Screen } from "@/shared/types";
import type { BookingStatus } from "@/shared/types";
import { providerJobs } from "@/services/Provider/provider.data";
import { bookings } from "@/services/Booking/booking.data";
import { Badge, TopBar } from "@/shared/ui";

export function ProviderJobManagement({
  onNavigate,
}: {
  onNavigate: (s: Screen) => void;
}) {
  const [activeTab, setActiveTab] = useState("incoming");

  const incomingRequests = [
    {
      id: "JR001",
      customer: "Nguyễn Thị D",
      service: "Sửa điện khẩn cấp",
      address: "45 Hai Bà Trưng, Q.3",
      time: "Ngay bây giờ",
      price: "350K–500K",
      phone: "0912345678",
      urgent: true,
    },
    {
      id: "JR002",
      customer: "Lê Văn F",
      service: "Kiểm tra điện",
      address: "100 CMT8, Q.10",
      time: "14:00 hôm nay",
      price: "150K–200K",
      phone: "0923456789",
      urgent: false,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Quản lý công việc"
        onBack={() => onNavigate("providerDashboard")}
      />

      <div className="flex border-b border-border bg-white">
        {["incoming", "active", "history"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === t ? "text-blue-600 border-b-2 border-blue-600" : "text-muted-foreground"}`}
          >
            {t === "incoming"
              ? "Yêu cầu mới"
              : t === "active"
                ? "Đang làm"
                : "Lịch sử"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === "incoming" &&
          incomingRequests.map((req) => (
            <div
              key={req.id}
              className={`bg-white rounded-2xl overflow-hidden shadow-sm ${req.urgent ? "ring-2 ring-red-400" : ""}`}
            >
              {req.urgent && (
                <div className="bg-red-500 px-4 py-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-white" />
                  <span className="text-white text-xs font-bold">
                    KHẨN CẤP
                  </span>
                </div>
              )}
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold text-foreground">
                      {req.service}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {req.customer} · {req.time}
                    </p>
                  </div>
                  <span className="text-green-600 font-bold text-sm">
                    {req.price}đ
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{req.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{req.phone}</span>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm flex items-center justify-center gap-1">
                    <X className="w-4 h-4" />
                    Từ chối
                  </button>
                  <button
                    onClick={() =>
                      onNavigate("providerJobSheet")
                    }
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Chấp nhận
                  </button>
                </div>
              </div>
            </div>
          ))}

        {activeTab === "active" &&
          providerJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-4 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-foreground">
                    {job.service}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {job.customer} · {job.time}
                  </p>
                </div>
                <Badge
                  status={
                    job.status as BookingStatus
                  }
                />
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {job.address}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onNavigate("providerChat")}
                  className="flex-1 py-2 bg-muted rounded-xl text-sm font-semibold flex items-center justify-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Chat
                </button>
                <button className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1">
                  <Navigation className="w-3.5 h-3.5" />
                  Dẫn đường
                </button>
              </div>
            </div>
          ))}

        {activeTab === "history" &&
          bookings
            .filter((b) => b.status === "completed")
            .map((bk) => (
              <div
                key={bk.id}
                className="bg-white rounded-2xl p-4 shadow-sm"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold text-sm">
                      {bk.service}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {bk.date} · {bk.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {bk.price}đ
                    </p>
                    <Badge status="completed" />
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}

