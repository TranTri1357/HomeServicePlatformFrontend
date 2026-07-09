import { useState } from "react";
import { MapPin, X, CheckCircle, Route } from "lucide-react";
import type { Screen } from "@/shared/types";
import { districts, districtMapPositions } from "@/services/Provider/provider.data";
import { TopBar } from "@/shared/ui";

export function ProviderAreaRouting({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [areas, setAreas] = useState(districts);
  const [radius, setRadius] = useState(8);
  const [view, setView] = useState<"list" | "map">("map");
  const [saveMsg, setSaveMsg] = useState(false);

  const toggleArea = (id: number) =>
    setAreas(areas.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));

  const handleSave = () => {
    setSaveMsg(true);
    setTimeout(() => setSaveMsg(false), 2500);
  };

  const activeCount = areas.filter((a) => a.active).length;

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Định tuyến khu vực"
        onBack={() => onNavigate("providerDashboard")}
        actions={
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
          >
            Lưu
          </button>
        }
      />

      {saveMsg && (
        <div className="bg-green-500 px-4 py-2.5 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-semibold">Đã lưu cài đặt khu vực!</span>
        </div>
      )}

      {/* Summary bar */}
      <div className="bg-white border-b border-border px-4 py-3 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Khu vực đang hoạt động</p>
          <p className="text-lg font-extrabold text-blue-600">
            {activeCount} / {areas.length} quận/huyện
          </p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Bán kính tối đa</p>
          <p className="text-lg font-extrabold text-foreground">{radius} km</p>
        </div>
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {(["map", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${view === v ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              {v === "map" ? "🗺 Bản đồ" : "📋 Danh sách"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {view === "map" ? (
          <div className="p-4 space-y-4">
            {/* Fake map with clickable district labels */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div
                className="relative h-72"
                style={{
                  background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
                }}
              >
                {/* Grid lines */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "linear-gradient(#2563EB 1px,transparent 1px),linear-gradient(90deg,#2563EB 1px,transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />
                {/* Road network SVG */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <path
                    d="M0,180 Q150,170 300,185 T600,175"
                    stroke="white"
                    strokeWidth="10"
                    fill="none"
                    opacity="0.7"
                  />
                  <path
                    d="M0,130 Q200,120 400,135 T800,128"
                    stroke="white"
                    strokeWidth="6"
                    fill="none"
                    opacity="0.5"
                  />
                  <path
                    d="M220,0 Q215,100 225,200 T220,320"
                    stroke="white"
                    strokeWidth="8"
                    fill="none"
                    opacity="0.6"
                  />
                  <path
                    d="M380,0 Q375,150 385,290"
                    stroke="white"
                    strokeWidth="5"
                    fill="none"
                    opacity="0.5"
                  />
                  <path
                    d="M130,0 Q125,100 135,290"
                    stroke="white"
                    strokeWidth="4"
                    fill="none"
                    opacity="0.4"
                  />
                  <path
                    d="M0,250 Q200,245 450,255 T800,248"
                    stroke="white"
                    strokeWidth="5"
                    fill="none"
                    opacity="0.4"
                  />
                </svg>
                {/* Radius circle */}
                <div
                  className="absolute border-4 border-blue-400/50 rounded-full"
                  style={{
                    width: `${radius * 22}px`,
                    height: `${radius * 22}px`,
                    left: "50%",
                    top: "48%",
                    transform: "translate(-50%,-50%)",
                    background: "radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)",
                  }}
                />
                {/* Your location */}
                <div
                  className="absolute"
                  style={{
                    left: "50%",
                    top: "48%",
                    transform: "translate(-50%,-50%)",
                  }}
                >
                  <div className="w-5 h-5 bg-blue-600 rounded-full border-3 border-white shadow-lg z-10 relative" />
                  <div className="absolute inset-0 w-10 h-10 -m-2.5 bg-blue-400/20 rounded-full animate-ping" />
                </div>
                {/* District markers */}
                {areas.map((area) => {
                  const pos = districtMapPositions[area.id];
                  if (!pos) return null;
                  return (
                    <button
                      key={area.id}
                      onClick={() => toggleArea(area.id)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group"
                      style={{ left: pos.x, top: pos.y }}
                    >
                      <div
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all ${area.active ? "bg-blue-600 text-white scale-100" : "bg-white/90 text-slate-500 border border-slate-200 scale-90"}`}
                      >
                        {area.name.replace("Quận ", "Q.")}
                      </div>
                    </button>
                  );
                })}
                <div className="absolute bottom-2 left-3 text-[10px] text-blue-600 font-medium bg-white/80 px-2 py-1 rounded-lg">
                  Nhấn vào quận để bật/tắt
                </div>
              </div>
            </div>

            {/* Radius slider */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground">Bán kính hoạt động</h3>
                <span className="bg-blue-100 text-blue-700 font-bold text-sm px-3 py-1 rounded-full">
                  {radius} km
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={20}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>2 km</span>
                <span>10 km</span>
                <span>20 km</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Bán kính càng lớn, bạn nhận được nhiều yêu cầu hơn nhưng thời gian di chuyển sẽ
                tăng.
              </p>
            </div>

            {/* Active zones summary */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-foreground mb-3">Khu vực đang bật</h3>
              <div className="flex flex-wrap gap-2">
                {areas
                  .filter((a) => a.active)
                  .map((a) => (
                    <span
                      key={a.id}
                      className="flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full"
                    >
                      <MapPin className="w-3 h-3" />
                      {a.name}
                      <button
                        onClick={() => toggleArea(a.id)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                {areas.filter((a) => a.active).length === 0 && (
                  <p className="text-sm text-muted-foreground">Chưa chọn khu vực nào</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {/* Quick actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setAreas(areas.map((a) => ({ ...a, active: true })))}
                className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                Bật tất cả
              </button>
              <button
                onClick={() => setAreas(areas.map((a) => ({ ...a, active: false })))}
                className="flex-1 py-2 bg-muted text-foreground rounded-xl text-xs font-bold hover:bg-accent transition-colors"
              >
                Tắt tất cả
              </button>
            </div>
            {/* District list */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {areas.map((area, i) => (
                <div
                  key={area.id}
                  className={`flex items-center gap-3 px-4 py-3.5 ${i < areas.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${area.active ? "bg-blue-100" : "bg-muted"}`}
                  >
                    <MapPin
                      className={`w-5 h-5 ${area.active ? "text-blue-600" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-semibold text-sm ${area.active ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {area.name}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground">{area.distance}</span>
                      <span className="text-xs text-muted-foreground">{area.jobs} công việc</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleArea(area.id)}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${area.active ? "bg-blue-600" : "bg-gray-300"}`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${area.active ? "translate-x-5" : "translate-x-0.5"}`}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Route optimization hint */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Route className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-sm text-blue-800">Gợi ý tối ưu tuyến đường</p>
                  <p className="text-xs text-blue-600 mt-1 leading-relaxed">
                    Với {activeCount} khu vực đang bật, thợ có thể tối ưu lộ trình di chuyển để giảm
                    30% thời gian giữa các công việc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border-t border-border px-4 py-4">
        <button
          onClick={handleSave}
          className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          Lưu cài đặt khu vực
        </button>
      </div>
    </div>
  );
}
