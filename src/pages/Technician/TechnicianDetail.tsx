import { useState } from "react";
import {
  ChevronLeft,
  Shield,
  Star,
  Briefcase,
  Award,
  AlertCircle,
  Loader2,
  X,
  Wrench,
  ChevronRight,
} from "lucide-react";
import type { Screen, TaskerServiceOption } from "@/shared/types";
import { taskerApi } from "@/services/api";
import { useApi } from "@/shared/hooks";
import { Avatar } from "@/shared/ui";
import { getApiAssetUrl, formatDateVn, formatVnd, getErrorMessage, notify } from "@/shared/lib";
import { useGoBack } from "@/app/routes/useGoBack";

export function TechnicianDetail({
  onNavigate,
  data,
}: {
  onNavigate: (s: Screen, d?: object) => void;
  data?: { taskerId?: number };
}) {
  const taskerId = data?.taskerId;
  const goBack = useGoBack("customerHome");

  
  const [pickerOpen, setPickerOpen] = useState(false);
  const [services, setServices] = useState<TaskerServiceOption[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  const openPicker = async () => {
    setPickerOpen(true);
    if (services.length > 0 || !taskerId) return;
    setLoadingServices(true);
    try {
      setServices(await taskerApi.getTaskerServiceOptions(taskerId));
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setLoadingServices(false);
    }
  };

  const {
    data: tech,
    loading,
    error,
    refetch,
  } = useApi(() => taskerApi.getTaskerDetail(taskerId!), {
    immediate: Boolean(taskerId),
  });

  
  if (!taskerId) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm text-muted-foreground">Không xác định được thợ.</p>
        <button
          onClick={() => onNavigate("customerHome")}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  if (loading && !tech) {
    return (
      <div className="flex flex-col h-full">
        <div className="h-40 bg-slate-200 animate-pulse" />
        <div className="p-4 space-y-4">
          <div className="h-20 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-40 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error && !tech) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <div className="flex gap-2">
          <button
            onClick={() => void refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
          >
            Thử lại
          </button>
          <button
            onClick={() => onNavigate("customerHome")}
            className="px-4 py-2 border border-border rounded-xl text-sm font-semibold"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!tech) return null;

  const avatarUrl = tech.avatarUrl ? getApiAssetUrl(tech.avatarUrl) : undefined;
  const subtitle = tech.skills[0] ?? "Thợ dịch vụ";
  const firstName = tech.fullName.split(" ").slice(-1)[0];

  
  const s = tech.reviewSummary;
  const totalRatings =
    s.fiveStarCount + s.fourStarCount + s.threeStarCount + s.twoStarCount + s.oneStarCount;
  const ratingBars: [number, number][] = [
    [5, s.fiveStarCount],
    [4, s.fourStarCount],
    [3, s.threeStarCount],
    [2, s.twoStarCount],
    [1, s.oneStarCount],
  ].map(([star, count]) => [star, totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0]);

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto">
        {}
        <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 px-4 pt-6 pb-16">
          <button
            onClick={goBack}
            className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-4"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-start gap-4">
            <Avatar src={avatarUrl} size={80} name={tech.fullName} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-white text-xl font-bold">{tech.fullName}</h2>
                {tech.isVerified && <Shield className="w-4 h-4 text-green-400" />}
              </div>
              <p className="text-blue-200 text-sm">{subtitle}</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-white font-bold text-sm">{tech.ratingAvg}</span>
                </div>
                <span className="text-blue-200 text-sm">{tech.totalJobs} công việc</span>
                <span className="text-blue-200 text-sm">{tech.experienceYears} năm KN</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 -mt-8 space-y-4 pb-4">
          {}
          <div className="bg-white rounded-2xl p-4 shadow-sm grid grid-cols-3 divide-x divide-border">
            {[
              { label: "Đánh giá", value: `${tech.ratingAvg}`, icon: Star },
              { label: "Công việc", value: `${tech.totalJobs}`, icon: Briefcase },
              {
                label: "Kinh nghiệm",
                value: `${tech.experienceYears} năm`,
                icon: Award,
              },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1 px-2">
                <stat.icon className="w-4 h-4 text-blue-600" />
                <span className="text-lg font-extrabold text-foreground">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>

          {}
          {tech.bio?.trim() && (
            <div className="bg-white rounded-2xl p-4">
              <h3 className="font-bold text-foreground mb-2">Giới thiệu</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{tech.bio}</p>
            </div>
          )}

          {}
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-bold text-foreground mb-3">Kỹ năng chuyên môn</h3>
            {tech.skills.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa cập nhật kỹ năng.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tech.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-accent text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {}
          {tech.certificates.length > 0 && (
            <div className="bg-white rounded-2xl p-4">
              <h3 className="font-bold text-foreground mb-3">Chứng chỉ</h3>
              <div className="space-y-2">
                {tech.certificates.map((cert) => (
                  <div key={cert} className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-foreground">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {}
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground">Đánh giá của khách hàng</h3>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-foreground">{tech.ratingAvg}</span>
                <span className="text-xs text-muted-foreground">({tech.totalReviews} đánh giá)</span>
              </div>
            </div>

            {totalRatings > 0 && (
              <div className="space-y-1.5 mb-4">
                {ratingBars.map(([star, pct]) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-3">{star}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-7 text-right">{pct}%</span>
                  </div>
                ))}
              </div>
            )}

            {tech.recentReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có đánh giá nào.</p>
            ) : (
              <div className="space-y-3">
                {tech.recentReviews.map((r) => (
                  <div
                    key={r.reviewId}
                    className="border-t border-border pt-3 first:border-0 first:pt-0"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                          {r.customerName.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {r.customerName}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${star <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-xs text-muted-foreground">{r.comment}</p>}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatDateVn(r.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {}
      <div className="bg-white border-t border-border px-4 py-4 flex gap-3">
        <button
          onClick={openPicker}
          className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          Đặt lịch với {firstName}
        </button>
      </div>

      {}
      {pickerOpen && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end">
          <button
            aria-label="Đóng"
            onClick={() => setPickerOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative bg-white rounded-t-3xl max-h-[75%] flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
              <div>
                <h3 className="font-bold text-foreground">Chọn dịch vụ của {firstName}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Chọn dịch vụ để tiếp tục đặt lịch với thợ này.
                </p>
              </div>
              <button
                onClick={() => setPickerOpen(false)}
                className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loadingServices ? (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-8">
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang tải dịch vụ...
                </div>
              ) : services.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Thợ này chưa cấu hình dịch vụ nào.
                </p>
              ) : (
                services.map((svc) => (
                  <button
                    key={svc.serviceId}
                    onClick={() =>
                      onNavigate("booking", { serviceId: svc.serviceId, taskerId: tech.taskerId })
                    }
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-accent transition-colors text-left"
                  >
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {svc.serviceName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {svc.categoryName} · ~{svc.durationMinutes} phút
                      </p>
                      <p className="text-blue-600 font-bold text-sm mt-0.5">
                        {formatVnd(svc.price)}đ
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
