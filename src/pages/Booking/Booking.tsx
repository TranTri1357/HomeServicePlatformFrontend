import { useState } from "react";
import { Zap, MapPin, Star } from "lucide-react";
import type { Screen } from "@/shared/types";
import { technicians } from "@/services/Technician/technician.data";
import { TopBar, Avatar } from "@/shared/ui";

export function Booking({
  onNavigate,
}: {
  onNavigate: (s: Screen, d?: object) => void;
}) {
  const [date, setDate] = useState("20");
  const [time, setTime] = useState("09:00");
  const [notes, setNotes] = useState("");
  const [selectedTech, setSelectedTech] = useState(
    technicians[0],
  );
  const dates = ["19", "20", "21", "22", "23", "24", "25"];
  const days = ["T5", "T6", "T7", "CN", "T2", "T3", "T4"];
  const times = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
  ];

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Đặt lịch dịch vụ"
        onBack={() => onNavigate("serviceDetail")}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Selected Service */}
        <div className="bg-white rounded-2xl p-4 flex gap-3">
          <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap className="w-7 h-7 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground">
              Sửa chữa điện
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Kiểm tra + sửa chữa cơ bản
            </p>
            <p className="text-blue-600 font-bold text-sm mt-1">
              150,000đ – 350,000đ
            </p>
          </div>
          <button className="text-blue-600 text-xs font-semibold">
            Đổi
          </button>
        </div>

        {/* Selected Technician (read-only) */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-3">
            Thợ được chọn
          </h3>
          <div className="flex items-center gap-3 p-3 bg-accent rounded-xl border-2 border-blue-600">
            <div className="relative">
              <Avatar
                src={selectedTech.avatar}
                size={44}
                name={selectedTech.name}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-foreground">
                {selectedTech.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedTech.skill} · {selectedTech.distance}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold">
                {selectedTech.rating}
              </span>
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-3">
            Chọn ngày
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {dates.map((d, i) => (
              <button
                key={d}
                onClick={() => setDate(d)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 w-14 py-3 rounded-xl transition-colors ${date === d ? "bg-blue-600 text-white" : "bg-muted text-foreground"}`}
              >
                <span
                  className={`text-[11px] font-medium ${date === d ? "text-blue-200" : "text-muted-foreground"}`}
                >
                  {days[i]}
                </span>
                <span className="text-base font-bold">{d}</span>
                <span
                  className={`text-[10px] ${date === d ? "text-blue-200" : "text-muted-foreground"}`}
                >
                  Th6
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Time */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-3">
            Chọn giờ
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {times.map((t) => (
              <button
                key={t}
                onClick={() => setTime(t)}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-colors ${time === t ? "bg-blue-600 text-white" : "bg-muted text-foreground hover:bg-accent"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-3">
            Địa chỉ
          </h3>
          <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
            <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-sm text-foreground flex-1">
              123 Lê Lợi, Quận 1, TP.HCM
            </span>
            <button className="text-blue-600 text-xs font-semibold">
              Đổi
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-2">
            Ghi chú cho thợ
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-muted rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            rows={3}
            placeholder="VD: Chuông cửa tầng 3, ưu tiên đến trước 10h..."
          />
        </div>

        {/* Cost Summary */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-3">
            Tóm tắt chi phí
          </h3>
          <div className="space-y-2">
            {[
              {
                label: "Phí dịch vụ cơ bản",
                value: "150,000đ",
              },
              { label: "Phí kiểm tra", value: "50,000đ" },
              {
                label: "Giảm giá thành viên",
                value: "-20,000đ",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between text-sm"
              >
                <span className="text-muted-foreground">
                  {item.label}
                </span>
                <span
                  className={`font-semibold ${item.value.startsWith("-") ? "text-green-600" : "text-foreground"}`}
                >
                  {item.value}
                </span>
              </div>
            ))}
            <div className="h-px bg-border my-1" />
            <div className="flex justify-between">
              <span className="font-bold text-foreground">
                Tổng cộng
              </span>
              <span className="font-extrabold text-blue-600 text-lg">
                180,000đ
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-border px-4 py-4">
        <button
          onClick={() => onNavigate("payment")}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-base hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 active:scale-[0.98]"
        >
          Xác nhận đặt lịch →
        </button>
      </div>
    </div>
  );
}

