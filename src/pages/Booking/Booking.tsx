import { useMemo, useState } from "react";
import { Wrench, Star, AlertCircle, Check, MapPin } from "lucide-react";
import type { Screen, CustomerAddress, CreateBookingInput } from "@/shared/types";
import { serviceApi, addressApi } from "@/services/api";
import { useApi } from "@/shared/hooks";
import { useAuth } from "@/app/providers";
import { TopBar, Avatar } from "@/shared/ui";
import { formatVnd } from "@/shared/lib";

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
const PHONE_REGEX = /^(03|05|07|08|09)\d{8}$/;

export function Booking({
  onNavigate,
  data,
}: {
  onNavigate: (s: Screen, d?: object) => void;
  data?: { serviceId?: number };
}) {
  const serviceId = data?.serviceId;
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
  const [time, setTime] = useState("09:00");
  const [taskerId, setTaskerId] = useState<number | undefined>(undefined);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Saved addresses — GET /api/customer/addresses. `savedAddr` keeps the picked
  // one so we can forward its ward/district codes + coordinates on submit.
  const { data: savedAddresses = [] } = useApi(() => addressApi.getMyAddresses(), {
    initialData: [],
  });
  const [savedAddr, setSavedAddr] = useState<CustomerAddress | null>(null);

  const pickSavedAddress = (addr: CustomerAddress) => {
    setSavedAddr(addr);
    setAddress(addr.addressLine);
  };

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
        <TopBar title="Đặt lịch dịch vụ" onBack={() => onNavigate("serviceDetail", { serviceId })} />
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
  const selectedTasker = taskers.find((t) => t.taskerId === taskerId);
  const unitPrice =
    selectedTasker && selectedTasker.currentPrice > 0
      ? selectedTasker.currentPrice
      : detail.startingPrice;

  const buildStartAt = () => {
    const d = new Date(dateOptions[dateIdx]);
    const [h, m] = time.split(":").map(Number);
    d.setHours(h, m, 0, 0);
    return d;
  };

  // Validate the form and forward a booking *draft* to the payment screen.
  // The order itself is created there, only when the customer confirms payment.
  const handleSubmit = () => {
    setFormError(null);

    if (!fullName.trim()) return setFormError("Vui lòng nhập tên người nhận.");
    if (!PHONE_REGEX.test(phone.trim()))
      return setFormError("Số điện thoại không đúng định dạng di động Việt Nam (10 số).");
    if (!address.trim()) return setFormError("Vui lòng nhập địa chỉ chi tiết.");

    const startAt = buildStartAt();
    if (startAt.getTime() <= Date.now())
      return setFormError("Vui lòng chọn thời gian hẹn trong tương lai.");
    const endAt = new Date(startAt.getTime() + (detail.durationMinutes || 60) * 60_000);

    // Attach ward/district codes + coordinates only when the field still holds
    // the picked saved address (user hasn't retyped it).
    const useSaved = savedAddr && savedAddr.addressLine === address.trim();

    const draft: CreateBookingInput = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine: address.trim(),
      provinceCode: useSaved ? savedAddr!.provinceCode : undefined,
      districtCode: useSaved ? savedAddr!.districtCode : undefined,
      wardCode: useSaved ? savedAddr!.wardCode : undefined,
      latitude: useSaved ? savedAddr!.latitude : undefined,
      longitude: useSaved ? savedAddr!.longitude : undefined,
      note: note.trim() || undefined,
      bookingItems: [
        {
          serviceId: detail.serviceId,
          taskerId: taskerId ?? null,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          unitPrice,
          quantity: 1,
        },
      ],
    };

    // Estimated total (discount is applied server-side; 0 here).
    const estimatedAmount = unitPrice;
    onNavigate("payment", { draft, estimatedAmount });
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Đặt lịch dịch vụ" onBack={() => onNavigate("serviceDetail", { serviceId })} />

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
          <h3 className="font-bold text-foreground mb-3">Chọn thợ</h3>
          <div className="space-y-2">
            <button
              onClick={() => setTaskerId(undefined)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                taskerId === undefined ? "border-blue-600 bg-accent" : "border-transparent bg-muted"
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Wrench className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm text-foreground">Để hệ thống chọn thợ</p>
                <p className="text-xs text-muted-foreground">Tự động tìm thợ phù hợp nhất</p>
              </div>
              {taskerId === undefined && <Check className="w-4 h-4 text-blue-600" />}
            </button>

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

        {/* Date */}
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

        {/* Time */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-3">Chọn giờ</h3>
          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((t) => (
              <button
                key={t}
                onClick={() => setTime(t)}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-colors ${time === t ? "bg-blue-600 text-white" : "bg-muted text-foreground hover:bg-accent"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

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
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Đơn giá dịch vụ</span>
              <span className="font-semibold text-foreground">{formatVnd(unitPrice)}đ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Số lượng</span>
              <span className="font-semibold text-foreground">1</span>
            </div>
            <div className="h-px bg-border my-1" />
            <div className="flex justify-between">
              <span className="font-bold text-foreground">Tạm tính</span>
              <span className="font-extrabold text-blue-600 text-lg">{formatVnd(unitPrice)}đ</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Tổng cuối cùng sẽ được xác nhận sau khi hệ thống xử lý đơn.
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
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-base hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          Tiếp tục thanh toán →
        </button>
      </div>
    </div>
  );
}
