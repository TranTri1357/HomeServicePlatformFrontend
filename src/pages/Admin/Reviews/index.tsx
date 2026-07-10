import { useEffect, useState } from "react";
import { Star, Trash2, Loader2, AlertCircle, MessageSquare } from "lucide-react";
import type { AdminReviewItem } from "@/shared/types";
import { adminReviewApi } from "@/services/api";
import { useApi } from "@/shared/hooks";
import { notify, formatDateVn } from "@/shared/lib";
import { ConfirmModal, AdminPagination, AdminSearchBar } from "@/components/Admin";

const PAGE_SIZE = 10;

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
    </div>
  );
}

export function Reviews() {
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data: paged, loading, error, refetch } = useApi(
    () =>
      adminReviewApi.getReviews({
        searchTerm: search.trim() || undefined,
        rating: ratingFilter === "all" ? undefined : Number(ratingFilter),
        pageIndex: page,
        pageSize: PAGE_SIZE,
      }),
    { immediate: false },
  );
  useEffect(() => {
    const t = setTimeout(() => void refetch(), 300);
    return () => clearTimeout(t);
  }, [search, ratingFilter, page, refetch]);

  const items = paged?.items ?? [];
  const total = paged?.totalCount ?? 0;

  const [deleteTarget, setDeleteTarget] = useState<AdminReviewItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminReviewApi.deleteReview(deleteTarget.reviewId);
      notify.success("Đã gỡ đánh giá. Điểm trung bình của thợ đã được tính lại.");
      setDeleteTarget(null);
      void refetch();
    } catch (err) {
      notify.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quản lý đánh giá</h1>
        <p className="text-sm text-muted-foreground">Kiểm duyệt và gỡ các đánh giá không phù hợp</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap gap-3">
          <AdminSearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Tìm theo tên khách, thợ..."
          />
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(1);
            }}
            className="border border-border rounded-xl px-3 py-2 text-sm focus:outline-none bg-background"
          >
            <option value="all">Tất cả điểm</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} sao
              </option>
            ))}
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
            <MessageSquare className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium">Không có đánh giá nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-muted/40">
                <tr>
                  {["Khách hàng", "Thợ", "Dịch vụ", "Điểm", "Nội dung", "Ngày", ""].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-bold text-muted-foreground px-4 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((r) => (
                  <tr key={r.reviewId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {r.customerName}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{r.taskerName}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{r.serviceName}</td>
                    <td className="px-4 py-3">
                      <Stars rating={r.rating} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                      {r.comment || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDateVn(r.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDeleteTarget(r)}
                        className="px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Gỡ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AdminPagination page={page} total={total} perPage={PAGE_SIZE} onChange={setPage} />
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="Gỡ đánh giá?"
          message={`Đánh giá ${deleteTarget.rating}★ của ${deleteTarget.customerName} cho thợ ${deleteTarget.taskerName} sẽ bị gỡ, và điểm trung bình của thợ được tính lại.`}
          confirmLabel={deleting ? "Đang gỡ..." : "Gỡ"}
          onConfirm={confirmDelete}
          onCancel={() => !deleting && setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
