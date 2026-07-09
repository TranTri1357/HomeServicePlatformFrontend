import {
  MapPin,
  Search,
  Star,
  ChevronDown,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Screen, Service, Technician } from "@/shared/types";
import { serviceApi, technicianApi } from "@/services/api";
import { Avatar } from "@/shared/ui";
import { getUnsplashUrl } from "@/shared/lib";

// Fallback data mapping to ensure UI doesn't break if API fails
import { services as mockServices } from "@/services/Service/service.data";
import { technicians as mockTechnicians } from "@/services/Technician/technician.data";

export function CustomerHome({
  onNavigate,
}: {
  onNavigate: (s: Screen, data?: object) => void;
}) {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [technicians, setTechnicians] = useState<Technician[]>(mockTechnicians);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // In real app with backend:
        // const [svcRes, techRes] = await Promise.all([
        //   serviceApi.getServices(),
        //   technicianApi.getTechnicians({ status: "available" })
        // ]);
        // setServices(svcRes);
        // setTechnicians(techRes);

        // Simulate network delay for now
        await new Promise(resolve => setTimeout(resolve, 600));
      } catch (error) {
        console.error("Failed to fetch home data", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
          <span className="text-white text-sm flex-1 truncate">
            123 Lê Lợi, Quận 1, TP.HCM
          </span>
          <ChevronDown className="w-4 h-4 text-blue-200" />
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            className="flex-1 text-sm bg-transparent focus:outline-none text-foreground"
            placeholder="Tìm kiếm dịch vụ..."
          />
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
            <p className="text-white/80 text-xs mt-1 mb-3">
              Áp dụng đến 30/06/2026
            </p>
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
          
          {loading ? (
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl p-3 flex flex-col items-center gap-2 shadow-sm animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-slate-200" />
                  <div className="h-3 w-16 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => onNavigate("serviceDetail", { service: svc })}
                  className="bg-white rounded-2xl p-3 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-shadow active:scale-95"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: svc.bg }}
                  >
                    <svc.icon className="w-6 h-6" style={{ color: svc.color }} />
                  </div>
                  <span className="text-xs font-semibold text-foreground text-center leading-tight">
                    {svc.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nearby Technicians */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground">Thợ gần bạn</h3>
            <button
              onClick={() => onNavigate("technicianMap")}
              className="text-blue-600 text-sm font-semibold hover:underline"
            >
              Xem bản đồ
            </button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="flex-shrink-0 w-36 bg-white rounded-2xl p-3 shadow-sm animate-pulse">
                  <div className="w-[52px] h-[52px] bg-slate-200 rounded-full mb-2" />
                  <div className="h-3 w-20 bg-slate-200 rounded mb-1.5" />
                  <div className="h-2.5 w-16 bg-slate-200 rounded" />
                </div>
              ))
            ) : technicians.filter((t) => t.status === "available").map((tech) => (
              <button
                key={tech.id}
                onClick={() => onNavigate("technicianDetail", { tech })}
                className="flex-shrink-0 w-36 bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className="relative mb-2 inline-block">
                  <Avatar src={tech.avatar} size={52} name={tech.name} />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <p className="text-xs font-bold text-foreground truncate">{tech.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{tech.skill}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-semibold text-foreground">{tech.rating}</span>
                </div>
                <p className="text-[11px] text-blue-600 font-semibold mt-0.5">{tech.distance}</p>
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
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="w-full flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm animate-pulse">
                  <div className="w-16 h-16 bg-slate-200 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 bg-slate-200 rounded" />
                    <div className="h-2 w-1/2 bg-slate-200 rounded" />
                    <div className="h-3 w-1/4 bg-slate-200 rounded" />
                  </div>
                </div>
              ))
            ) : services.slice(0, 3).map((svc) => (
              <button
                key={svc.id}
                onClick={() => onNavigate("serviceDetail", { service: svc })}
                className="w-full flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <img
                  src={getUnsplashUrl(svc.image, 80, 80)}
                  alt={svc.name}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="font-bold text-sm text-foreground">{svc.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <BookOpen className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-muted-foreground">{svc.reviews} lượt đặt</span>
                  </div>
                  <p className="text-blue-600 font-bold text-sm mt-1">từ {svc.price}đ</p>
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
