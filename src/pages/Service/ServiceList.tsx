import { useEffect, useState } from "react";
import { Search, BookOpen, Wrench, Clock, AlertCircle } from "lucide-react";
import type { Screen } from "@/shared/types";
import { categoryApi, serviceApi } from "@/services/api";
import { useGoBack } from "@/app/routes/useGoBack";
import { useApi } from "@/shared/hooks";
import { TopBar } from "@/shared/ui";
import { getApiAssetUrl, formatVnd } from "@/shared/lib";

/** Service banner with a placeholder when the backend has no image yet. */
function ServiceImage({ imageUrl, name }: { imageUrl: string | null; name: string }) {
  const [broken, setBroken] = useState(false);
  const url = imageUrl ? getApiAssetUrl(imageUrl) : "";
  if (!url || broken) {
    return (
      <div className="w-full h-28 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
        <Wrench className="h-8 w-8 text-white/90" />
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={name}
      className="w-full h-28 object-cover"
      onError={() => setBroken(true)}
    />
  );
}

export function ServiceList({
  onNavigate,
  data,
}: {
  onNavigate: (s: Screen, data?: object) => void;
  data?: { categoryId?: number };
}) {
  const goBack = useGoBack("customerHome");
  const [search, setSearch] = useState("");
  // Pre-select the category when arriving from a home-screen category tile.
  const [categoryId, setCategoryId] = useState<number | undefined>(data?.categoryId);
  const [priceSort, setPriceSort] = useState<"none" | "asc" | "desc">("none");

  const sortBy = priceSort === "asc" ? "price_asc" : priceSort === "desc" ? "price_desc" : undefined;

  // Filter chips come from the real category list.
  const { data: categories = [] } = useApi(() => categoryApi.getActiveCategories(), {
    initialData: [],
  });

  // GET /api/Services/explorer — refetched (debounced) whenever a filter changes.
  const { data: paged, loading, error, refetch } = useApi(
    () =>
      serviceApi.getServicesExplorer({
        searchTerm: search || undefined,
        categoryId,
        sortBy,
        pageSize: 20,
      }),
    { immediate: false },
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void refetch();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, categoryId, priceSort, refetch]);

  const items = paged?.items ?? [];
  const showSkeleton = !paged; // first load only; keep old data during refetch

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Dịch vụ" onBack={goBack} />

      {/* Search + Filter */}
      <div className="bg-white px-4 py-3 border-b border-border space-y-3">
        <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm focus:outline-none"
            placeholder="Tìm dịch vụ..."
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setCategoryId(undefined)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              categoryId === undefined ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            Tất cả
          </button>
          {categories.map((c) => (
            <button
              key={c.categoryId}
              onClick={() => setCategoryId(c.categoryId)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                categoryId === c.categoryId
                  ? "bg-blue-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Lọc theo giá:</span>
          {(["none", "asc", "desc"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setPriceSort(s)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${priceSort === s ? "bg-accent text-blue-600" : "text-muted-foreground"}`}
            >
              {s === "none" ? "Tất cả" : s === "asc" ? "Giá tăng dần ↑" : "Giá giảm dần ↓"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {showSkeleton ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="w-full h-28 bg-slate-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-3/4 bg-slate-200 rounded" />
                  <div className="h-2.5 w-1/2 bg-slate-200 rounded" />
                  <div className="h-3 w-1/3 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => void refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Search className="w-10 h-10 text-slate-300" />
            <p className="text-sm text-muted-foreground">Không tìm thấy dịch vụ phù hợp</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              {paged?.totalCount ?? items.length} dịch vụ
              {loading && <span className="text-blue-500"> · đang cập nhật…</span>}
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {items.map((svc) => (
                <div
                  key={svc.serviceId}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="relative">
                    <ServiceImage imageUrl={svc.imageUrl} name={svc.name} />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-lg px-2 py-0.5 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-blue-500" />
                      <span className="text-xs font-bold">{svc.totalBookings}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-sm text-foreground line-clamp-1">{svc.name}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">~{svc.durationMinutes} phút</span>
                    </div>
                    <p className="text-blue-600 font-bold text-sm mt-1">
                      từ {formatVnd(svc.startingPrice)}đ
                    </p>
                    <div className="flex gap-1.5 mt-2">
                      <button
                        onClick={() => onNavigate("serviceDetail", { serviceId: svc.serviceId })}
                        className="flex-1 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-[11px] font-bold hover:bg-accent transition-colors"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => onNavigate("booking", { serviceId: svc.serviceId })}
                        className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-bold hover:bg-blue-700 transition-colors"
                      >
                        Đặt lịch
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
