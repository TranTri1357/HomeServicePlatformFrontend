import { useEffect, useState } from "react";
import { Star, Shield, X, Wrench, Loader2, AlertCircle } from "lucide-react";
import type { AdminTaskerItem, AdminTaskerDetail } from "@/shared/types";
import { adminTaskerApi } from "@/services/api";
import { useApi } from "@/shared/hooks";
import { notify, formatDateVn, getApiAssetUrl } from "@/shared/lib";
import { ConfirmModal, AdminPagination, AdminSearchBar } from "@/components/Admin";

const PAGE_SIZE = 10;

const STATUS: Record<number, { label: string; cls: string }> = {
  0: { label: "Chờ duyệt", cls: "bg-amber-100 text-amber-700" },
  1: { label: "Hoạt động", cls: "bg-green-100 text-green-700" },
  2: { label: "Bị khóa", cls: "bg-red-100 text-red-600" },
};

function StatusBadge({ status }: { status: number }) {
  const s = STATUS[status] ?? STATUS[0];
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>;
}

type Action = "approve" | "block" | "unblock";

export function Technicians() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data: paged, loading, error, refetch } = useApi(
    () =>
      adminTaskerApi.getTaskers({
        searchTerm: search.trim() || undefined,
        status: statusFilter === "all" ? undefined : Number(statusFilter),
        pageIndex: page,
        pageSize: PAGE_SIZE,
      }),
    { immediate: false },
  );
  useEffect(() => {
    const t = setTimeout(() => void refetch(), 300);
    return () => clearTimeout(t);
  }, [search, statusFilter, page, refetch]);

  const items = paged?.items ?? [];
  const total = paged?.totalCount ?? 0;

  
  const [detail, setDetail] = useState<AdminTaskerDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  
  const [confirm, setConfirm] = useState<{ action: Action; item: AdminTaskerItem } | null>(null);
  const [busy, setBusy] = useState(false);

  
  const [rejectTarget, setRejectTarget] = useState<AdminTaskerItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const openDetail = async (t: AdminTaskerItem) => {
    setLoadingDetail(true);
    setDetail({
      taskerId: t.taskerId,
      fullName: t.fullName,
      email: "",
      phone: t.phone,
      bio: null,
      experienceYears: 0,
      isVerified: false,
      verifiedAt: null,
      verificationImageUrl: null,
      rejectionReason: null,
      ratingAvg: t.ratingAvg,
      totalReviews: 0,
      taskerStatus: t.status,
      userStatus: 1,
      joinedDate: t.joinedDate,
      skills: t.skills,
    });
    try {
      const d = await adminTaskerApi.getTaskerDetail(t.taskerId);
      setDetail(d);
    } catch (err) {
      notify.error(err);
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const runConfirm = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      if (confirm.action === "approve") {
        await adminTaskerApi.approveTasker(confirm.item.taskerId);
        notify.success("Đã duyệt hồ sơ thợ.");
      } else {
        await adminTaskerApi.toggleTaskerStatus(confirm.item.taskerId);
        notify.success(confirm.action === "block" ? "Đã khóa hồ sơ thợ." : "Đã mở khóa hồ sơ thợ.");
      }
      setConfirm(null);
      void refetch();
    } catch (err) {
      notify.error(err);
    } finally {
      setBusy(false);
    }
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    setRejecting(true);
    try {
      await adminTaskerApi.rejectTasker(rejectTarget.taskerId, rejectReason.trim() || "Hồ sơ chưa đạt yêu cầu.");
      notify.success("Đã từ chối hồ sơ thợ.");
      setRejectTarget(null);
      setRejectReason("");
      void refetch();
    } catch (err) {
      notify.error(err);
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quản lý thợ</h1>
        <p className="text-sm text-muted-foreground">Duyệt hồ sơ và quản lý thợ kỹ thuật</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center">
          <AdminSearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Tìm theo tên, SĐT..."
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border border-border rounded-xl px-3 py-2 text-sm focus:outline-none bg-background"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="0">Chờ duyệt</option>
            <option value="1">Hoạt động</option>
            <option value="2">Bị khóa</option>
          </select>
        </div>

        {loading && items.length === 0 ? (
          <div className="py-16 flex items-center justify-center text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Đang tải...
          </div>
        ) : error ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => void refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
            >
              Thử lại
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
            <Wrench className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium">Không có thợ nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-muted/40">
                <tr>
                  {["Thợ kỹ thuật", "Kỹ năng", "Đánh giá", "Công việc", "Trạng thái", "Tham gia", "Thao tác"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-bold text-muted-foreground px-4 py-3"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((t) => (
                  <tr key={t.taskerId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 text-xs font-bold">
                            {t.fullName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                            {t.fullName}
                            {t.status === 1 && <Shield className="w-3 h-3 text-blue-500" />}
                          </p>
                          <p className="text-xs text-muted-foreground">{t.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {t.skills.slice(0, 2).map((s) => (
                          <span
                            key={s}
                            className="bg-accent text-blue-600 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          >
                            {s}
                          </span>
                        ))}
                        {t.skills.length > 2 && (
                          <span className="text-[11px] text-muted-foreground">
                            +{t.skills.length - 2}
                          </span>
                        )}
                        {t.skills.length === 0 && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {t.ratingAvg > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-semibold">{t.ratingAvg}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Chưa có</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{t.totalJobs}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDateVn(t.joinedDate)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openDetail(t)}
                          className="px-2 py-1 bg-muted hover:bg-accent rounded-lg text-xs font-semibold text-foreground transition-colors"
                        >
                          Chi tiết
                        </button>
                        {t.status === 0 && (
                          <>
                            <button
                              onClick={() => setConfirm({ action: "approve", item: t })}
                              className="px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => {
                                setRejectTarget(t);
                                setRejectReason("");
                              }}
                              className="px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                        {t.status === 1 && (
                          <button
                            onClick={() => setConfirm({ action: "block", item: t })}
                            className="px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Khóa
                          </button>
                        )}
                        {t.status === 2 && (
                          <button
                            onClick={() => setConfirm({ action: "unblock", item: t })}
                            className="px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Mở khóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AdminPagination page={page} total={total} perPage={PAGE_SIZE} onChange={setPage} />
      </div>

      {}
      {detail && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex justify-end" onClick={() => setDetail(null)}>
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-border px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-foreground">Chi tiết thợ</h3>
              <button
                onClick={() => setDetail(null)}
                className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-2xl">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-2xl font-bold flex-shrink-0">
                  {detail.fullName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-lg text-foreground truncate">{detail.fullName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={detail.taskerStatus} />
                    {detail.isVerified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600">
                        <Shield className="w-3 h-3" /> Đã xác minh
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {loadingDetail && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang tải chi tiết...
                </div>
              )}

              {detail.bio && <p className="text-sm text-muted-foreground">{detail.bio}</p>}

              {detail.rejectionReason && (
                <div className="flex gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-red-700">Lý do từ chối lần trước</p>
                    <p className="text-xs text-red-600 mt-0.5">{detail.rejectionReason}</p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-bold text-foreground mb-2">Ảnh giấy tờ xác minh</h4>
                {detail.verificationImageUrl ? (
                  
                  <a
                    href={getApiAssetUrl(detail.verificationImageUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl overflow-hidden border border-border hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={getApiAssetUrl(detail.verificationImageUrl)}
                      alt="Ảnh giấy tờ xác minh"
                      className="w-full max-h-64 object-contain bg-muted"
                    />
                  </a>
                ) : (
                  <div className="flex items-center gap-2 bg-muted rounded-xl p-3 text-xs text-muted-foreground">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Thợ chưa cung cấp ảnh giấy tờ (hồ sơ tạo trước khi có yêu cầu xác minh).
                  </div>
                )}
              </div>

              <div>
                {[
                  ["Email", detail.email || "—"],
                  ["Điện thoại", detail.phone],
                  ["Kinh nghiệm", `${detail.experienceYears} năm`],
                  ["Đánh giá", detail.ratingAvg > 0 ? `${detail.ratingAvg} ⭐ (${detail.totalReviews})` : "Chưa có"],
                  ["Ngày tham gia", formatDateVn(detail.joinedDate)],
                  ["Xác minh lúc", detail.verifiedAt ? formatDateVn(detail.verifiedAt) : "—"],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">{l}</span>
                    <span className="text-sm font-semibold text-right">{v}</span>
                  </div>
                ))}
              </div>

              {detail.skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-2">Kỹ năng / dịch vụ</h4>
                  <div className="flex flex-wrap gap-2">
                    {detail.skills.map((s) => (
                      <span
                        key={s}
                        className="bg-accent text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {}
      {confirm && (
        <ConfirmModal
          title={
            confirm.action === "approve"
              ? "Duyệt hồ sơ thợ?"
              : confirm.action === "block"
                ? "Khóa hồ sơ thợ?"
                : "Mở khóa hồ sơ thợ?"
          }
          message={
            confirm.action === "approve"
              ? `Thợ ${confirm.item.fullName} sẽ được duyệt và bắt đầu nhận việc.`
              : confirm.action === "block"
                ? `Thợ ${confirm.item.fullName} sẽ bị khóa và không thể nhận việc.`
                : `Thợ ${confirm.item.fullName} sẽ được mở khóa để nhận việc.`
          }
          confirmLabel={
            busy
              ? "Đang xử lý..."
              : confirm.action === "approve"
                ? "Duyệt"
                : confirm.action === "block"
                  ? "Khóa"
                  : "Mở khóa"
          }
          danger={confirm.action === "block"}
          onConfirm={runConfirm}
          onCancel={() => !busy && setConfirm(null)}
        />
      )}

      {}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-foreground">Từ chối hồ sơ?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Hồ sơ của {rejectTarget.fullName} sẽ bị từ chối. Nhập lý do (tuỳ chọn).
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              autoFocus
              className="w-full bg-muted rounded-xl p-3 text-sm mt-3 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              placeholder="VD: Giấy tờ chưa hợp lệ, thiếu chứng chỉ..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setRejectTarget(null)}
                disabled={rejecting}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                onClick={confirmReject}
                disabled={rejecting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {rejecting && <Loader2 className="w-4 h-4 animate-spin" />}
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
