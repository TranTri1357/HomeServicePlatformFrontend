import { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Star, Shield, X, MapPin, AlertCircle, Loader2, KeyRound } from "lucide-react";
import type { Screen, NearbyTasker } from "@/shared/types";
import { taskerApi } from "@/services/api";
import { useApi } from "@/shared/hooks";
import { Avatar, TopBar } from "@/shared/ui";
import { formatVnd, getApiAssetUrl } from "@/shared/lib";
import { useGoBack } from "@/app/routes/useGoBack";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
const DEFAULT_CENTER = { lat: 10.7769, lng: 106.7009 }; // TP.HCM
const RADIUS_KM = 10;

type LatLng = { lat: number; lng: number };

function markerIcon(color: string): google.maps.Icon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="10" fill="${color}" stroke="white" stroke-width="3"/></svg>`;
  return { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}` };
}

function CenterMessage({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center bg-blue-50">
      {icon}
      <p className="text-sm text-muted-foreground max-w-xs">{text}</p>
    </div>
  );
}

function MapCanvas({
  center,
  taskers,
  selectedTaskerId,
  onSelectTasker,
}: {
  center: LatLng;
  taskers: NearbyTasker[];
  selectedTaskerId: number | null;
  onSelectTasker: (id: number) => void;
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY ?? "",
  });

  if (loadError) {
    return (
      <CenterMessage
        icon={<AlertCircle className="w-10 h-10 text-red-400" />}
        text="Không tải được Google Maps. Kiểm tra lại API key và kết nối mạng."
      />
    );
  }
  if (!isLoaded) {
    return (
      <CenterMessage
        icon={<Loader2 className="w-8 h-8 text-blue-500 animate-spin" />}
        text="Đang tải bản đồ…"
      />
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={center}
      zoom={14}
      options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
    >
      <Marker position={center} icon={markerIcon("#2563eb")} title="Vị trí của bạn" />
      {taskers.map((t) => (
        <Marker
          key={t.taskerId}
          position={{ lat: t.latitude, lng: t.longitude }}
          icon={markerIcon(t.status === 1 ? "#22c55e" : "#f59e0b")}
          animation={
            selectedTaskerId === t.taskerId ? google.maps.Animation.BOUNCE : undefined
          }
          onClick={() => onSelectTasker(t.taskerId)}
        />
      ))}
    </GoogleMap>
  );
}

export function TechnicianMap({
  onNavigate,
  data,
}: {
  onNavigate: (s: Screen, d?: object) => void;
  data?: { serviceId?: number };
}) {
  const serviceId = data?.serviceId;
  const goBack = useGoBack("customerHome");
  const [center, setCenter] = useState<LatLng>(DEFAULT_CENTER);
  const [locReady, setLocReady] = useState(false);
  const [selectedTaskerId, setSelectedTaskerId] = useState<number | null>(null);

  // Try to get the user's real location; fall back to the default center.
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocReady(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocReady(true);
      },
      () => setLocReady(true),
      { timeout: 8000, enableHighAccuracy: true },
    );
  }, []);

  // Nearby taskers for this service around the current center.
  const {
    data: taskers = [],
    loading,
    error,
    refetch,
  } = useApi(
    () =>
      taskerApi.getNearbyTaskers({
        serviceId: serviceId!,
        lat: center.lat,
        lng: center.lng,
        radius: RADIUS_KM,
      }),
    { immediate: false },
  );

  useEffect(() => {
    if (serviceId && locReady) void refetch();
  }, [serviceId, locReady, center.lat, center.lng, refetch]);

  // Quick info for the tapped marker.
  const {
    data: quickInfo,
    loading: loadingQuick,
    refetch: refetchQuick,
  } = useApi(() => taskerApi.getTaskerQuickInfo(selectedTaskerId!, serviceId!), {
    immediate: false,
  });

  useEffect(() => {
    if (selectedTaskerId && serviceId) void refetchQuick();
  }, [selectedTaskerId, serviceId, refetchQuick]);

  const selectedNearby = taskers.find((t) => t.taskerId === selectedTaskerId);

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!serviceId) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Tìm thợ gần bạn" onBack={goBack} />
        <div className="flex-1 relative">
          <CenterMessage
            icon={<MapPin className="w-10 h-10 text-blue-400" />}
            text="Hãy chọn một dịch vụ trước để tìm thợ phù hợp gần bạn."
          />
          <button
            onClick={() => onNavigate("serviceList")}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold"
          >
            Chọn dịch vụ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <TopBar title="Tìm thợ gần bạn" onBack={goBack} />

      {/* Map */}
      <div className="flex-1 relative overflow-hidden bg-blue-50">
        {!GOOGLE_MAPS_API_KEY ? (
          <CenterMessage
            icon={<KeyRound className="w-10 h-10 text-amber-400" />}
            text="Chưa cấu hình Google Maps API key. Thêm VITE_GOOGLE_MAPS_API_KEY vào file .env để bật bản đồ."
          />
        ) : !locReady ? (
          <CenterMessage
            icon={<Loader2 className="w-8 h-8 text-blue-500 animate-spin" />}
            text="Đang xác định vị trí của bạn…"
          />
        ) : (
          <MapCanvas
            center={center}
            taskers={taskers}
            selectedTaskerId={selectedTaskerId}
            onSelectTasker={setSelectedTaskerId}
          />
        )}

        {/* Legend */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-xl px-3 py-2 shadow z-10">
          <p className="text-xs font-bold text-foreground mb-1.5">Trạng thái thợ</p>
          {[
            { label: "Đang rảnh", color: "bg-green-500" },
            { label: "Đang bận", color: "bg-amber-500" },
            { label: "Vị trí của bạn", color: "bg-blue-600" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5 mb-0.5">
              <div className={`w-2 h-2 rounded-full ${l.color}`} />
              <span className="text-[11px] text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>

        {/* Result count / status */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-xl px-3 py-2 shadow z-10 text-xs font-semibold">
          {loading ? (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang tìm…
            </span>
          ) : error ? (
            <button onClick={() => void refetch()} className="text-red-600">
              Lỗi — thử lại
            </button>
          ) : (
            <span className="text-foreground">{taskers.length} thợ trong {RADIUS_KM}km</span>
          )}
        </div>
      </div>

      {/* Bottom sheet — quick info of the selected tasker */}
      {selectedTaskerId ? (
        <div className="bg-white border-t border-border p-4 space-y-3">
          {loadingQuick && !quickInfo ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Đang tải thông tin thợ…
            </div>
          ) : quickInfo ? (
            <>
              <div className="flex items-center gap-3">
                {quickInfo.avatarUrl ? (
                  <img
                    src={getApiAssetUrl(quickInfo.avatarUrl)}
                    alt={quickInfo.fullName}
                    className="rounded-full object-cover"
                    style={{ width: 56, height: 56 }}
                  />
                ) : (
                  <Avatar size={56} name={quickInfo.fullName} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-foreground truncate">{quickInfo.fullName}</p>
                    {quickInfo.isVerified && <Shield className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {quickInfo.mainSkill || "Thợ dịch vụ"}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold">{quickInfo.ratingAvg}</span>
                    </span>
                    {selectedNearby && (
                      <span className="text-sm text-muted-foreground">
                        {selectedNearby.distanceKm} km
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTaskerId(null)}
                  className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="bg-muted rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Giá dịch vụ này</span>
                <span className="text-sm font-bold text-blue-600">
                  {quickInfo.currentPrice > 0 ? `${formatVnd(quickInfo.currentPrice)}đ` : "Liên hệ"}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    onNavigate("technicianDetail", { taskerId: quickInfo.taskerId })
                  }
                  className="flex-1 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-bold text-sm hover:bg-accent transition-colors"
                >
                  Xem hồ sơ
                </button>
                <button
                  onClick={() => onNavigate("booking", { serviceId })}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
                >
                  Đặt lịch
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between py-2">
              <p className="text-sm text-muted-foreground">Không tải được thông tin thợ.</p>
              <button
                onClick={() => setSelectedTaskerId(null)}
                className="text-sm font-semibold text-blue-600"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {taskers.length > 0
              ? "Chạm vào ghim trên bản đồ để xem thông tin thợ."
              : loading
                ? "Đang tìm thợ quanh bạn…"
                : "Không có thợ nào cung cấp dịch vụ này gần bạn."}
          </p>
        </div>
      )}
    </div>
  );
}
