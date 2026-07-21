import { useState } from "react";
import {
  ChevronLeft,
  Heart,
  Share2,
  BookOpen,
  CheckCircle,
  Check,
  Star,
  Wrench,
  Clock,
  AlertCircle,
} from "lucide-react";
import type { Screen } from "@/shared/types";
import { serviceApi } from "@/services/api";
import { useGoBack } from "@/app/routes/useGoBack";
import { useApi } from "@/shared/hooks";
import { Avatar } from "@/shared/ui";
import { getApiAssetUrl, formatVnd } from "@/shared/lib";

export function ServiceDetail({
  onNavigate,
  data,
}: {
  onNavigate: (s: Screen, d?: object) => void;
  data?: { serviceId?: number };
}) {
  const serviceId = data?.serviceId;
  const goBack = useGoBack("serviceList");
  const [activeTab, setActiveTab] = useState("about");

  const {
    data: detail,
    loading,
    error,
    refetch,
  } = useApi(() => serviceApi.getServiceDetail(serviceId!), {
    immediate: Boolean(serviceId),
  });

  
  if (!serviceId) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm text-muted-foreground">Không xác định được dịch vụ.</p>
        <button
          onClick={() => onNavigate("serviceList")}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
        >
          Về danh sách dịch vụ
        </button>
      </div>
    );
  }

  if (loading && !detail) {
    return (
      <div className="flex flex-col h-full">
        <div className="h-52 bg-slate-200 animate-pulse" />
        <div className="p-4 space-y-4">
          <div className="h-8 w-1/3 bg-slate-200 rounded animate-pulse" />
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-40 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error && !detail) {
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
            onClick={() => onNavigate("serviceList")}
            className="px-4 py-2 border border-border rounded-xl text-sm font-semibold"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!detail) return null;

  const heroUrl = detail.imageUrl ? getApiAssetUrl(detail.imageUrl) : "";
  const taskers = detail.suggestedTaskers ?? [];

  return (
    <div className="flex flex-col h-full">
      {}
      <div className="relative flex-shrink-0">
        {heroUrl ? (
          <img src={heroUrl} alt={detail.name} className="w-full h-52 object-cover" />
        ) : (
          <div className="w-full h-52 bg-gradient-to-br from-blue-500 to-blue-800 flex items-center justify-center">
            <Wrench className="w-12 h-12 text-white/80" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button
          onClick={goBack}
          className="absolute top-4 left-4 w-9 h-9 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="w-9 h-9 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center">
            <Heart className="w-4 h-4 text-foreground" />
          </button>
          <button className="w-9 h-9 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center">
            <Share2 className="w-4 h-4 text-foreground" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4">
          <h1 className="text-white text-2xl font-bold">{detail.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <BookOpen className="w-4 h-4 text-blue-200" />
            <span className="text-white/90 text-sm">{detail.totalBookings} lượt đặt</span>
          </div>
        </div>
      </div>

      {}
      <div className="flex-1 overflow-y-auto bg-background">
        {}
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-border">
          <div>
            <span className="text-blue-600 text-2xl font-extrabold">
              từ {formatVnd(detail.startingPrice)}đ
            </span>
            <span className="text-muted-foreground text-sm">/lượt</span>
            <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">~{detail.durationMinutes} phút/lượt</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">Còn chỗ hôm nay</span>
          </div>
        </div>

        {}
        <div className="flex border-b border-border bg-white">
          {["about", "pricing", "reviews"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === t ? "text-blue-600 border-b-2 border-blue-600" : "text-muted-foreground"}`}
            >
              {t === "about" ? "Về dịch vụ" : t === "pricing" ? "Bảng giá" : "Đánh giá"}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-4">
          {activeTab === "about" && (
            <>
              <div className="bg-white rounded-2xl p-4">
                <h3 className="font-bold text-foreground mb-2">Mô tả dịch vụ</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {detail.description?.trim() ||
                    `Dịch vụ ${detail.name} được cung cấp bởi đội ngũ thợ có kinh nghiệm trên nền tảng.`}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-foreground">Bao gồm</h3>
                {[
                  "Kiểm tra và chẩn đoán miễn phí",
                  "Thợ có chứng chỉ chuyên môn",
                  "Bảo hành sau khi hoàn thành",
                  "Vật tư chính hãng",
                  "Dọn dẹp sau khi sửa",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              {}
              <div className="bg-white rounded-2xl p-4">
                <h3 className="font-bold text-foreground mb-3">Thợ gợi ý</h3>
                {taskers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Chưa có thợ nhận dịch vụ này. Bạn vẫn có thể đặt lịch, hệ thống sẽ tìm thợ phù
                    hợp.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {taskers.map((tech) => (
                      <button
                        key={tech.taskerId}
                        onClick={() => onNavigate("technicianDetail", { taskerId: tech.taskerId })}
                        className="w-full flex items-center gap-3 p-3 bg-muted rounded-xl hover:bg-accent transition-colors"
                      >
                        {tech.avatarUrl ? (
                          <img
                            src={getApiAssetUrl(tech.avatarUrl)}
                            alt={tech.fullName}
                            className="rounded-full object-cover"
                            style={{ width: 44, height: 44 }}
                          />
                        ) : (
                          <Avatar size={44} name={tech.fullName} />
                        )}
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-sm text-foreground">{tech.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {tech.experienceYears} năm kinh nghiệm
                            {tech.currentPrice > 0 && <> · từ {formatVnd(tech.currentPrice)}đ</>}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-bold">{tech.ratingAvg}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "pricing" && (
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="bg-blue-600 px-4 py-3">
                <h3 className="font-bold text-white">Giá theo từng thợ</h3>
              </div>
              {taskers.length === 0 ? (
                <div className="px-4 py-4 text-sm text-muted-foreground">
                  Chưa có thợ báo giá. Giá khởi điểm: từ {formatVnd(detail.startingPrice)}đ.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {taskers.map((tech) => (
                    <div
                      key={tech.taskerId}
                      className="flex justify-between items-center px-4 py-3"
                    >
                      <span className="text-sm text-foreground">{tech.fullName}</span>
                      <span className="text-sm font-bold text-blue-600">
                        {tech.currentPrice > 0 ? `${formatVnd(tech.currentPrice)}đ` : "Liên hệ"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="bg-white rounded-2xl p-6 text-center">
              <Star className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Đánh giá dịch vụ sẽ sớm được cập nhật.</p>
            </div>
          )}
        </div>
      </div>

      {}
      <div className="bg-white border-t border-border px-4 py-4 flex gap-3">
        <button
          onClick={() => onNavigate("technicianMap", { serviceId: detail.serviceId })}
          className="flex-1 py-3.5 border-2 border-blue-600 text-blue-600 rounded-xl font-bold text-sm hover:bg-accent transition-colors"
        >
          Tìm thợ gần đây
        </button>
        <button
          onClick={() => onNavigate("booking", { serviceId: detail.serviceId })}
          className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          Đặt lịch ngay
        </button>
      </div>
    </div>
  );
}
