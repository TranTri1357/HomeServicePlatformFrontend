import { useCallback, useEffect, useMemo, useState } from "react";
import { Wrench, Star, AlertCircle, Check, MapPin, Loader2, Plus, Search } from "lucide-react";
import type {
  Screen,
  CustomerAddress,
  CreateBookingInput,
  BookingItemInput,
  TaskerServiceOption,
  AvailabilitySlot,
  ServiceTaskerSuggestion,
  PagedResult,
} from "@/shared/types";
import { serviceApi, addressApi, taskerApi, bookingApi, customerApi } from "@/services/api";
import { useGoBack } from "@/app/routes/useGoBack";
import { useApi, useInfiniteList, useAreaLabels } from "@/shared/hooks";
import { useAuth } from "@/app/providers";
import { TopBar, Avatar } from "@/shared/ui";
import { formatVnd, notify, getErrorMessage, getApiAssetUrl } from "@/shared/lib";

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const DEFAULT_TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
const PHONE_REGEX = /^(03|05|07|08|09)\d{8}$/;


const LEAD_TIME_MINUTES = 60;

const SERVICE_VISIBLE_LIMIT = 10;
const SERVICE_SEARCH_THRESHOLD = 8;


function toDateParam(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}


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
  
  const [time, setTime] = useState("");

  
  
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  
  const earliestStart = now + LEAD_TIME_MINUTES * 60_000;

  
  const slotStartMs = useCallback(
    (value: string) => {
      const d = new Date(dateOptions[dateIdx]);
      const [h, m] = value.split(":").map(Number);
      d.setHours(h, m, 0, 0);
      return d.getTime();
    },
    [dateOptions, dateIdx],
  );

  
  
  useEffect(() => {
    if (time && slotStartMs(time) < earliestStart) setTime("");
  }, [time, slotStartMs, earliestStart]);
  
  const [taskerId, setTaskerId] = useState<number | undefined>(data?.taskerId);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  
  const [serviceOptions, setServiceOptions] = useState<TaskerServiceOption[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  
  const [serviceSearch, setServiceSearch] = useState("");
  const [showAllServices, setShowAllServices] = useState(false);

  
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [hasSchedule, setHasSchedule] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  
  const { data: savedAddresses = [] } = useApi(() => addressApi.getMyAddresses(), {
    initialData: [],
  });
  const [savedAddr, setSavedAddr] = useState<CustomerAddress | null>(null);

  
  
  const destLat = savedAddr?.latitude;
  const destLng = savedAddr?.longitude;

  const pickSavedAddress = (addr: CustomerAddress) => {
    setSavedAddr(addr);
    setAddress(addr.addressLine);
    setTime(""); 
  };

  
  useEffect(() => {
    let alive = true;
    customerApi
      .getCustomerProfile()
      .then((p) => {
        if (!alive) return;
        if (p.phone) setPhone((prev) => prev || p.phone);
        if (p.fullName) setFullName((prev) => prev || p.fullName);
      })
      .catch(() => {
        
      });
    return () => {
      alive = false;
    };
  }, []);

  
  useEffect(() => {
    if (savedAddr || savedAddresses.length === 0) return;
    const def = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
    if (def) {
      setSavedAddr(def);
      setAddress(def.addressLine);
    }
  }, [savedAddresses, savedAddr]);

  
  
  
  
  
  const destProvince = savedAddr?.provinceCode ?? undefined;
  const fetchTaskerPage = useCallback(
    (page: number): Promise<PagedResult<ServiceTaskerSuggestion>> =>
      serviceId == null
        ? Promise.resolve({
            items: [],
            totalCount: 0,
            pageIndex: page,
            pageSize: 5,
            totalPages: 0,
            hasPreviousPage: false,
            hasNextPage: false,
          })
        : taskerApi.getTaskersByService(serviceId, page, 5, {
            provinceCode: destProvince,
            lat: destLat,
            lng: destLng,
          }),
    [serviceId, destProvince, destLat, destLng],
  );
  const {
    items: taskerItems,
    hasNext: hasMoreTaskers,
    loading: loadingTaskers,
    loadingMore: loadingMoreTaskers,
    loadMore: loadMoreTaskers,
  } = useInfiniteList(fetchTaskerPage);

  
  
  const [pinnedTasker, setPinnedTasker] = useState<ServiceTaskerSuggestion | null>(null);
  useEffect(() => {
    const pre = data?.taskerId;
    if (pre == null || serviceId == null) return;
    let alive = true;
    taskerApi
      .getServiceTaskerCard(serviceId, pre, { lat: destLat, lng: destLng })
      .then((card) => alive && setPinnedTasker(card))
      .catch(() => {
        
      });
    return () => {
      alive = false;
    };
  }, [data?.taskerId, serviceId, destLat, destLng]);

  
  const displayedTaskers = useMemo(
    () =>
      pinnedTasker
        ? [pinnedTasker, ...taskerItems.filter((t) => t.taskerId !== pinnedTasker.taskerId)]
        : taskerItems,
    [pinnedTasker, taskerItems],
  );

  
  const areaLabel = useAreaLabels(useMemo(
    () => displayedTaskers.map((t) => t.provinceCode),
    [displayedTaskers],
  ));

  
  
  const selectedTasker = displayedTaskers.find((t) => t.taskerId === taskerId);
  const taskerOutOfProvince = Boolean(
    selectedTasker?.provinceCode && destProvince && selectedTasker.provinceCode !== destProvince,
  );

  
  useEffect(() => {
    
    setServiceSearch("");
    setShowAllServices(false);
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

  
  useEffect(() => {
    if (taskerId == null) {
      setSlots([]);
      setHasSchedule(true);
      return;
    }
    let alive = true;
    setLoadingSlots(true);
    
    taskerApi
      .getTaskerAvailability(taskerId, toDateParam(dateOptions[dateIdx]), destLat, destLng)
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
  }, [taskerId, dateIdx, dateOptions, destLat, destLng]);

  
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

  const hasTasker = taskerId != null;

  
  const chosenServices: TaskerServiceOption[] = hasTasker
    ? serviceOptions.filter((o) => selectedServiceIds.includes(o.serviceId))
    : [];
  const orderedServices = [
    ...chosenServices.filter((s) => s.serviceId === serviceId),
    ...chosenServices.filter((s) => s.serviceId !== serviceId),
  ];

  
  
  const kw = serviceSearch.trim().toLowerCase();
  const matchedServices = serviceOptions
    .filter(
      (o) =>
        o.serviceId === serviceId ||
        !kw ||
        o.serviceName.toLowerCase().includes(kw) ||
        o.categoryName.toLowerCase().includes(kw),
    )
    
    .sort((a, b) =>
      a.serviceId === serviceId ? -1 : b.serviceId === serviceId ? 1 : 0,
    );
  const visibleServices = showAllServices
    ? matchedServices
    : matchedServices.slice(0, SERVICE_VISIBLE_LIMIT);
  const hiddenServiceCount = matchedServices.length - visibleServices.length;

  
  
  const estimatedTotal = hasTasker
    ? orderedServices.reduce((sum, s) => sum + s.price, 0)
    : detail.startingPrice;

  const toggleService = (sid: number) => {
    if (sid === serviceId) return; 
    setSelectedServiceIds((prev) =>
      prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid],
    );
  };

  
  
  
  const timeChoices = (
    hasTasker
      ? slots.map((s) => ({ label: hhmm(s.time), value: hhmm(s.time), isFree: s.isFree }))
      : DEFAULT_TIME_SLOTS.map((t) => ({ label: t, value: t, isFree: true }))
  ).map((t) => {
    const past = slotStartMs(t.value) < earliestStart;
    return { ...t, past, free: t.isFree && !past };
  });

  
  const allSlotsPast = timeChoices.length > 0 && timeChoices.every((t) => t.past);

  
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

    if (slotStartMs(time) < Date.now() + LEAD_TIME_MINUTES * 60_000)
      return setFormError(
        `Vui lòng đặt trước ít nhất ${LEAD_TIME_MINUTES} phút. Hãy chọn khung giờ muộn hơn.`,
      );

    
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
      
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Đặt lịch dịch vụ" onBack={goBack} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {}
        <div className="bg-white rounded-2xl p-4 flex gap-3">
          {detail.imageUrl ? (
            <img
              src={getApiAssetUrl(detail.imageUrl)}
              alt={detail.name}
              className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-blue-50"
            />
          ) : (
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Wrench className="w-7 h-7 text-blue-600" />
            </div>
          )}
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

        {}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-1">Chọn thợ</h3>
          <p className="text-xs text-muted-foreground mb-3">
            {destProvince
              ? "Chỉ hiện thợ trong cùng tỉnh/thành với địa chỉ bạn đặt."
              : "Chọn một địa chỉ đã lưu ở dưới để chỉ hiện thợ gần bạn."}
          </p>

          {taskerOutOfProvince && (
            <div className="mb-3 p-3 bg-amber-50 text-amber-700 text-xs rounded-xl border border-amber-100">
              Thợ bạn chọn ở tỉnh/thành khác với địa chỉ đặt. Thợ có thể không nhận đơn vì quá xa —
              cân nhắc chọn thợ trong danh sách bên dưới.
            </div>
          )}
          <div className="space-y-2">
            {loadingTaskers && displayedTaskers.length === 0 ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
              ))
            ) : displayedTaskers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                {destProvince
                  ? "Chưa có thợ nào nhận dịch vụ này ở khu vực của bạn. Thử đổi địa chỉ đặt hoặc chọn dịch vụ khác."
                  : "Hiện chưa có thợ nào nhận dịch vụ này. Vui lòng chọn dịch vụ khác."}
              </p>
            ) : (
              displayedTaskers.map((t) => (
                <button
                  key={t.taskerId}
                  onClick={() => setTaskerId(t.taskerId)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                    taskerId === t.taskerId
                      ? "border-blue-600 bg-accent"
                      : "border-transparent bg-muted"
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
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-sm text-foreground">{t.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.experienceYears} năm KN
                      {t.currentPrice > 0 && <> · {formatVnd(t.currentPrice)}đ</>}
                    </p>
                    {}
                    {(() => {
                      const area = areaLabel(t.provinceCode, t.districtCode);
                      if (!area && t.distanceKm == null) return null;
                      return (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{area ?? "Chưa rõ khu vực"}</span>
                          {t.distanceKm != null && (
                            <span className="flex-shrink-0 font-medium text-foreground">
                              · ~{t.distanceKm} km
                            </span>
                          )}
                        </p>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold">{t.ratingAvg}</span>
                  </div>
                </button>
              ))
            )}

            {}
            {hasMoreTaskers && (
              <button
                type="button"
                onClick={loadMoreTaskers}
                disabled={loadingMoreTaskers}
                className="mt-1 w-full py-2 rounded-xl border border-border text-sm font-semibold text-blue-600 hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loadingMoreTaskers && <Loader2 className="w-4 h-4 animate-spin" />}
                {loadingMoreTaskers ? "Đang tải..." : "Xem thêm thợ"}
              </button>
            )}
          </div>
        </div>

        {}
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
              <>
                {}
                {serviceOptions.length > SERVICE_SEARCH_THRESHOLD && (
                  <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5 mb-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                      value={serviceSearch}
                      onChange={(e) => {
                        setServiceSearch(e.target.value);
                        setShowAllServices(false);
                      }}
                      className="flex-1 bg-transparent text-sm focus:outline-none"
                      placeholder="Tìm dịch vụ của thợ..."
                    />
                  </div>
                )}
                {matchedServices.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    Không tìm thấy dịch vụ phù hợp.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {visibleServices.map((o) => {
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
                {hiddenServiceCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setShowAllServices(true)}
                    className="mt-2 w-full py-2 rounded-xl border border-border text-sm font-semibold text-blue-600 hover:bg-accent transition-colors"
                  >
                    Xem thêm {hiddenServiceCount} dịch vụ
                  </button>
                ) : showAllServices && matchedServices.length > SERVICE_VISIBLE_LIMIT ? (
                  <button
                    type="button"
                    onClick={() => setShowAllServices(false)}
                    className="mt-2 w-full py-2 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-accent transition-colors"
                  >
                    Thu gọn
                  </button>
                ) : null}
              </>
            )}
          </div>
        )}

        {!hasTasker && (
          <div className="bg-white rounded-2xl p-4 text-center text-sm text-muted-foreground">
            Chọn thợ ở trên để hiện lịch trống và khung giờ làm.
          </div>
        )}

        {}
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
                setTime("");
              }}
              className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123 Lê Lợi, Quận 1, TP.HCM"
            />
            {hasTasker && destLat == null && (
              <p className="text-[11px] text-amber-600">
                Chọn một địa chỉ đã lưu (có ghim bản đồ) để hệ thống loại bỏ khung giờ thợ không kịp di chuyển tới.
              </p>
            )}
          </div>
        </div>

        {}
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

        {}
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
          ) : allSlotsPast ? (
            <p className="text-sm text-amber-600 py-2">
              Đã qua giờ làm việc của thợ hôm nay. Vui lòng chọn ngày khác.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {timeChoices.map((t) => {
                const active = time === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => t.free && setTime((prev) => (prev === t.value ? "" : t.value))}
                    disabled={!t.free}
                    title={
                      t.past
                        ? `Đã qua giờ đặt (cần đặt trước ít nhất ${LEAD_TIME_MINUTES} phút)`
                        : !t.isFree
                          ? "Thợ đã bận khung giờ này"
                          : undefined
                    }
                    className={`py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      active
                        ? "bg-blue-600 text-white"
                        : t.free
                          ? "bg-muted text-foreground hover:bg-accent"
                          : t.past
                            ? "bg-slate-100 text-slate-300 cursor-not-allowed"
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

        {}
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

        {}
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
