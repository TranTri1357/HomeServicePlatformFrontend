import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Siren, Loader2, Phone, X, Radar } from "lucide-react";
import type { Screen, CustomerAddress } from "@/shared/types";
import { serviceApi, addressApi, bookingApi } from "@/services/api";
import { connectEmergencyCustomer } from "@/services/realtime/bookingHub";
import { useApi } from "@/shared/hooks";
import { useAuth } from "@/app/providers";
import { useGoBack } from "@/app/routes/useGoBack";
import { TopBar } from "@/shared/ui";
import { notify, getErrorMessage } from "@/shared/lib";
// Lazy: LocationPicker kéo theo Leaflet — tách chunk, chỉ tải khi mở màn đơn khẩn.
const LocationPicker = lazy(() =>
  import("@/pages/Address/LocationPicker").then((m) => ({ default: m.LocationPicker })),
);
import { geocodeAddress, reverseGeocode } from "@/services/vnAddress";

// Các vòng bán kính quét thợ (km) — nới dần khi hết một vòng mà chưa ai nhận.
const RADII = [5, 10, 15];
const PHONE_REGEX = /^(03|05|07|08|09)\d{8}$/;

export function EmergencyBooking({
  onNavigate,
}: {
  onNavigate: (s: Screen, d?: object) => void;
}) {
  const goBack = useGoBack("customerHome");
  const { user } = useAuth();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [serviceId, setServiceId] = useState<number | undefined>(undefined);
  const [coord, setCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [savedAddr, setSavedAddr] = useState<CustomerAddress | null>(null);
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Services to pick from.
  const { data: services = [], loading: loadingServices } = useApi(
    () => serviceApi.getServicesExplorer({ pageSize: 50 }).then((p) => p.items),
    { initialData: [] },
  );

  // Prefill contact + location from the default saved address — ONCE, so editing
  // the address field later isn't overwritten.
  const { data: savedAddresses = [] } = useApi(() => addressApi.getMyAddresses(), {
    initialData: [],
  });
  const prefilledRef = useRef(false);
  useEffect(() => {
    if (prefilledRef.current || savedAddresses.length === 0) return;
    prefilledRef.current = true;
    const def = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
    setSavedAddr(def);
    setAddress(def.addressLine);
    if (def.latitude && def.longitude) setCoord({ lat: def.latitude, lng: def.longitude });
  }, [savedAddresses]);

  // ── Two-way sync between the map pin and the "Địa chỉ chi tiết" field ─────────
  const geoTimer = useRef<number | null>(null);

  const handleMapPick = async (lat: number, lng: number) => {
    setCoord({ lat, lng });
    try {
      const text = await reverseGeocode(lat, lng);
      if (text) {
        setAddress(text);
        setSavedAddr(null);
      }
    } catch {
      /* keep the current address text */
    }
  };

  const handleAddressType = (value: string) => {
    setAddress(value);
    setSavedAddr(null);
    if (geoTimer.current) clearTimeout(geoTimer.current);
    if (value.trim().length < 5) return;
    geoTimer.current = window.setTimeout(async () => {
      try {
        const g = await geocodeAddress(`${value}, Việt Nam`);
        if (g) setCoord({ lat: g.lat, lng: g.lng });
      } catch {
        /* leave the pin where it is */
      }
    }, 700);
  };
  useEffect(() => () => {
    if (geoTimer.current) clearTimeout(geoTimer.current);
  }, []);

  // ── Broadcast / waiting state ────────────────────────────────────────────────
  // `search` bật khi đang quét thợ; hiển thị overlay với bán kính hiện tại + đếm ngược.
  const [search, setSearch] = useState<{ radiusKm: number } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Refs điều phối vòng quét (không gây re-render).
  const resolvedRef = useRef(false); // đã nhận / đã hủy → dừng vòng lặp
  const stopTimerRef = useRef<(() => void) | null>(null); // dừng đồng hồ vòng hiện tại
  const disposeHubRef = useRef<(() => void) | null>(null); // đóng kết nối SignalR
  const bookingIdRef = useRef<number | null>(null);

  const cleanup = () => {
    stopTimerRef.current?.();
    stopTimerRef.current = null;
    disposeHubRef.current?.();
    disposeHubRef.current = null;
  };
  useEffect(() => cleanup, []); // dispose on unmount

  // Chờ tối đa `seconds` cho một vòng: resolve false khi hết giờ hoặc bị dừng.
  const waitRound = (seconds: number) =>
    new Promise<void>((resolve) => {
      let remaining = seconds;
      setSecondsLeft(remaining);
      const timer = window.setInterval(() => {
        remaining -= 1;
        setSecondsLeft(remaining);
        if (remaining <= 0) {
          window.clearInterval(timer);
          stopTimerRef.current = null;
          resolve();
        }
      }, 1000);
      stopTimerRef.current = () => {
        window.clearInterval(timer);
        stopTimerRef.current = null;
        resolve();
      };
    });

  const finishNoTasker = async () => {
    resolvedRef.current = true;
    cleanup();
    const id = bookingIdRef.current;
    setSearch(null);
    if (id != null) await bookingApi.cancelEmergencyBooking(id).catch(() => {});
    notify.error("Không có thợ nào nhận việc trong khu vực. Vui lòng thử lại sau.");
  };

  const startEmergency = () => {
    setFormError(null);
    if (serviceId == null) return setFormError("Vui lòng chọn dịch vụ cần gấp.");
    if (!coord) return setFormError("Vui lòng chọn vị trí trên bản đồ.");
    if (!fullName.trim()) return setFormError("Vui lòng nhập tên người nhận.");
    if (!PHONE_REGEX.test(phone.trim()))
      return setFormError("Số điện thoại không đúng định dạng di động Việt Nam (10 số).");
    if (!address.trim()) return setFormError("Vui lòng nhập địa chỉ chi tiết.");

    resolvedRef.current = false;
    bookingIdRef.current = null;
    setSearch({ radiusKm: RADII[0] });
    void runRoundsImpl();
  };

  // Vòng lặp quét thợ (bản dùng thật). Mỗi vòng: bắn yêu cầu → nếu có thợ thì chờ 30s,
  // nếu vòng rỗng thì nới ngay; hết mọi vòng mà chưa ai nhận thì báo không có thợ.
  const runRoundsImpl = async () => {
    for (let idx = 0; idx < RADII.length; idx++) {
      if (resolvedRef.current) return;
      const radiusKm = RADII[idx];
      let taskerCount = 0;
      let waitSeconds = 30;
      try {
        if (idx === 0) {
          const res = await bookingApi.createEmergencyBooking({
            serviceId: serviceId!,
            latitude: coord!.lat,
            longitude: coord!.lng,
            fullName: fullName.trim(),
            phone: phone.trim(),
            addressLine: address.trim(),
            provinceCode: savedAddr?.provinceCode || undefined,
            districtCode: savedAddr?.districtCode || undefined,
            wardCode: savedAddr?.wardCode || undefined,
            note: note.trim() || undefined,
          });
          bookingIdRef.current = res.bookingId;
          taskerCount = res.taskers.length;
          waitSeconds = res.expiresInSeconds;
          disposeHubRef.current = await connectEmergencyCustomer({
            onStatus: (bookingId, status) => {
              if (bookingId === res.bookingId && status === 1 && !resolvedRef.current) {
                resolvedRef.current = true;
                cleanup();
                setSearch(null);
                notify.success("Thợ đã nhận đơn! Đang chuyển tới theo dõi đơn.");
                onNavigate("bookingManagement");
              }
            },
            onDeclined: () => {}, // broadcast: bỏ qua từ chối lẻ
          });
        } else {
          const res = await bookingApi.rebroadcastEmergencyBooking(bookingIdRef.current!, radiusKm);
          taskerCount = res.taskers.length;
          waitSeconds = res.expiresInSeconds;
        }
      } catch (err) {
        resolvedRef.current = true;
        cleanup();
        setSearch(null);
        notify.error(getErrorMessage(err));
        return;
      }

      if (resolvedRef.current) return;
      setSearch({ radiusKm });

      // Vòng rỗng → nới ngay sang bán kính lớn hơn.
      if (taskerCount === 0) continue;

      // Có thợ → chờ tối đa 30s cho ai đó nhận (accept do SignalR xử lý, sẽ dừng vòng).
      await waitRound(waitSeconds);
      if (resolvedRef.current) return;
    }

    // Hết mọi bán kính mà chưa ai nhận.
    await finishNoTasker();
  };

  const cancelSearch = async () => {
    resolvedRef.current = true;
    cleanup();
    const id = bookingIdRef.current;
    setSearch(null);
    if (id != null) {
      try {
        await bookingApi.cancelEmergencyBooking(id);
      } catch {
        /* ignore */
      }
    }
  };

  const selectedService = useMemo(
    () => services.find((s) => s.serviceId === serviceId),
    [services, serviceId],
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full relative">
      <TopBar title="Gọi thợ khẩn cấp" onBack={goBack} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-3 flex items-start gap-2">
          <Siren className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">
            Hệ thống sẽ gửi yêu cầu tới <b>tất cả thợ đang rảnh</b> gần bạn (bắt đầu {RADII[0]}km, tự
            nới rộng nếu chưa có ai nhận). Thợ nào nhận trước sẽ tới. Thanh toán tiền mặt sau khi hoàn
            thành.
          </p>
        </div>

        {/* Service */}
        <div className="bg-white rounded-2xl p-4 space-y-2">
          <label className="text-sm font-bold text-foreground">Bạn cần dịch vụ gì gấp?</label>
          {loadingServices ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Đang tải dịch vụ...
            </div>
          ) : (
            <select
              value={serviceId ?? ""}
              onChange={(e) => setServiceId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">-- Chọn dịch vụ --</option>
              {services.map((s) => (
                <option key={s.serviceId} value={s.serviceId}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl p-4 space-y-2">
          <label className="text-sm font-bold text-foreground">Vị trí của bạn</label>
          <Suspense
            fallback={
              <div className="h-48 rounded-xl bg-muted flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <LocationPicker
              value={coord}
              onChange={(lat, lng) => void handleMapPick(lat, lng)}
              fallbackQuery={address}
            />
          </Suspense>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl p-4 space-y-3">
          <h3 className="font-bold text-foreground">Thông tin liên hệ</h3>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Người nhận</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Số điện thoại</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="0901234567"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Địa chỉ chi tiết</label>
            <input
              value={address}
              onChange={(e) => handleAddressType(e.target.value)}
              className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="123 Lê Lợi, Quận 1, TP.HCM"
            />
            <p className="text-[11px] text-muted-foreground">
              Chọn vị trí trên bản đồ sẽ tự điền địa chỉ, và ngược lại.
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Ghi chú (tuỳ chọn)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="VD: đường ống nước vỡ, cần gấp"
            />
          </div>
        </div>

        {formError && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            {formError}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-white border-t border-border px-4 py-4">
        <button
          onClick={startEmergency}
          className="w-full py-3.5 bg-red-500 text-white rounded-xl font-bold text-base hover:bg-red-600 transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2"
        >
          <Siren className="w-5 h-5" />
          Gọi thợ khẩn cấp
        </button>
      </div>

      {/* Waiting / searching overlay */}
      {search && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center space-y-4">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-red-100" />
              <div className="absolute inset-0 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-extrabold text-red-500">{secondsLeft}</span>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground flex items-center justify-center gap-1.5">
                <Radar className="w-4 h-4 text-red-500" />
                Đang tìm thợ trong {search.radiusKm}km…
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Đã gửi yêu cầu tới các thợ đang rảnh gần bạn
                {selectedService ? ` cho ${selectedService.name}` : ""}. Thợ nào nhận trước sẽ tới.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Phone className="w-3.5 h-3.5" /> {phone}
            </div>
            <button
              onClick={() => void cancelSearch()}
              className="w-full py-2.5 border border-border rounded-xl text-sm font-semibold flex items-center justify-center gap-1 hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" /> Huỷ yêu cầu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
