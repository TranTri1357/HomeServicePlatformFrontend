import { useState } from "react";
import {
  MapPin,
  Phone,
  X,
  Check,
  MessageCircle,
  Navigation,
  Play,
  Calendar,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { Screen, TaskerJob } from "@/shared/types";
import { taskerApi } from "@/services/api";
import { useApi } from "@/shared/hooks";
import { TopBar } from "@/shared/ui";
import { formatVnd, notify } from "@/shared/lib";

// JobStatus (BookingStatus codes) → label + colors.
const STATUS: Record<number, { label: string; cls: string; dot: string }> = {
  0: { label: "Chờ xác nhận", cls: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  1: { label: "Đã nhận", cls: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  2: { label: "Đang đến", cls: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-500" },
  3: { label: "Đang làm", cls: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  4: { label: "Hoàn thành", cls: "bg-green-100 text-green-700", dot: "bg-green-500" },
  5: { label: "Đã hủy", cls: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

const TABS: { key: string; label: string; statuses: number[] }[] = [
  { key: "incoming", label: "Yêu cầu mới", statuses: [0] },
  { key: "active", label: "Đang làm", statuses: [1, 2, 3] },
  { key: "history", label: "Lịch sử", statuses: [4, 5, 6] },
];

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProviderJobManagement({
  onNavigate,
}: {
  onNavigate: (s: Screen, d?: object) => void;
}) {
  const [activeTab, setActiveTab] = useState("incoming");
  const { data: jobs = [], loading, error, refetch } = useApi(() => taskerApi.getTaskerJobs());

  const [busyId, setBusyId] = useState<number | null>(null);

  // Cancel/decline modal.
  const [cancelJob, setCancelJob] = useState<TaskerJob | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const activeStatuses = TABS.find((t) => t.key === activeTab)?.statuses ?? [];
  const filtered = jobs.filter((j) => activeStatuses.includes(j.jobStatus));

  const runAction = async (
    job: TaskerJob,
    fn: (bookingId: number) => Promise<boolean>,
    successMsg: string,
  ) => {
    setBusyId(job.bookingItemId);
    try {
      await fn(job.bookingId);
      notify.success(successMsg);
      void refetch();
    } catch (err) {
      notify.error(err);
    } finally {
      setBusyId(null);
    }
  };

  const confirmCancel = async () => {
    if (!cancelJob) return;
    if (!cancelReason.trim()) {
      notify.error("Vui lòng nhập lý do.");
      return;
    }
    setCancelling(true);
    try {
      await taskerApi.cancelJob(cancelJob.bookingId, cancelReason.trim());
      notify.success("Đã hủy đơn.");
      setCancelJob(null);
      setCancelReason("");
      void refetch();
    } catch (err) {
      notify.error(err);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Quản lý công việc" onBack={() => onNavigate("providerDashboard")} />

      <div className="flex border-b border-border bg-white">
        {TABS.map((t) => {
          const count = jobs.filter((j) => t.statuses.includes(j.jobStatus)).length;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === t.key ? "text-blue-600 border-b-2 border-blue-600" : "text-muted-foreground"}`}
            >
              {t.label}
              {count > 0 && <span className="ml-1 text-xs">({count})</span>}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && jobs.length === 0 ? (
          [1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse space-y-3">
              <div className="h-4 w-1/2 bg-slate-200 rounded" />
              <div className="h-3 w-2/3 bg-slate-200 rounded" />
              <div className="h-8 bg-slate-200 rounded-xl" />
            </div>
          ))
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => void refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
            >
              Thử lại
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Calendar className="w-10 h-10 text-slate-300" />
            <p className="text-sm text-muted-foreground">Không có công việc nào.</p>
          </div>
        ) : (
          filtered.map((job) => {
            const s = STATUS[job.jobStatus] ?? STATUS[0];
            const busy = busyId === job.bookingItemId;
            return (
              <div key={job.bookingItemId} className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
                {/* Header */}
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-foreground">{job.serviceName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      BK{job.bookingId} · {job.customerName}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${s.cls}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{formatDateTime(job.startAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{job.fullAddress}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <a
                      href={`tel:${job.customerPhone}`}
                      className="flex items-center gap-2 text-sm text-blue-600 font-medium"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {job.customerPhone}
                    </a>
                    <span className="text-base font-extrabold text-green-600">
                      {formatVnd(job.totalPrice)}đ
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {job.jobStatus <= 3 && (
                  <div className="flex gap-2 pt-1">
                    {/* Chat (except pending) */}
                    {job.jobStatus >= 1 && (
                      <button
                        onClick={() => onNavigate("providerChat", { bookingId: job.bookingId })}
                        className="px-3 py-2.5 bg-muted rounded-xl text-sm font-semibold flex items-center justify-center gap-1 hover:bg-accent transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}

                    {/* Decline — chỉ khi đơn còn Chờ xác nhận (backend chỉ cho hủy lúc Pending) */}
                    {job.jobStatus === 0 && (
                      <button
                        onClick={() => {
                          setCancelJob(job);
                          setCancelReason("");
                        }}
                        disabled={busy}
                        className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm flex items-center justify-center gap-1 hover:bg-red-100 transition-colors disabled:opacity-60"
                      >
                        <X className="w-4 h-4" />
                        Từ chối
                      </button>
                    )}

                    {/* Primary advance action */}
                    {job.jobStatus === 0 && (
                      <button
                        onClick={() => runAction(job, taskerApi.acceptJob, "Đã nhận đơn.")}
                        disabled={busy}
                        className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1 hover:bg-green-700 transition-colors disabled:opacity-70"
                      >
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Chấp nhận
                      </button>
                    )}
                    {job.jobStatus === 1 && (
                      <button
                        onClick={() => runAction(job, taskerApi.startMoving, "Bắt đầu di chuyển.")}
                        disabled={busy}
                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1 hover:bg-blue-700 transition-colors disabled:opacity-70"
                      >
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                        Bắt đầu đi
                      </button>
                    )}
                    {job.jobStatus === 2 && (
                      <button
                        onClick={() => runAction(job, taskerApi.startWorking, "Bắt đầu làm việc.")}
                        disabled={busy}
                        className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1 hover:bg-purple-700 transition-colors disabled:opacity-70"
                      >
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Bắt đầu làm
                      </button>
                    )}
                    {job.jobStatus === 3 && (
                      <button
                        onClick={() => runAction(job, taskerApi.completeWork, "Đã hoàn thành công việc!")}
                        disabled={busy}
                        className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1 hover:bg-green-700 transition-colors disabled:opacity-70"
                      >
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Hoàn thành
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Cancel / decline modal */}
      {cancelJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <div>
              <h3 className="font-bold text-foreground">
                {cancelJob.jobStatus === 0 ? "Từ chối đơn" : "Hủy đơn"} BK{cancelJob.bookingId}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Vui lòng cho biết lý do.</p>
            </div>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              autoFocus
              className="w-full bg-muted rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              placeholder="VD: Trùng lịch, quá xa, ngoài chuyên môn..."
            />
            <div className="flex gap-2">
              <button
                onClick={() => setCancelJob(null)}
                disabled={cancelling}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold disabled:opacity-60"
              >
                Quay lại
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelling}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                {cancelling ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
