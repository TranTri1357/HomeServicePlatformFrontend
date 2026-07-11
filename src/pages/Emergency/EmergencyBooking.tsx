import { useEffect, useMemo, useRef, useState } from "react";
import { Siren, Star, Loader2, AlertCircle, Phone, MapPin, X } from "lucide-react";
import type { Screen, NearbyTasker, TaskerQuickInfo, CustomerAddress } from "@/shared/types";
import { serviceApi, taskerApi, addressApi, bookingApi } from "@/services/api";
import { connectEmergencyCustomer } from "@/services/realtime/bookingHub";
import { useApi } from "@/shared/hooks";
import { useAuth } from "@/app/providers";
import { useGoBack } from "@/app/routes/useGoBack";
import { TopBar, Avatar } from "@/shared/ui";
import { formatVnd, notify, getErrorMessage } from "@/shared/lib";
import { LocationPicker } from "@/pages/Address/LocationPicker";
import { geocodeAddress, reverseGeocode } from "@/services/vnAddress";

const RADIUS_KM = 5;
const PHONE_REGEX = /^(03|05|07|08|09)\d{8}$/;

/** A nearby tasker enriched with name/price from quick-info. */
type EmergencyTasker = NearbyTasker & Partial<TaskerQuickInfo>;

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

  const [step, setStep] = useState<"setup" | "taskers">("setup");

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
  // No feedback loop: picking on the map updates the text via reverse geocoding
  // (programmatic setAddress does NOT fire the input's onChange), while typing
  // forward-geocodes to move the pin (programmatic setCoord does NOT fire the
  // map's onChange).
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

  // ── Nearby taskers (loaded when entering the "taskers" step) ─────────────────
  const [taskers, setTaskers] = useState<EmergencyTasker[]>([]);
  const [loadingTaskers, setLoadingTaskers] = useState(false);
  const [taskersError, setTaskersError] = useState<string | null>(null);

  const loadTaskers = async () => {
    if (serviceId == null || !coord) return;
    setLoadingTaskers(true);
    setTaskersError(null);
    try {
      const nearby = await taskerApi.getNearbyTaskers({
        serviceId,
        lat: coord.lat,
        lng: coord.lng,
        radius: RADIUS_KM,
      });
      // Only free taskers (status 1); enrich each with name + price.
      const free = nearby.filter((t) => t.status === 1);
      const enriched = await Promise.all(
        free.map(async (t) => {
          try {
            const info = await taskerApi.getTaskerQuickInfo(t.taskerId, serviceId);
            return { ...t, ...info } as EmergencyTasker;
          } catch {
            return t as EmergencyTasker;
          }
        }),
      );
      enriched.sort((a, b) => a.distanceKm - b.distanceKm);
      setTaskers(enriched);
    } catch (err) {
      setTaskersError(getErrorMessage(err));
    } finally {
      setLoadingTaskers(false);
    }
  };

  const goToTaskers = () => {
    setFormError(null);
    if (serviceId == null) return setFormError("Vui lòng chọn dịch vụ cần gấp.");
    if (!coord) return setFormError("Vui lòng chọn vị trí trên bản đồ.");
    if (!fullName.trim()) return setFormError("Vui lòng nhập tên người nhận.");
    if (!PHONE_REGEX.test(phone.trim()))
      return setFormError("Số điện thoại không đúng định dạng di động Việt Nam (10 số).");
    if (!address.trim()) return setFormError("Vui lòng nhập địa chỉ chi tiết.");
    setStep("taskers");
    void loadTaskers();
  };

  // ── Sending + waiting for a tasker to accept ─────────────────────────────────
  const [pending, setPending] = useState<{ bookingId: number; taskerName: string } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [sending, setSending] = useState(false);
  const disposeRef = useRef<(() => void) | null>(null);

  const cleanupWaiting = () => {
    disposeRef.current?.();
    disposeRef.current = null;
  };
  useEffect(() => cleanupWaiting, []); // dispose on unmount

  const sendRequest = async (t: EmergencyTasker) => {
    if (serviceId == null || !coord) return;
    const price = t.currentPrice ?? 0;
    if (price <= 0) return notify.error("Thợ chưa cấu hình giá cho dịch vụ này.");
    setSending(true);
    try {
      const res = await bookingApi.createEmergencyBooking({
        serviceId,
        taskerId: t.taskerId,
        latitude: coord.lat,
        longitude: coord.lng,
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine: address.trim(),
        provinceCode: savedAddr?.provinceCode || undefined,
        districtCode: savedAddr?.districtCode || undefined,
        wardCode: savedAddr?.wardCode || undefined,
        unitPrice: price,
        note: note.trim() || undefined,
      });

      setPending({ bookingId: res.bookingId, taskerName: t.fullName ?? "thợ" });
      setSecondsLeft(res.expiresInSeconds);

      // Listen for accept / decline in realtime.
      cleanupWaiting();
      disposeRef.current = await connectEmergencyCustomer({
        onStatus: (bookingId, status) => {
          if (bookingId === res.bookingId && status === 1) {
            cleanupWaiting();
            setPending(null);
            notify.success("Thợ đã nhận đơn! Đang chuyển tới theo dõi đơn.");
            onNavigate("bookingManagement");
          }
        },
        onDeclined: (bookingId) => {
          if (bookingId === res.bookingId) {
            cleanupWaiting();
            setPending(null);
            notify.error("Thợ đã từ chối. Vui lòng chọn thợ khác.");
            void loadTaskers();
          }
        },
      });
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  // Countdown; on expiry, cancel the request and let the customer pick another.
  useEffect(() => {
    if (!pending) return;
    if (secondsLeft <= 0) {
      cleanupWaiting();
      const id = pending.bookingId;
      setPending(null);
      void bookingApi.cancelEmergencyBooking(id).catch(() => {});
      notify.error("Thợ không phản hồi trong 30 giây. Vui lòng chọn thợ khác.");
      void loadTaskers();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, secondsLeft]);

  const cancelWaiting = async () => {
    if (!pending) return;
    const id = pending.bookingId;
    cleanupWaiting();
    setPending(null);
    try {
      await bookingApi.cancelEmergencyBooking(id);
    } catch {
      /* ignore */
    }
  };

  const selectedService = useMemo(
    () => services.find((s) => s.serviceId === serviceId),
    [services, serviceId],
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full relative">
      <TopBar
        title="Gọi thợ khẩn cấp"
        onBack={step === "taskers" ? () => setStep("setup") : goBack}
      />

      {step === "setup" ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-3 flex items-start gap-2">
            <Siren className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">
              Gửi yêu cầu trực tiếp tới 1 thợ đang rảnh gần bạn (trong {RADIUS_KM}km). Thợ có 30 giây
              để nhận. Thanh toán tiền mặt sau khi hoàn thành.
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
            <LocationPicker
              value={coord}
              onChange={(lat, lng) => void handleMapPick(lat, lng)}
              fallbackQuery={address}
            />
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
      ) : (
        // ── Taskers step ──────────────────────────────────────────────────────
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Thợ đang rảnh trong {RADIUS_KM}km cho <b>{selectedService?.name}</b>:
          </p>
          {loadingTaskers ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-10">
              <Loader2 className="w-5 h-5 animate-spin" /> Đang quét thợ gần bạn...
            </div>
          ) : taskersError ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-sm text-muted-foreground">{taskersError}</p>
              <button
                onClick={() => void loadTaskers()}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
              >
                Thử lại
              </button>
            </div>
          ) : taskers.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <MapPin className="w-8 h-8 text-slate-300" />
              <p className="text-sm text-muted-foreground">
                Không có thợ nào đang rảnh gần bạn cho dịch vụ này.
              </p>
              <button
                onClick={() => void loadTaskers()}
                className="mt-1 px-4 py-2 border border-border rounded-xl text-sm font-semibold"
              >
                Quét lại
              </button>
            </div>
          ) : (
            taskers.map((t) => (
              <div
                key={t.taskerId}
                className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3"
              >
                <Avatar size={48} name={t.fullName ?? "Thợ"} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">
                    {t.fullName ?? "Thợ dịch vụ"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {t.ratingAvg}
                    </span>
                    <span>· {t.distanceKm} km</span>
                  </div>
                  {t.currentPrice != null && t.currentPrice > 0 && (
                    <p className="text-sm font-bold text-blue-600 mt-0.5">
                      {formatVnd(t.currentPrice)}đ
                    </p>
                  )}
                </div>
                <button
                  onClick={() => void sendRequest(t)}
                  disabled={sending}
                  className="px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center gap-1"
                >
                  <Siren className="w-4 h-4" />
                  Gọi
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Footer CTA (setup step) */}
      {step === "setup" && (
        <div className="bg-white border-t border-border px-4 py-4">
          <button
            onClick={goToTaskers}
            className="w-full py-3.5 bg-red-500 text-white rounded-xl font-bold text-base hover:bg-red-600 transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2"
          >
            <Siren className="w-5 h-5" />
            Tìm thợ khẩn cấp gần đây
          </button>
        </div>
      )}

      {/* Waiting overlay */}
      {pending && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center space-y-4">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-red-100" />
              <div className="absolute inset-0 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-extrabold text-red-500">{secondsLeft}</span>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground">Đang chờ {pending.taskerName} phản hồi…</p>
              <p className="text-sm text-muted-foreground mt-1">
                Đã gửi yêu cầu khẩn cấp. Thợ có 30 giây để nhận đơn.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Phone className="w-3.5 h-3.5" /> {phone}
            </div>
            <button
              onClick={() => void cancelWaiting()}
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
