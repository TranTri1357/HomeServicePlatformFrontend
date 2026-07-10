import { useState } from "react";
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
  Wallet,
  LogOut,
  ChevronRight,
  Loader2,
} from "lucide-react";
import type { Screen } from "@/shared/types";
import { customerApi } from "@/services/api";
import { useApi } from "@/shared/hooks";
import { useAuth } from "@/app/providers";
import { getAvatarUrl, notify, getErrorMessage } from "@/shared/lib";

const PHONE_REGEX = /^(03|05|07|08|09)\d{8}$/;

export function CustomerProfile({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { user, logout } = useAuth();
  const { data: profile, loading, error, refetch } = useApi(() => customerApi.getCustomerProfile());

  // Graceful fallbacks: show the auth name immediately, real data once loaded.
  const name = profile?.fullName || user?.fullName || "Khách hàng";
  const email = profile?.email || "";
  const phone = profile?.phone || "";
  const address = profile?.defaultAddress || "Chưa cập nhật địa chỉ";

  // Edit-profile modal state.
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const openEdit = () => {
    setEditName(profile?.fullName || user?.fullName || "");
    setEditPhone(profile?.phone || "");
    setEditError(null);
    setEditing(true);
  };

  const saveProfile = async () => {
    setEditError(null);
    if (!editName.trim()) return setEditError("Vui lòng nhập họ tên.");
    if (!PHONE_REGEX.test(editPhone.trim()))
      return setEditError("Số điện thoại không đúng định dạng di động Việt Nam (10 số).");

    setSaving(true);
    try {
      await customerApi.updateCustomerProfile({
        fullName: editName.trim(),
        phone: editPhone.trim(),
      });
      notify.success("Cập nhật hồ sơ thành công");
      setEditing(false);
      void refetch();
    } catch (err) {
      setEditError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const infoItems = [
    { label: "Họ tên", value: name, icon: User },
    { label: "Điện thoại", value: phone || "—", icon: Phone },
    { label: "Email", value: email || "—", icon: MessageCircle },
    { label: "Địa chỉ", value: address, icon: MapPin },
  ];

  const menuItems = [
    { label: "Ví của tôi", icon: Wallet, onClick: () => onNavigate("customerWallet") },
    { label: "Lịch sử đặt lịch", icon: BookOpen, onClick: () => onNavigate("bookingManagement") },
    { label: "Địa chỉ đã lưu", icon: MapPin, onClick: () => onNavigate("customerAddresses") },
    { label: "Thông báo", icon: Bell, onClick: () => onNavigate("notifications") },
    { label: "Bảo mật", icon: Shield, onClick: () => {} },
    { label: "Hỗ trợ khách hàng", icon: MessageCircle, onClick: () => {} },
  ];

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
                src={getAvatarUrl(name, 100)}
                alt={name}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30 bg-white/20"
              />
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow">
                <Camera className="w-3.5 h-3.5 text-blue-600" />
              </button>
            </div>
            <div className="min-w-0">
              <h3 className="text-white text-xl font-bold truncate">{name}</h3>
              {email && <p className="text-blue-200 text-sm truncate">{email}</p>}
              {phone && <p className="text-blue-200 text-sm">{phone}</p>}
            </div>
          </div>
        </div>

        <div className="px-4 -mt-6 space-y-4 pb-6">
          {/* Stats */}
          <div className="bg-white rounded-2xl p-4 shadow-sm grid grid-cols-2 divide-x divide-border">
            {[
              [profile?.totalBookingsCount, "Đã đặt"],
              [profile?.completedBookingsCount, "Hoàn thành"],
            ].map(([val, label]) => (
              <div key={label} className="flex flex-col items-center gap-1 px-3">
                <span className="text-2xl font-extrabold text-blue-600">
                  {loading && val == null ? "…" : (val ?? 0)}
                </span>
                <span className="text-xs text-muted-foreground text-center">{label}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-amber-50 border border-amber-100 text-amber-700 text-xs rounded-xl px-4 py-2.5">
              Không tải được hồ sơ mới nhất, đang hiển thị thông tin cơ bản.
            </div>
          )}

          {/* Personal Info */}
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-foreground">Thông tin cá nhân</h3>
              <button
                onClick={openEdit}
                className="text-blue-600 text-xs font-semibold flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                Chỉnh sửa
              </button>
            </div>
            {infoItems.map((item) => (
              <div
                key={item.label}
                className="px-4 py-3 flex items-center gap-3 border-b border-border last:border-0"
              >
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium text-foreground truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Menu Items */}
          {menuItems.map((item) => (
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

          <button
            onClick={logout}
            className="w-full bg-red-50 rounded-2xl px-4 py-3.5 flex items-center gap-3 hover:bg-red-100 transition-colors"
          >
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
              <LogOut className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-sm font-semibold text-red-600">Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Edit profile modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <h3 className="font-bold text-foreground">Chỉnh sửa hồ sơ</h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Họ tên</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Số điện thoại</label>
              <input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                inputMode="tel"
                className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0901234567"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Email</label>
              <input
                value={email}
                disabled
                className="w-full bg-slate-100 text-muted-foreground rounded-xl px-3 py-2.5 text-sm cursor-not-allowed"
              />
              <p className="text-[11px] text-muted-foreground">Email đăng nhập không thể thay đổi.</p>
            </div>

            {editError && (
              <div className="p-2.5 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
                {editError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                disabled={saving}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
