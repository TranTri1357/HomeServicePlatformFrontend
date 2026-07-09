import {
  Settings,
  Camera,
  Edit3,
  User,
  Phone,
  MessageCircle,
  MapPin,
  BookOpen,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
} from "lucide-react";
import type { Screen } from "@/shared/types";

export function CustomerProfile({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="overflow-y-auto flex-1">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-4 pt-6 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl font-bold">Hồ sơ của tôi</h2>
            <button className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&auto=format"
                alt="avatar"
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30"
              />
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow">
                <Camera className="w-3.5 h-3.5 text-blue-600" />
              </button>
            </div>
            <div>
              <h3 className="text-white text-xl font-bold">Trần Minh Khoa</h3>
              <p className="text-blue-200 text-sm">khoa.tran@email.com</p>
              <p className="text-blue-200 text-sm">0901 234 567</p>
            </div>
          </div>
        </div>

        <div className="px-4 -mt-6 space-y-4 pb-6">
          {/* Stats */}
          <div className="bg-white rounded-2xl p-4 shadow-sm grid grid-cols-3 divide-x divide-border">
            {[
              ["12", "Đã đặt"],
              ["10", "Hoàn thành"],
              ["4.8", "Điểm TB"],
            ].map(([val, label]) => (
              <div key={label} className="flex flex-col items-center gap-1 px-3">
                <span className="text-2xl font-extrabold text-blue-600">{val}</span>
                <span className="text-xs text-muted-foreground text-center">{label}</span>
              </div>
            ))}
          </div>

          {/* Personal Info */}
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-foreground">Thông tin cá nhân</h3>
              <button className="text-blue-600 text-xs font-semibold flex items-center gap-1">
                <Edit3 className="w-3 h-3" />
                Chỉnh sửa
              </button>
            </div>
            {[
              {
                label: "Họ tên",
                value: "Trần Minh Khoa",
                icon: User,
              },
              {
                label: "Điện thoại",
                value: "0901 234 567",
                icon: Phone,
              },
              {
                label: "Email",
                value: "khoa.tran@email.com",
                icon: MessageCircle,
              },
              {
                label: "Địa chỉ",
                value: "123 Lê Lợi, Quận 1, TP.HCM",
                icon: MapPin,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="px-4 py-3 flex items-center gap-3 border-b border-border last:border-0"
              >
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Menu Items */}
          {[
            {
              label: "Lịch sử đặt lịch",
              icon: BookOpen,
              onClick: () => onNavigate("bookingManagement"),
            },
            {
              label: "Địa chỉ đã lưu",
              icon: MapPin,
              onClick: () => {},
            },
            {
              label: "Thông báo",
              icon: Bell,
              onClick: () => onNavigate("notifications"),
            },
            {
              label: "Bảo mật",
              icon: Shield,
              onClick: () => {},
            },
            {
              label: "Hỗ trợ khách hàng",
              icon: MessageCircle,
              onClick: () => {},
            },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="w-full bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 hover:bg-muted transition-colors"
            >
              <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-blue-600" />
              </div>
              <span className="flex-1 text-left text-sm font-semibold text-foreground">
                {item.label}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}

          <button className="w-full bg-red-50 rounded-2xl px-4 py-3.5 flex items-center gap-3 hover:bg-red-100 transition-colors">
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
              <LogOut className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-sm font-semibold text-red-600">Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
}
