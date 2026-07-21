import { useCallback, useState } from "react";
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
  Search,
} from "lucide-react";
import type { Screen, TaskerJobGroup } from "@/shared/types";
import { taskerApi } from "@/services/api";
import { useGoBack } from "@/app/routes/useGoBack";
import { useApi, useInfiniteList, useDebounced } from "@/shared/hooks";
import { TopBar } from "@/shared/ui";
import { formatVnd, notify } from "@/shared/lib";


const STATUS: Record<number, { label: string; cls: string; dot: string }> = {
  0: { label: "Chờ xác nhận", cls: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  1: { label: "Đã nhận", cls: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  2: { label: "Đang đến", cls: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-500" },
  3: { label: "Đang làm", cls: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  4: { label: "Hoàn thành", cls: "bg-green-100 text-green-700", dot: "bg-green-500" },
  5: { label: "Đã hủy", cls: "bg-red-100 text-red-700", dot: "bg-red-500" },
  6: { label: "Đã hoàn tiền", cls: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  7: { label: "Khiếu nại bị từ chối", cls: "bg-slate-200 text-slate-600", dot: "bg-slate-500" },
};

const TABS: { key: string; label: string; statuses: number[] }[] = [
  { key: "incoming", label: "Yêu cầu mới", statuses: [0] },
  { key: "active", label: "Đang làm", statuses: [1, 2, 3] },
  { key: "history", label: "Lịch sử", statuses: [4, 5, 6, 7] },
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
  const goBack = useGoBack("providerDashboard");

  
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounced(searchInput.trim());

  
  const fetchPage = useCallback(
    (page: number) => {
      const statuses = TABS.find((t) => t.key === activeTab)?.statuses;
      return taskerApi.getTaskerJobsPaged({
        status: statuses,
        search: search || undefined,
        pageIndex: page,
        pageSize: 10,
      });
    },
    [activeTab, search],
  );
  const { items: groups, hasNext, loading, loadingMore, error, loadMore, reload } =
    useInfiniteList(fetchPage);

  
  const { data: stats, refetch: refetchStats } = useApi(() => taskerApi.getTaskerJobStats());
  const tabCount: Record<string, number> = {
    incoming: stats?.incoming ?? 0,
    active: stats?.active ?? 0,
    history: stats?.history ?? 0,
  };

  const refresh = useCallback(() => {
    reload();
    void refetchStats();
  }, [reload, refetchStats]);

  const [busyId, setBusyId] = useState<number | null>(null);

  
  const [cancelJob, setCancelJob] = useState<TaskerJobGroup | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const runAction = async (
    bookingId: number,
    fn: (bookingId: number) => Promise<boolean>,
    successMsg: string,
  ) => {
    setBusyId(bookingId);
    try {
      await fn(bookingId);
      notify.success(successMsg);
      refresh();
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
    
    
    
    const isPending = cancelJob.jobStatus === 0;
    setCancelling(true);
    try {
      if (isPending) {
        await taskerApi.declineJob(cancelJob.bookingId, cancelReason.trim());
        notify.success("Đã từ chối đơn. Khách được hoàn tiền đầy đủ.");
      } else {
        await taskerApi.cancelJob(cancelJob.bookingId, cancelReason.trim());
        notify.success("Đã hủy đơn.");
      }
      setCancelJob(null);
      setCancelReason("");
      refresh();
    } catch (err) {
      notify.error(err);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Quản lý công việc" onBack={goBack} />

      <div className="flex border-b border-border bg-white">
        {TABS.map((t) => {
          const count = tabCount[t.key] ?? 0;
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

      {}
      <div className="bg-white px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 bg-transparent text-sm focus:outline-none"
            placeholder="Tìm mã đơn, tên khách hoặc dịch vụ..."
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && groups.length === 0 ? (
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
              onClick={reload}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
            >
              Thử lại
            </button>
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Calendar className="w-10 h-10 text-slate-300" />
            <p className="text-sm text-muted-foreground">
              {search ? "Không tìm thấy công việc phù hợp." : "Không có công việc nào."}
            </p>
          </div>
        ) : (
          <>
          {groups.map((g) => {
            const s = STATUS[g.jobStatus] ?? STATUS[0];
            const busy = busyId === g.bookingId;
            return (
              <div key={g.bookingId} className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
                {}
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-foreground">Đơn BK{g.bookingId}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {g.items.length} dịch vụ · {g.customerName}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${s.cls}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                </div>

                {}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{g.fullAddress}</span>
                  </div>
                  <a
                    href={`tel:${g.customerPhone}`}
                    className="flex items-center gap-2 text-sm text-blue-600 font-medium w-fit"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {g.customerPhone}
                  </a>
                </div>

                {}
                <div className="space-y-2">
                  {g.items.map((it) => (
                    <div key={it.bookingItemId} className="rounded-xl bg-muted/50 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {it.serviceName}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>{formatDateTime(it.startAt)}</span>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-green-600 flex-shrink-0">
                          {formatVnd(it.totalPrice)}đ
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {}
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">Tổng nhận</span>
                  <span className="text-base font-extrabold text-green-600">
                    {formatVnd(g.total)}đ
                  </span>
                </div>

                {}
                {g.jobStatus <= 3 && (
                  <div className="flex gap-2 pt-1">
                    {}
                    {g.jobStatus >= 1 && (
                      <button
                        onClick={() => onNavigate("providerChat", { bookingId: g.bookingId })}
                        className="px-3 py-2.5 bg-muted rounded-xl text-sm font-semibold flex items-center justify-center gap-1 hover:bg-accent transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}

                    {}
                    {g.jobStatus >= 0 && g.jobStatus <= 3 && (
                      <button
                        onClick={() => {
                          setCancelJob(g);
                          setCancelReason("");
                        }}
                        disabled={busy}
                        className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm flex items-center justify-center gap-1 hover:bg-red-100 transition-colors disabled:opacity-60"
                      >
                        <X className="w-4 h-4" />
                        {g.jobStatus === 0 ? "Từ chối" : "Hủy đơn"}
                      </button>
                    )}

                    {}
                    {g.jobStatus === 0 && (
                      <button
                        onClick={() => runAction(g.bookingId, taskerApi.acceptJob, "Đã nhận đơn.")}
                        disabled={busy}
                        className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1 hover:bg-green-700 transition-colors disabled:opacity-70"
                      >
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Chấp nhận
                      </button>
                    )}
                    {g.jobStatus === 1 && (
                      <button
                        onClick={() => runAction(g.bookingId, taskerApi.startMoving, "Bắt đầu di chuyển.")}
                        disabled={busy}
                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1 hover:bg-blue-700 transition-colors disabled:opacity-70"
                      >
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                        Bắt đầu đi
                      </button>
                    )}
                    {g.jobStatus === 2 && (
                      <button
                        onClick={() => runAction(g.bookingId, taskerApi.startWorking, "Bắt đầu làm việc.")}
                        disabled={busy}
                        className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1 hover:bg-purple-700 transition-colors disabled:opacity-70"
                      >
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Bắt đầu làm
                      </button>
                    )}
                    {g.jobStatus === 3 && (
                      <button
                        onClick={() => runAction(g.bookingId, taskerApi.completeWork, "Đã hoàn thành công việc!")}
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
          })}
          {hasNext && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full py-2.5 rounded-xl bg-white border border-border text-sm font-semibold text-blue-600 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
              {loadingMore ? "Đang tải..." : "Tải thêm"}
            </button>
          )}
          </>
        )}
      </div>

      {}
      {cancelJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <div>
              <h3 className="font-bold text-foreground">
                {cancelJob.jobStatus === 0 ? "Từ chối đơn" : "Hủy đơn"} BK{cancelJob.bookingId}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Vui lòng cho biết lý do.</p>
            </div>
            {cancelJob.jobStatus === 0 ? (
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800">
                Bạn chưa nhận đơn này nên từ chối KHÔNG ảnh hưởng độ tin cậy của bạn. Khách sẽ được
                hoàn 100% và có thể đặt lại với thợ khác.
              </div>
            ) : (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                Bạn đang hủy đơn đã nhận: khách sẽ được hoàn 100% và lần hủy này bị ghi nhận,
                ảnh hưởng độ tin cậy của bạn. Hủy nhiều lần có thể bị tạm khóa nhận đơn.
              </div>
            )}
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
