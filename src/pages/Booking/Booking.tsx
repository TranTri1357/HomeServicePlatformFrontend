import { useEffect, useMemo, useState } from "react";
import { Wrench, Star, AlertCircle, Check, MapPin, Loader2, Plus } from "lucide-react";
import type {
  Screen,
  CustomerAddress,
  CreateBookingInput,
  BookingItemInput,
  TaskerServiceOption,
  AvailabilitySlot,
} from "@/shared/types";
import { serviceApi, addressApi, taskerApi, bookingApi } from "@/services/api";
import { useGoBack } from "@/app/routes/useGoBack";
import { useApi } from "@/shared/hooks";
import { useAuth } from "@/app/providers";
import { TopBar, Avatar } from "@/shared/ui";
import { formatVnd, notify, getErrorMessage } from "@/shared/lib";

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
// Fallback slots used only when no specific tasker is chosen (system auto-assigns).
const DEFAULT_TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
const PHONE_REGEX = /^(03|05|07|08|09)\d{8}$/;

/** Local date → "yyyy-MM-dd" (VN date, no timezone shift) for the availability API. */
function toDateParam(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** "HH:mm:ss" | "HH:mm" → "HH:mm". */
const hhmm = (t: string) => t.slice(0, 5);

export function Booking({
  onNavigate,
  data,
}: {
  onNavigate: (s: Screen, d?: object) => void;
  data?: { serviceId?: number; taskerId?: number };
}) {
  const serviceId = data?.serviceId;
  const goBack = useGoBack("customerHome");
  const { user } = useAuth();

  const {
    data: detail,
    loading,
    error,
    refetch,
  } = useApi(() => serviceApi.getServiceDetail(serviceId!), {
    immediate: Boolean(serviceId),
  });

  // Next 7 days starting today.
  const dateOptions = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, []);

  const [dateIdx, setDateIdx] = useState(0);
  // Không chọn sẵn khung giờ; khách phải tự chọn (bấm lại để bỏ chọn).
  const [time, setTime] = useState("");
  // Pre-select the tasker when the customer arrived from a technician's profile.
  const [taskerId, setTaskerId] = useState<number | undefined>(data?.taskerId);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Services offered by the chosen tasker (extra services can be added to the order).
  const [serviceOptions, setServiceOptions] = useState<TaskerServiceOption[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // The chosen tasker's free/busy hours for the selected date.
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [hasSchedule, setHasSchedule] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Saved addresses — GET /api/customer/addresses.
  const { data: savedAddresses = [] } = useApi(() => addressApi.getMyAddresses(), {
    initialData: [],
  });
  const [savedAddr, setSavedAddr] = useState<CustomerAddress | null>(null);

  const pickSavedAddress = (addr: CustomerAddress) => {
    setSavedAddr(addr);
    setAddress(addr.addressLine);
  };

  // ── Load the tasker's service options when a specific tasker is picked ───────
  useEffect(() => {
    if (taskerId == null) {
      setServiceOptions([]);
      setSelectedServiceIds([]);
      return;
    }
    let alive = true;
    setLoadingOptions(true);
    taskerApi
      .getTaskerServiceOptions(taskerId)
      .then((opts) => {
        if (!alive) return;
        setServiceOptions(opts);
        // Pre-select the primary service the customer arrived with (if the tasker offers it).
        setSelectedServiceIds(
          opts.some((o) => o.serviceId === serviceId) && serviceId != null ? [serviceId] : [],
        );
      })
      .catch((err) => alive && notify.error(getErrorMessage(err)))
      .finally(() => alive && setLoadingOptions(false));
    return () => {
      alive = false;
    };
  }, [taskerId, serviceId]);

  // ── Load the tasker's availability whenever tasker or date changes ───────────
  useEffect(() => {
    if (taskerId == null) {
      setSlots([]);
      setHasSchedule(true);
      return;
    }
    let alive = true;
    setLoadingSlots(true);
    taskerApi
      .getTaskerAvailability(taskerId, toDateParam(dateOptions[dateIdx]))
      .then((av) => {
        if (!alive) return;
        setHasSchedule(av.hasSchedule);
        setSlots(av.slots);
      })
      .catch((err) => alive && notify.error(getErrorMessage(err)))
      .finally(() => alive && setLoadingSlots(false));
    return () => {
      alive = false;
    };
  }, [taskerId, dateIdx, dateOptions]);

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!serviceId) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm text-muted-foreground">Không xác định được dịch vụ cần đặt.</p>
        <button
          onClick={() => onNavigate("serviceList")}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
        >
          Chọn dịch vụ
        </button>
      </div>
    );
  }

  if (loading && !detail) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Đặt lịch dịch vụ" onBack={goBack} />
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if ((error && !detail) || !detail) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm text-muted-foreground">{error ?? "Không tải được dịch vụ."}</p>
        <button
          onClick={() => void refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const taskers = detail.suggestedTaskers ?? [];
  const hasTasker = taskerId != null;

  // Services actually going on the order, ordered so the primary one comes first.
  const chosenServices: TaskerServiceOption[] = hasTasker
    ? serviceOptions.filter((o) => selectedServiceIds.includes(o.serviceId))
    : [];
  const orderedServices = [
    ...chosenServices.filter((s) => s.serviceId === serviceId),
    ...chosenServices.filter((s) => s.serviceId !== serviceId),
  ];

  // Estimated total: sum of chosen services when a tasker is picked, else the
  // service's starting price (system will assign a tasker & confirm final price).
  const estimatedTotal = hasTasker
    ? orderedServices.reduce((sum, s) => sum + s.price, 0)
    : detail.startingPrice;

  const toggleService = (sid: number) => {
    if (sid === serviceId) return; // primary service stays selected
    setSelectedServiceIds((prev) =>
      prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid],
    );
  };

  // Time slots to render: from the tasker's availability, else the static fallback.
  const timeChoices = hasTasker
    ? slots.map((s) => ({ label: hhmm(s.time), value: hhmm(s.time), free: s.isFree }))
    : DEFAULT_TIME_SLOTS.map((t) => ({ label: t, value: t, free: true }));

  /** Build the (possibly multi-service) booking items, chained sequentially so a
   *  single tasker never has two overlapping items. */
  const buildBookingItems = (): BookingItemInput[] => {
    const base = new Date(dateOptions[dateIdx]);
    const [h, m] = time.split(":").map(Number);
    base.setHours(h, m, 0, 0);
    let cursor = base.getTime();

    if (!hasTasker) {
      const endAt = cursor + (detail.durationMinutes || 60) * 60_000;
      return [
        {
          serviceId: detail.serviceId,
          taskerId: null,
          startAt: new Date(cursor).toISOString(),
          endAt: new Date(endAt).toISOString(),
          unitPrice: detail.startingPrice,
          quantity: 1,
        },
      ];
    }

    return orderedServices.map((s) => {
      const startAt = cursor;
      const endAt = cursor + (s.durationMinutes || 60) * 60_000;
      cursor = endAt;
      return {
        serviceId: s.serviceId,
        taskerId,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        unitPrice: s.price,
        quantity: 1,
      };
    });
  };

  // Create the order (Pending "hold") NOW, then go to payment to check out.
  const handleSubmit = async () => {
    setFormError(null);

    if (!hasTasker) return setFormError("Vui lòng chọn thợ trước khi đặt lịch.");
    if (orderedServices.length === 0)
      return setFormError("Vui lòng chọn ít nhất một dịch vụ của thợ.");
    if (!fullName.trim()) return setFormError("Vui lòng nhập tên người nhận.");
    if (!PHONE_REGEX.test(phone.trim()))
      return setFormError("Số điện thoại không đúng định dạng di động Việt Nam (10 số).");
    if (!address.trim()) return setFormError("Vui lòng nhập địa chỉ chi tiết.");
    if (!time) return setFormError("Vui lòng chọn giờ hẹn.");

    const base = new Date(dateOptions[dateIdx]);
    const [h, m] = time.split(":").map(Number);
    base.setHours(h, m, 0, 0);
    if (base.getTime() <= Date.now())
      return setFormError("Vui lòng chọn thời gian hẹn trong tương lai.");

    // Guard: the chosen slot must be free (when booking a specific tasker).
    if (hasTasker) {
      const slot = timeChoices.find((t) => t.value === time);
      if (!slot || !slot.free)
        return setFormError("Khung giờ này thợ đã bận. Vui lòng chọn khung giờ khác.");
    }

    const useSaved = savedAddr && savedAddr.addressLine === address.trim();

    const input: CreateBookingInput = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine: address.trim(),
      provinceCode: useSaved ? savedAddr!.provinceCode : undefined,
      districtCode: useSaved ? savedAddr!.districtCode : undefined,
      wardCode: useSaved ? savedAddr!.wardCode : undefined,
      latitude: useSaved ? savedAddr!.latitude : undefined,
      longitude: useSaved ? savedAddr!.longitude : undefined,
      note: note.trim() || undefined,
      bookingItems: buildBookingItems(),
    };

    setSubmitting(true);
    try {
      const created = await bookingApi.createBooking(input);
      notify.success("Đã giữ chỗ! Vui lòng thanh toán để xác nhận đơn.");
      onNavigate("payment", {
        bookingId: created.bookingId,
        finalAmount: created.finalAmount,
      });
    } catch (err) {
      // Backend returns a friendly 400 when the slot was just taken (overlap).
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Đặt lịch dịch vụ" onBack={goBack} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Selected service */}
        <div className="bg-white rounded-2xl p-4 flex gap-3">
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Wrench className="w-7 h-7 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground">{detail.name}</p>
            {detail.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                {detail.description}
              </p>
            )}
            <p className="text-blue-600 font-bold text-sm mt-1">
              từ {formatVnd(detail.startingPrice)}đ · ~{detail.durationMinutes} phút
            </p>
          </div>
          <button
            onClick={() => onNavigate("serviceList")}
            className="text-blue-600 text-xs font-semibold flex-shrink-0"
          >
            Đổi
          </button>
        </div>

        {/* Tasker selection */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-1">Chọn thợ</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Vui lòng chọn thợ để tiếp tục chọn ngày và giờ làm.
          </p>
          <div className="space-y-2">
            {taskers.length === 0 && (
              <p className="text-sm text-muted-foreground py-2">
                Hiện chưa có thợ nào nhận dịch vụ này. Vui lòng chọn dịch vụ khác.
              </p>
            )}
            {taskers.map((t) => (
              <button
                key={t.taskerId}
                onClick={() => setTaskerId(t.taskerId)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                  taskerId === t.taskerId ? "border-blue-600 bg-accent" : "border-transparent bg-muted"
                }`}
              >
                {t.avatarUrl ? (
                  <img
                    src={t.avatarUrl}
                    alt={t.fullName}
                    className="rounded-full object-cover"
                    style={{ width: 44, height: 44 }}
                  />
                ) : (
                  <Avatar size={44} name={t.fullName} />
                )}
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm text-foreground">{t.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.experienceYears} năm KN
                    {t.currentPrice > 0 && <> · {formatVnd(t.currentPrice)}đ</>}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold">{t.ratingAvg}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Extra services of the chosen tasker */}
        {hasTasker && (
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-bold text-foreground mb-1">Dịch vụ của thợ</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Chọn thêm dịch vụ khác của thợ này (làm lần lượt sau dịch vụ chính).
            </p>
            {loadingOptions ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang tải dịch vụ...
              </div>
            ) : serviceOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Thợ chưa cấu hình dịch vụ nào.</p>
            ) : (
              <div className="space-y-2">
                {serviceOptions.map((o) => {
                  const active = selectedServiceIds.includes(o.serviceId);
                  const isPrimary = o.serviceId === serviceId;
                  return (
                    <button
                      key={o.serviceId}
                      onClick={() => toggleService(o.serviceId)}
                      disabled={isPrimary}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors ${
                        active ? "border-blue-600 bg-accent" : "border-transparent bg-muted"
                      } ${isPrimary ? "opacity-90" : ""}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                          active ? "bg-blue-600 border-blue-600" : "border-slate-300"
                        }`}
                      >
                        {active ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <Plus className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {o.serviceName}
                          {isPrimary && (
                            <span className="ml-1.5 text-[10px] text-blue-600 font-bold">
                              (dịch vụ chính)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {o.categoryName} · ~{o.durationMinutes} phút
                        </p>
                      </div>
                      <span className="font-bold text-sm text-blue-600 flex-shrink-0">
                        {formatVnd(o.price)}đ
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!hasTasker && (
          <div className="bg-white rounded-2xl p-4 text-center text-sm text-muted-foreground">
            Chọn thợ ở trên để hiện lịch trống và khung giờ làm.
          </div>
        )}

        {/* Date */}
        {hasTasker && (
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-3">Chọn ngày</h3>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {dateOptions.map((d, i) => (
              <button
                key={i}
                onClick={() => setDateIdx(i)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 w-14 py-3 rounded-xl transition-colors ${dateIdx === i ? "bg-blue-600 text-white" : "bg-muted text-foreground"}`}
              >
                <span
                  className={`text-[11px] font-medium ${dateIdx === i ? "text-blue-200" : "text-muted-foreground"}`}
                >
                  {WEEKDAYS[d.getDay()]}
                </span>
                <span className="text-base font-bold">{d.getDate()}</span>
                <span
                  className={`text-[10px] ${dateIdx === i ? "text-blue-200" : "text-muted-foreground"}`}
                >
                  Th{d.getMonth() + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
        )}

        {/* Time */}
        {hasTasker && (
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-3">Chọn giờ</h3>
          {hasTasker && loadingSlots ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Đang tải khung giờ...
            </div>
          ) : hasTasker && !hasSchedule ? (
            <p className="text-sm text-amber-600 py-2">Thợ không làm việc vào ngày này. Chọn ngày khác.</p>
          ) : hasTasker && timeChoices.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">Không có khung giờ trống trong ngày này.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {timeChoices.map((t) => {
                const active = time === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => t.free && setTime((prev) => (prev === t.value ? "" : t.value))}
                    disabled={!t.free}
                    className={`py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      active
                        ? "bg-blue-600 text-white"
                        : t.free
                          ? "bg-muted text-foreground hover:bg-accent"
                          : "bg-slate-100 text-slate-300 line-through cursor-not-allowed"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        )}

        {/* Contact & address (required by backend) */}
        <div className="bg-white rounded-2xl p-4 space-y-3">
          <h3 className="font-bold text-foreground">Thông tin liên hệ</h3>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Người nhận</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Số điện thoại</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0901234567"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Địa chỉ chi tiết</label>
            {savedAddresses.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {savedAddresses.map((addr) => {
                  const active = savedAddr?.addressId === addr.addressId;
                  return (
                    <button
                      key={addr.addressId}
                      type="button"
                      onClick={() => pickSavedAddress(addr)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${active ? "border-blue-600 bg-accent text-blue-600" : "border-border bg-muted text-foreground"}`}
                    >
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="max-w-[160px] truncate">{addr.addressLine}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] text-green-600 font-semibold">Mặc định</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            <input
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setSavedAddr(null);
              }}
              className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123 Lê Lợi, Quận 1, TP.HCM"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-2">Ghi chú cho thợ</h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-muted rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            placeholder="VD: Chuông cửa tầng 3, ưu tiên đến trước 10h..."
          />
        </div>

        {/* Cost summary */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-3">Tóm tắt chi phí</h3>
          <div className="space-y-2">
            {hasTasker && orderedServices.length > 0 ? (
              orderedServices.map((s) => (
                <div key={s.serviceId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate mr-2">{s.serviceName}</span>
                  <span className="font-semibold text-foreground flex-shrink-0">
                    {formatVnd(s.price)}đ
                  </span>
                </div>
              ))
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Đơn giá dịch vụ</span>
                <span className="font-semibold text-foreground">{formatVnd(estimatedTotal)}đ</span>
              </div>
            )}
            <div className="h-px bg-border my-1" />
            <div className="flex justify-between">
              <span className="font-bold text-foreground">Tạm tính</span>
              <span className="font-extrabold text-blue-600 text-lg">
                {formatVnd(estimatedTotal)}đ
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Đơn sẽ được giữ chỗ 15 phút; vui lòng thanh toán để xác nhận với thợ.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-border px-4 py-4">
        {formError && (
          <div className="mb-3 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            {formError}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 bg-blue-600 disabled:opacity-70 text-white rounded-xl font-bold text-base hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
          {submitting ? "Đang giữ chỗ..." : "Đặt lịch · Tiếp tục thanh toán →"}
        </button>
      </div>
    </div>
  );
}
