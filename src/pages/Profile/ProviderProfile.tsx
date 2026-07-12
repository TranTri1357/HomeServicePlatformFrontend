import { useState } from "react";
import {
  Star,
  Phone,
  MessageCircle,
  User,
  BadgeCheck,
  LogOut,
  AlertCircle,
  Edit3,
  FileText,
  MapPin,
  ChevronRight,
  Loader2,
} from "lucide-react";
import type { Screen } from "@/shared/types";
import { taskerApi } from "@/services/api";
import { useApi } from "@/shared/hooks";
import { useAuth } from "@/app/providers";
import { Avatar } from "@/shared/ui";
import { notify } from "@/shared/lib";

// Status → nhãn hiển thị (0 chờ duyệt · 1 nhận việc · 2 khóa · 3 tạm nghỉ).
const STATUS_LABEL: Record<number, { label: string; online: boolean }> = {
  0: { label: "Chờ duyệt", online: false },
  1: { label: "Đang nhận việc", online: true },
  2: { label: "Bị khóa", online: false },
  3: { label: "Tạm nghỉ", online: false },
};

// Toạ độ mặc định (trung tâm TP.HCM) khi không lấy được vị trí trình duyệt.
const DEFAULT_LAT = 10.7769;
const DEFAULT_LNG = 106.7009;

export function ProviderProfile({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { user, logout } = useAuth();
  const taskerId = user?.userId;

  const { data: profile, loading, error, refetch } = useApi(
    () => taskerApi.getMyTaskerProfile(taskerId!),
    { immediate: Boolean(taskerId) },
  );

  // ── Edit-account modal ──────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [fFullName, setFFullName] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fExp, setFExp] = useState(0);
  const [fBio, setFBio] = useState("");
  const [saving, setSaving] = useState(false);

  // ── Create-profile modal ────────────────────────────────────────────────
  const [creating, setCreating] = useState(false);
  const [cBio, setCBio] = useState("");
  const [cExp, setCExp] = useState(0);
  const [cLat, setCLat] = useState(DEFAULT_LAT);
  const [cLng, setCLng] = useState(DEFAULT_LNG);
  const [cLocating, setCLocating] = useState(false);
  const [cSubmitting, setCSubmitting] = useState(false);

  const name = profile?.fullName || user?.fullName || "Thợ";
  const st = STATUS_LABEL[profile?.status ?? 0] ?? STATUS_LABEL[0];
  const isOnline = st.online;

  const openEdit = () => {
    if (!profile) return;
    setFFullName(profile.fullName ?? "");
    setFPhone(profile.phone ?? "");
    setFExp(profile.experienceYears ?? 0);
    setFBio(profile.bio ?? "");
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!fFullName.trim()) return notify.error("Vui lòng nhập họ tên.");
    if (!/^(03|05|07|08|09)\d{8}$/.test(fPhone.trim()))
      return notify.error("Số điện thoại không đúng định dạng di động Việt Nam (10 số).");
    setSaving(true);
    try {
      await taskerApi.updateTaskerProfile({
        fullName: fFullName.trim(),
        phone: fPhone.trim(),
        bio: fBio.trim() || undefined,
        experienceYears: fExp,
      });
      notify.success("Cập nhật hồ sơ thành công.");
      setEditing(false);
      void refetch();
    } catch (err) {
      notify.error(err);
    } finally {
      setSaving(false);
    }
  };

  const locate = () => {
    if (!navigator.geolocation) return notify.error("Trình duyệt không hỗ trợ định vị.");
    setCLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCLat(Number(pos.coords.latitude.toFixed(6)));
        setCLng(Number(pos.coords.longitude.toFixed(6)));
        setCLocating(false);
        notify.success("Đã lấy vị trí hiện tại.");
      },
      () => {
        setCLocating(false);
        notify.error("Không lấy được vị trí. Đang dùng toạ độ mặc định.");
      },
    );
  };

  const submitCreate = async () => {
    if (!cBio.trim()) return notify.error("Vui lòng nhập giới thiệu bản thân.");
    setCSubmitting(true);
    try {
      await taskerApi.createTaskerProfile({
        bio: cBio.trim(),
        experienceYears: cExp,
        latitude: cLat,
        longitude: cLng,
      });
      notify.success("Đã gửi hồ sơ. Vui lòng chờ quản trị viên phê duyệt.");
      setCreating(false);
      void refetch();
    } catch (err) {
      notify.error(err);
    } finally {
      setCSubmitting(false);
    }
  };

  const stats: [string, string][] = [
    [`${profile?.ratingAvg ?? 0}`, "Đánh giá"],
    [`${profile?.completedJobsCount ?? 0}`, "Công việc"],
    [`${profile?.experienceYears ?? 0} năm`, "Kinh nghiệm"],
  ];

  const infoItems = [
    { label: "Họ tên", value: name, icon: User },
    { label: "Điện thoại", value: profile?.phone || "—", icon: Phone },
    { label: "Email", value: profile?.email || "—", icon: MessageCircle },
    { label: "Giới thiệu", value: profile?.bio || "—", icon: FileText },
    { label: "Tổng đánh giá", value: `${profile?.totalReviews ?? 0} lượt`, icon: Star },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-4 pt-6 pb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold">Hồ sơ thợ</h2>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isOnline ? "bg-green-500/20 text-green-300" : "bg-slate-600/40 text-slate-300"}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-400" : "bg-slate-400"}`} />
            {st.label}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Avatar size={80} name={name} />
          <div className="min-w-0">
            <h3 className="text-white text-xl font-bold truncate">{name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-white text-sm font-semibold">{profile?.ratingAvg ?? 0}</span>
              </div>
              <span className="text-slate-400 text-sm">
                {profile?.completedJobsCount ?? 0} công việc
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4 pb-6">
        {/* No profile yet / load error → offer create + retry */}
        {error && !profile && (
          <div className="bg-white rounded-2xl p-4 flex flex-col items-center gap-3 text-center shadow-sm">
            <AlertCircle className="w-8 h-8 text-amber-400" />
            <p className="text-sm text-muted-foreground">
              {error}. Nếu bạn chưa có hồ sơ thợ, hãy tạo hồ sơ để quản trị viên duyệt.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => void refetch()}
                className="px-4 py-2 border border-border rounded-xl text-sm font-semibold"
              >
                Thử lại
              </button>
              <button
                onClick={() => {
                  setCBio("");
                  setCExp(0);
                  setCLat(DEFAULT_LAT);
                  setCLng(DEFAULT_LNG);
                  setCreating(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
              >
                Tạo hồ sơ thợ
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="bg-white rounded-2xl p-4 shadow-sm grid grid-cols-3 divide-x divide-border">
          {stats.map(([v, l]) => (
            <div key={l} className="flex flex-col items-center gap-1 px-3">
              <span className="text-xl font-extrabold text-blue-600">
                {loading && !profile ? "…" : v}
              </span>
              <span className="text-xs text-muted-foreground">{l}</span>
            </div>
          ))}
        </div>

        {/* Personal info */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-foreground">Thông tin cá nhân</h3>
            {profile && (
              <button
                onClick={openEdit}
                className="text-blue-600 text-xs font-semibold flex items-center gap-1 hover:underline"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Chỉnh sửa
              </button>
            )}
          </div>
          {infoItems.map((item) => (
            <div
              key={item.label}
              className="px-4 py-3 flex items-center gap-3 border-b border-border last:border-0"
            >
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Địa chỉ hoạt động (Phương án B: dùng chung bảng Address) */}
        <button
          onClick={() => onNavigate("providerAddresses")}
          className="w-full bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 hover:bg-muted transition-colors"
        >
          <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-foreground">Địa chỉ hoạt động</p>
            <p className="text-xs text-muted-foreground">Khu vực nhận việc của bạn</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </button>

        {/* Verification note */}
        <div className="bg-blue-50 rounded-2xl px-4 py-3 flex items-center gap-3">
          <BadgeCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            Quản lý dịch vụ & giá, lịch làm việc ở các mục tương ứng trong ứng dụng.
          </p>
        </div>

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

      {/* Edit-account modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-foreground">Chỉnh sửa thông tin tài khoản</h3>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Họ tên</label>
              <input
                value={fFullName}
                onChange={(e) => setFFullName(e.target.value)}
                className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Số điện thoại</label>
              <input
                value={fPhone}
                onChange={(e) => setFPhone(e.target.value)}
                inputMode="tel"
                className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Số năm kinh nghiệm</label>
              <input
                type="number"
                min={0}
                value={fExp}
                onChange={(e) => setFExp(Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Giới thiệu</label>
              <textarea
                value={fBio}
                onChange={(e) => setFBio(e.target.value)}
                rows={3}
                maxLength={1000}
                className="w-full bg-muted rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="VD: 5 năm kinh nghiệm điện lạnh, làm việc cẩn thận..."
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setEditing(false)}
                disabled={saving}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold disabled:opacity-60"
              >
                Huỷ
              </button>
              <button
                onClick={saveEdit}
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

      {/* Create-profile modal */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-3 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="font-bold text-foreground">Tạo hồ sơ thợ</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Hồ sơ sẽ ở trạng thái chờ duyệt cho đến khi quản trị viên phê duyệt.
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Giới thiệu bản thân</label>
              <textarea
                value={cBio}
                onChange={(e) => setCBio(e.target.value)}
                rows={3}
                maxLength={1000}
                className="w-full bg-muted rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="VD: Thợ điện nước 5 năm kinh nghiệm khu vực Quận 1..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Số năm kinh nghiệm</label>
              <input
                type="number"
                min={0}
                value={cExp}
                onChange={(e) => setCExp(Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Vị trí làm việc</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">
                    {cLat.toFixed(4)}, {cLng.toFixed(4)}
                  </span>
                </div>
                <button
                  onClick={locate}
                  disabled={cLocating}
                  className="px-3 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold disabled:opacity-60 flex items-center gap-1"
                >
                  {cLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                  Vị trí hiện tại
                </button>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setCreating(false)}
                disabled={cSubmitting}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold disabled:opacity-60"
              >
                Huỷ
              </button>
              <button
                onClick={submitCreate}
                disabled={cSubmitting}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {cSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {cSubmitting ? "Đang gửi..." : "Gửi hồ sơ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
