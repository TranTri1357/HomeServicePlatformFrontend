import { useState } from "react";
import { Plus, Minus, Navigation, Shield, Star, X } from "lucide-react";
import type { Screen } from "@/shared/types";
import type { Technician } from "@/shared/types";
import { technicians } from "@/services/Technician/technician.data";
import { Avatar, TopBar } from "@/shared/ui";

export function TechnicianMap({ onNavigate }: { onNavigate: (s: Screen, d?: object) => void }) {
  const [selected, setSelected] = useState<Technician | null>(null);

  const markers = [
    { tech: technicians[0], x: "30%", y: "40%" },
    { tech: technicians[1], x: "55%", y: "55%" },
    { tech: technicians[2], x: "70%", y: "30%" },
    { tech: technicians[3], x: "45%", y: "70%" },
  ];

  const statusColor = {
    available: "bg-green-500",
    busy: "bg-amber-500",
    offline: "bg-gray-400",
  };

  return (
    <div className="flex flex-col h-full relative">
      <TopBar title="Tìm thợ gần bạn" onBack={() => onNavigate("customerHome")} />

      {/* Map */}
      <div className="flex-1 relative overflow-hidden bg-blue-50">
        <img
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&h=800&fit=crop&auto=format"
          alt="map"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        {/* Fake map grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(37,99,235,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.08) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Streets simulation */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <path
            d="M0,200 Q200,180 400,220 T800,200"
            stroke="white"
            strokeWidth="12"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M0,350 Q300,340 600,360 T1200,350"
            stroke="white"
            strokeWidth="8"
            fill="none"
            opacity="0.5"
          />
          <path
            d="M300,0 Q310,200 290,400 T300,800"
            stroke="white"
            strokeWidth="10"
            fill="none"
            opacity="0.5"
          />
          <path
            d="M550,0 Q560,300 540,600 T550,800"
            stroke="white"
            strokeWidth="6"
            fill="none"
            opacity="0.4"
          />
        </svg>

        {/* Your location */}
        <div
          className="absolute"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
          }}
        >
          <div className="w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg" />
          <div className="w-16 h-16 bg-blue-600/20 rounded-full absolute -inset-5 animate-ping" />
        </div>

        {/* Tech markers */}
        {markers.map(({ tech, x, y }) => (
          <button
            key={tech.id}
            onClick={() => setSelected(selected?.id === tech.id ? null : tech)}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: x, top: y }}
          >
            <div
              className={`relative w-12 h-12 rounded-full border-3 border-white shadow-lg overflow-hidden ${selected?.id === tech.id ? "ring-2 ring-blue-600 scale-110" : ""} transition-transform`}
            >
              <Avatar src={tech.avatar} size={48} name={tech.name} />
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${statusColor[tech.status as keyof typeof statusColor]}`}
            />
          </button>
        ))}

        {/* Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button className="w-10 h-10 bg-white rounded-xl shadow flex items-center justify-center hover:bg-muted transition-colors">
            <Plus className="w-4 h-4 text-foreground" />
          </button>
          <button className="w-10 h-10 bg-white rounded-xl shadow flex items-center justify-center hover:bg-muted transition-colors">
            <Minus className="w-4 h-4 text-foreground" />
          </button>
          <button className="w-10 h-10 bg-white rounded-xl shadow flex items-center justify-center hover:bg-muted transition-colors">
            <Navigation className="w-4 h-4 text-blue-600" />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-xl px-3 py-2 shadow">
          <p className="text-xs font-bold text-foreground mb-1.5">Trạng thái</p>
          {[
            { label: "Rảnh", color: "bg-green-500" },
            { label: "Bận", color: "bg-amber-500" },
            { label: "Offline", color: "bg-gray-400" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5 mb-0.5">
              <div className={`w-2 h-2 rounded-full ${l.color}`} />
              <span className="text-[11px] text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Sheet */}
      {selected ? (
        <div className="bg-white border-t border-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar src={selected.avatar} size={56} name={selected.name} />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${statusColor[selected.status as keyof typeof statusColor]}`}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-foreground">{selected.name}</p>
                {selected.verified && <Shield className="w-3.5 h-3.5 text-blue-600" />}
              </div>
              <p className="text-sm text-muted-foreground">{selected.skill}</p>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold">{selected.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">{selected.distance}</span>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          {/* Base price table */}
          <div className="bg-muted rounded-xl p-3">
            <p className="text-xs font-bold text-foreground mb-2">Giá cơ bản dịch vụ</p>
            <div className="space-y-1">
              {[
                { name: "Kiểm tra cơ bản", price: "50,000đ" },
                { name: "Sửa chữa nhỏ", price: "150,000đ" },
                { name: "Sửa chữa lớn", price: "350,000đ" },
              ].map((item) => (
                <div key={item.name} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-semibold text-blue-600">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() =>
                onNavigate("technicianDetail", {
                  tech: selected,
                })
              }
              className="flex-1 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-bold text-sm hover:bg-accent transition-colors"
            >
              Xem hồ sơ
            </button>
            <button
              onClick={() => onNavigate("booking", { tech: selected })}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
            >
              Đặt lịch
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border-t border-border px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {technicians.map((tech) => (
              <button
                key={tech.id}
                onClick={() => setSelected(tech)}
                className="flex-shrink-0 flex items-center gap-2 bg-muted hover:bg-accent rounded-xl px-3 py-2 transition-colors"
              >
                <Avatar src={tech.avatar} size={28} name={tech.name} />
                <div className="text-left">
                  <p className="text-xs font-semibold text-foreground whitespace-nowrap">
                    {tech.name.split(" ").slice(-1)[0]}
                  </p>
                  <p
                    className={`text-[10px] font-semibold ${tech.status === "available" ? "text-green-600" : "text-amber-600"}`}
                  >
                    {tech.status === "available" ? "Rảnh" : "Bận"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
