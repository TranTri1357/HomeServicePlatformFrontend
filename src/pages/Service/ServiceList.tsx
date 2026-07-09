import { useState } from "react";
import { Search, BookOpen } from "lucide-react";
import type { Screen } from "@/shared/types";
import { services } from "@/services/Service/service.data";
import { TopBar } from "@/shared/ui";

export function ServiceList({ onNavigate }: { onNavigate: (s: Screen, data?: object) => void }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [priceSort, setPriceSort] = useState<"none" | "asc" | "desc">("none");
  const filters = ["all", "Điện", "Nước", "Điều hòa", "Dọn dẹp", "Sơn", "Thiết bị"];

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Dịch vụ" onBack={() => onNavigate("customerHome")} />

      {/* Search + Filter */}
      <div className="bg-white px-4 py-3 border-b border-border space-y-3">
        <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            className="flex-1 bg-transparent text-sm focus:outline-none"
            placeholder="Tìm dịch vụ..."
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${activeFilter === f ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"}`}
            >
              {f === "all" ? "Tất cả" : f}
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
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
            >
              <div className="relative">
                <img
                  src={`https://images.unsplash.com/${svc.image}?w=300&h=160&fit=crop&auto=format`}
                  alt={svc.name}
                  className="w-full h-28 object-cover"
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-lg px-2 py-0.5 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-blue-500" />
                  <span className="text-xs font-bold">{svc.reviews}</span>
                </div>
              </div>
              <div className="p-3">
                <p className="font-bold text-sm text-foreground">{svc.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{svc.reviews} lượt đặt</p>
                <p className="text-blue-600 font-bold text-sm mt-1">từ {svc.price}đ</p>
                <div className="flex gap-1.5 mt-2">
                  <button
                    onClick={() =>
                      onNavigate("serviceDetail", {
                        service: svc,
                      })
                    }
                    className="flex-1 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-[11px] font-bold hover:bg-accent transition-colors"
                  >
                    Chi tiết
                  </button>
                  <button
                    onClick={() => onNavigate("booking", { service: svc })}
                    className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-bold hover:bg-blue-700 transition-colors"
                  >
                    Đặt lịch
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
