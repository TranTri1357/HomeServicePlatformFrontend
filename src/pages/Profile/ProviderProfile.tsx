import {
  Star,
  Phone,
  MessageCircle,
  User,
  BadgeCheck,
  LogOut,
  AlertCircle,
} from "lucide-react";
import type { Screen } from "@/shared/types";
import { taskerApi } from "@/services/api";
import { useApi } from "@/shared/hooks";
import { useAuth } from "@/app/providers";
import { Avatar } from "@/shared/ui";

export function ProviderProfile(_props: { onNavigate: (s: Screen) => void }) {
  const { user, logout } = useAuth();
  const taskerId = user?.userId;

  const { data: profile, loading, error, refetch } = useApi(
    () => taskerApi.getMyTaskerProfile(taskerId!),
    { immediate: Boolean(taskerId) },
  );

  const name = profile?.fullName || user?.fullName || "Thợ";
  const isOnline = profile?.status === 1;

  const stats: [string, string][] = [
    [`${profile?.ratingAvg ?? 0}`, "Đánh giá"],
    [`${profile?.completedJobsCount ?? 0}`, "Công việc"],
    [`${profile?.experienceYears ?? 0} năm`, "Kinh nghiệm"],
  ];

  const infoItems = [
    { label: "Họ tên", value: name, icon: User },
    { label: "Điện thoại", value: profile?.phone || "—", icon: Phone },
    { label: "Email", value: profile?.email || "—", icon: MessageCircle },
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
            {isOnline ? "Đang nhận việc" : "Tạm nghỉ"}
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
        {error && !profile && (
          <div className="bg-white rounded-2xl p-4 flex flex-col items-center gap-3 text-center shadow-sm">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => void refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
            >
              Thử lại
            </button>
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
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-bold text-foreground">Thông tin cá nhân</h3>
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
                <p className="text-sm font-medium text-foreground truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

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
    </div>
  );
}
