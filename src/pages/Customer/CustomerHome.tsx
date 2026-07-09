import { useEffect, useState } from "react";
import {
  MapPin,
  Search,
  Star,
  ChevronDown,
  ChevronRight,
  BookOpen,
  LayoutGrid,
  BadgeCheck,
  Sparkles,
  Loader2,
  X,
  Wrench,
} from "lucide-react";
import type { Screen } from "@/shared/types";
import { categoryApi, serviceApi, taskerApi, searchApi } from "@/services/api";
import { useApi } from "@/shared/hooks";
import { Avatar } from "@/shared/ui";
import { getApiAssetUrl, getUnsplashUrl, formatVnd } from "@/shared/lib";

// Mock fallback so the UI keeps rendering while backend endpoints are wired up.
import { categories as mockCategories } from "@/services/Service/category.data";
import { topTaskers as mockTopTaskers } from "@/services/Technician/tasker.data";
import { popularServices as mockPopularServices } from "@/services/Service/popular.data";

/** Category thumbnail with a graceful fallback when the image is missing/broken. */
function CategoryIcon({ iconUrl, name }: { iconUrl: string; name: string }) {
  const [broken, setBroken] = useState(false);
  const url = iconUrl ? getApiAssetUrl(iconUrl) : "";
  if (!url || broken) {
    return <LayoutGrid className="w-6 h-6 text-blue-600" />;
  }
  return (
    <img src={url} alt={name} className="w-7 h-7 object-contain" onError={() => setBroken(true)} />
  );
}

export function CustomerHome({ onNavigate }: { onNavigate: (s: Screen, data?: object) => void }) {
  // Reference example for teammates: fetch each resource through `useApi`.
  // `initialData` seeds the mock so the screen never flashes empty, and on an
  // API error the hook keeps the last value (the mock) while exposing `error`.
  //
  // Service categories — GET /api/Categories/active (real endpoint).
  const { data: categories = mockCategories, loading: loadingCategories } = useApi(
    () => categoryApi.getActiveCategories(),
    { initialData: mockCategories },
  );
  // Featured taskers — GET /api/Taskers/top (real endpoint).
  const { data: taskers = mockTopTaskers, loading: loadingTaskers } = useApi(
    () => taskerApi.getTopTaskers({ limit: 10 }),
    { initialData: mockTopTaskers },
  );
  // Popular services — GET /api/Services/popular (real endpoint).
  const { data: popularServices = mockPopularServices, loading: loadingPopular } = useApi(
    () => serviceApi.getPopularServices({ limit: 5 }),
    { initialData: mockPopularServices },
  );

  // Global search — GET /api/Search?keyword= (debounced, dropdown results).
  const [keyword, setKeyword] = useState("");
  const trimmed = keyword.trim();
  const showResults = trimmed.length >= 2;
  const { data: searchResult, loading: searching, refetch: runSearch } = useApi(
    () => searchApi.globalSearch(trimmed),
    { immediate: false },
  );
  useEffect(() => {
    if (trimmed.length < 2) return;
    const t = setTimeout(() => void runSearch(), 350);
    return () => clearTimeout(t);
  }, [trimmed, runSearch]);

  const selectResult = (screen: Screen, payload?: object) => {
    setKeyword("");
    onNavigate(screen, payload);
  };
  const hasAnyResult =
    !!searchResult &&
    (searchResult.categories.length > 0 ||
      searchResult.services.length > 0 ||
      searchResult.taskers.length > 0);

  return (
    <div className="overflow-y-auto h-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-4 pt-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-200 text-sm">Chào buổi sáng 👋</p>
            <h2 className="text-white text-xl font-bold">Trần Minh Khoa</h2>
          </div>
          <button
            onClick={() => onNavigate("customerProfile")}
            className="w-10 h-10 rounded-xl overflow-hidden"
          >
            <Avatar src="photo-1472099645785-5658abf4ff4e" name="Minh Khoa" size={40} />
          </button>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2 mb-4">
          <MapPin className="w-4 h-4 text-blue-200 flex-shrink-0" />
          <span className="text-white text-sm flex-1 truncate">123 Lê Lợi, Quận 1, TP.HCM</span>
          <ChevronDown className="w-4 h-4 text-blue-200" />
        </div>

        {/* Search */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-1 text-sm bg-transparent focus:outline-none text-foreground"
              placeholder="Tìm dịch vụ, thợ..."
            />
            {searching && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
            {keyword && !searching && (
              <button onClick={() => setKeyword("")} aria-label="Xóa tìm kiếm">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {showResults && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-border z-30 max-h-80 overflow-y-auto">
              {searching && !searchResult ? (
                <div className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang tìm...
                </div>
              ) : !hasAnyResult ? (
                <div className="px-4 py-6 text-sm text-muted-foreground text-center">
                  Không tìm thấy kết quả cho “{trimmed}”.
                </div>
              ) : (
                <div className="py-1">
                  {searchResult!.categories.length > 0 && (
                    <div>
                      <p className="px-4 pt-2 pb-1 text-[11px] font-bold uppercase text-muted-foreground">
                        Danh mục
                      </p>
                      {searchResult!.categories.map((c) => (
                        <button
                          key={`c-${c.id}`}
                          onClick={() => selectResult("serviceList")}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                        >
                          <LayoutGrid className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="text-sm text-foreground truncate">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResult!.services.length > 0 && (
                    <div>
                      <p className="px-4 pt-2 pb-1 text-[11px] font-bold uppercase text-muted-foreground">
                        Dịch vụ
                      </p>
                      {searchResult!.services.map((s) => (
                        <button
                          key={`s-${s.id}`}
                          onClick={() => selectResult("serviceDetail", { serviceId: s.id })}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                        >
                          <Wrench className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="text-sm text-foreground truncate">{s.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResult!.taskers.length > 0 && (
                    <div>
                      <p className="px-4 pt-2 pb-1 text-[11px] font-bold uppercase text-muted-foreground">
                        Thợ
                      </p>
                      {searchResult!.taskers.map((t) => (
                        <button
                          key={`t-${t.id}`}
                          onClick={() => selectResult("technicianDetail", { taskerId: t.id })}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                        >
                          <Avatar size={28} name={t.fullName} />
                          <span className="flex-1 text-sm text-foreground truncate">
                            {t.fullName}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {t.ratingAvg}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 space-y-6 pb-6 -mt-3">
        {/* Promo Banner */}
        <div className="relative bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl overflow-hidden shadow-lg">
          <img
            src={getUnsplashUrl("photo-1581578731548-c64695cc6952", 600, 180)}
            alt="promo"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="relative p-5">
            <span className="bg-white text-orange-600 text-xs font-bold px-2 py-1 rounded-full">
              HOT DEAL
            </span>
            <h3 className="text-white text-lg font-bold mt-2">
              Giảm 30% dịch vụ
              <br />
              Dọn dẹp nhà
            </h3>
            <p className="text-white/80 text-xs mt-1 mb-3">Áp dụng đến 30/06/2026</p>
            <button className="bg-white text-orange-600 text-xs font-bold px-4 py-2 rounded-lg">
              Đặt ngay
            </button>
          </div>
        </div>

        {/* Service Categories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground">Danh mục dịch vụ</h3>
            <button
              onClick={() => onNavigate("serviceList")}
              className="text-blue-600 text-sm font-semibold hover:underline"
            >
              Xem tất cả
            </button>
          </div>

          {loadingCategories ? (
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-3 flex flex-col items-center gap-2 shadow-sm animate-pulse"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-200" />
                  <div className="h-3 w-16 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.categoryId}
                  onClick={() => onNavigate("serviceList", { categorySlug: cat.slug })}
                  className="bg-white rounded-2xl p-3 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-shadow active:scale-95"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 overflow-hidden">
                    <CategoryIcon iconUrl={cat.iconUrl} name={cat.name} />
                  </div>
                  <span className="text-xs font-semibold text-foreground text-center leading-tight">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Popular Taskers */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground">Thợ phổ biến</h3>
            <button
              onClick={() => onNavigate("technicianMap")}
              className="text-blue-600 text-sm font-semibold hover:underline"
            >
              Xem tất cả
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            {loadingTaskers
              ? [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-36 bg-white rounded-2xl p-3 shadow-sm animate-pulse"
                  >
                    <div className="w-[52px] h-[52px] bg-slate-200 rounded-full mb-2" />
                    <div className="h-3 w-20 bg-slate-200 rounded mb-1.5" />
                    <div className="h-2.5 w-16 bg-slate-200 rounded" />
                  </div>
                ))
              : taskers.map((t) => (
                  <button
                    key={t.taskerId}
                    onClick={() => onNavigate("technicianDetail", { taskerId: t.taskerId })}
                    className="flex-shrink-0 w-36 bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow text-left"
                  >
                    <div className="relative mb-2 inline-block">
                      {t.avatarUrl ? (
                        <img
                          src={getApiAssetUrl(t.avatarUrl)}
                          alt={t.fullName}
                          className="rounded-full object-cover"
                          style={{ width: 52, height: 52 }}
                        />
                      ) : (
                        <Avatar size={52} name={t.fullName} />
                      )}
                      {t.isVerified && (
                        <span className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full">
                          <BadgeCheck className="w-4 h-4 text-blue-600" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-foreground truncate">{t.fullName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {t.mainSkill ?? "Thợ dịch vụ"}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold text-foreground">{t.ratingAvg}</span>
                    </div>
                    <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
                      {t.totalReviews} đánh giá
                    </p>
                  </button>
                ))}
          </div>
        </div>

        {/* Popular Services */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground">Dịch vụ phổ biến</h3>
          </div>
          <div className="space-y-3">
            {loadingPopular
              ? [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-full flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm animate-pulse"
                  >
                    <div className="w-16 h-16 bg-slate-200 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 bg-slate-200 rounded" />
                      <div className="h-2 w-1/2 bg-slate-200 rounded" />
                      <div className="h-3 w-1/4 bg-slate-200 rounded" />
                    </div>
                  </div>
                ))
              : popularServices.map((svc) => (
                  <button
                    key={svc.serviceId}
                    onClick={() => onNavigate("serviceDetail", { serviceId: svc.serviceId })}
                    className="w-full flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow text-left"
                  >
                    <div className="w-16 h-16 rounded-xl flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-foreground">{svc.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <BookOpen className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-muted-foreground">
                          {svc.totalBookings} lượt đặt
                        </span>
                      </div>
                      <p className="text-blue-600 font-bold text-sm mt-1">
                        từ {formatVnd(svc.startingPrice)}đ
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
