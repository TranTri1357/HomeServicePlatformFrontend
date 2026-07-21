import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Settings,
  CalendarOff,
  Loader2,
  Check,
} from "lucide-react";
import type { WeeklyScheduleInput } from "@/shared/types";
import { scheduleApi } from "@/services/api";
import { useGoBack } from "@/app/routes/useGoBack";
import { useApi } from "@/shared/hooks";
import { TopBar } from "@/shared/ui";
import { notify, getErrorMessage } from "@/shared/lib";
import { useTaskerApproval, TaskerApprovalNotice } from "@/components/TaskerApprovalGate";

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]; 
const MONTHS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const SETUP_DAYS = [
  { label: "T2", dow: 1 },
  { label: "T3", dow: 2 },
  { label: "T4", dow: 3 },
  { label: "T5", dow: 4 },
  { label: "T6", dow: 5 },
  { label: "T7", dow: 6 },
  { label: "CN", dow: 0 },
];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); 

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function mondayOf(d: Date): Date {
  const r = new Date(d);
  const dow = r.getDay(); 
  const diff = dow === 0 ? -6 : 1 - dow; 
  return addDays(r, diff);
}
const hhmm = (t: string) => t.slice(0, 5);

const SLOT_STYLE: Record<number, { cls: string; label?: string }> = {
  0: { cls: "bg-green-50 text-green-700 border border-green-200" },
  1: { cls: "bg-blue-600 text-white", label: "Đã đặt" },
  2: { cls: "bg-slate-200 text-slate-500", label: "Nghỉ" },
};

export function ProviderSchedule() {
  const goBack = useGoBack("providerDashboard");
  const approval = useTaskerApproval();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const isoDate = toISODate(selectedDate);

  const weekDays = useMemo(() => {
    const start = mondayOf(selectedDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [selectedDate]);

  const { data: schedule, loading, error, refetch } = useApi(
    () => scheduleApi.getDailySchedule(isoDate),
    { immediate: false },
  );
  
  useEffect(() => {
    if (approval.approved) void refetch();

  }, [isoDate, approval.approved]);

  
  const [showSetup, setShowSetup] = useState(false);
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]); 
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(17);
  const [savingSetup, setSavingSetup] = useState(false);

  const [markingOff, setMarkingOff] = useState(false);

  const slots = schedule?.timeSlots ?? [];
  const jobs = schedule?.upcomingJobs ?? [];

  const saveSetup = async () => {
    if (days.length === 0) return notify.error("Chọn ít nhất một ngày làm việc.");
    if (endHour <= startHour) return notify.error("Giờ kết thúc phải sau giờ bắt đầu.");
    const inputs: WeeklyScheduleInput[] = days.map((dow) => ({
      dayOfWeek: dow,
      startTime: `${String(startHour).padStart(2, "0")}:00:00`,
      endTime: `${String(endHour).padStart(2, "0")}:00:00`,
    }));
    setSavingSetup(true);
    try {
      await scheduleApi.updateWeeklySchedule(inputs);
      notify.success("Đã cập nhật giờ làm việc hàng tuần.");
      setShowSetup(false);
      void refetch();
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setSavingSetup(false);
    }
  };

  const markDayOff = async () => {
    setMarkingOff(true);
    try {
      
      await scheduleApi.createTimeOff(
        `${isoDate}T00:00:00+07:00`,
        `${isoDate}T23:59:59+07:00`,
        "Xin nghỉ trong ngày",
      );
      notify.success("Đã đăng ký nghỉ ngày này.");
      void refetch();
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setMarkingOff(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Lịch làm việc"
        onBack={goBack}
        actions={
          approval.approved ? (
            <button
              onClick={() => setShowSetup(true)}
              className="text-blue-600 text-xs font-semibold flex items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5" />
              Giờ làm
            </button>
          ) : undefined
        }
      />

      {!approval.approved ? (
        <div className="flex-1 overflow-y-auto">
          <TaskerApprovalNotice approval={approval} />
        </div>
      ) : (
      <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">
              Tháng {MONTHS[selectedDate.getMonth()]}, {selectedDate.getFullYear()}
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedDate((d) => addDays(d, -7))}
                className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedDate((d) => addDays(d, 7))}
                className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((d) => {
              const active = toISODate(d) === isoDate;
              const isToday = toISODate(d) === toISODate(new Date());
              return (
                <button
                  key={toISODate(d)}
                  onClick={() => setSelectedDate(d)}
                  className={`flex flex-col items-center py-2 rounded-xl transition-colors ${active ? "bg-blue-600 text-white" : "hover:bg-muted"}`}
                >
                  <span
                    className={`text-[11px] font-medium ${active ? "text-blue-200" : "text-muted-foreground"}`}
                  >
                    {WEEKDAYS[d.getDay()]}
                  </span>
                  <span className={`text-base font-bold ${active ? "text-white" : "text-foreground"}`}>
                    {d.getDate()}
                  </span>
                  {isToday && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 ${active ? "bg-white" : "bg-blue-400"}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground">
              Khung giờ ngày {selectedDate.getDate()}/{MONTHS[selectedDate.getMonth()]}
            </h3>
            {slots.length > 0 && (
              <button
                onClick={markDayOff}
                disabled={markingOff}
                className="text-xs font-semibold text-amber-600 flex items-center gap-1 disabled:opacity-60"
              >
                {markingOff ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CalendarOff className="w-3.5 h-3.5" />
                )}
                Xin nghỉ
              </button>
            )}
          </div>

          {loading && !schedule ? (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">{error}</p>
              <button
                onClick={() => void refetch()}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
              >
                Thử lại
              </button>
            </div>
          ) : slots.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Bạn chưa có giờ làm việc cho ngày này.
              </p>
              <button
                onClick={() => setShowSetup(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
              >
                Thiết lập giờ làm việc
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {slots.map((slot) => {
                  const st = SLOT_STYLE[slot.status] ?? SLOT_STYLE[0];
                  return (
                    <div
                      key={slot.time}
                      className={`py-3 rounded-xl text-sm font-semibold text-center ${st.cls}`}
                    >
                      {hhmm(slot.time)}
                      {st.label && <p className="text-[10px] opacity-90 mt-0.5">{st.label}</p>}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-green-100 border border-green-200" />
                  <span>Còn trống</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-blue-600" />
                  <span>Đã đặt</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-slate-300" />
                  <span>Nghỉ</span>
                </div>
              </div>
            </>
          )}
        </div>

        {}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-bold text-foreground">Công việc trong ngày</h3>
          </div>
          {jobs.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground text-center">
              Không có công việc nào.
            </p>
          ) : (
            jobs.map((job) => (
              <div
                key={job.bookingItemId}
                className="px-4 py-3 flex items-center gap-3 border-b border-border last:border-0"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {job.serviceName} · {job.customerName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {hhmm(job.startTime)}–{hhmm(job.endTime)} · {job.addressLine}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {}
      {showSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <div>
              <h3 className="font-bold text-foreground">Giờ làm việc hàng tuần</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Chọn ngày làm và khung giờ áp dụng cho cả tuần.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {SETUP_DAYS.map((d) => {
                const on = days.includes(d.dow);
                return (
                  <button
                    key={d.dow}
                    onClick={() =>
                      setDays((prev) =>
                        prev.includes(d.dow) ? prev.filter((x) => x !== d.dow) : [...prev, d.dow],
                      )
                    }
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${on ? "bg-blue-600 text-white" : "bg-muted text-foreground"}`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Bắt đầu</label>
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(Number(e.target.value))}
                  className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                >
                  {HOURS.map((h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Kết thúc</label>
                <select
                  value={endHour}
                  onChange={(e) => setEndHour(Number(e.target.value))}
                  className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                >
                  {HOURS.map((h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowSetup(false)}
                disabled={savingSetup}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                onClick={saveSetup}
                disabled={savingSetup}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {savingSetup ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
