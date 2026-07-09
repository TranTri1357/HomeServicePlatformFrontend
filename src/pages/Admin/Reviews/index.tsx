import { useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { adminReviewsList } from "@/services/Admin/review.data";
import { AdminBadge, ConfirmModal, AdminPagination, AdminSearchBar } from "@/components/Admin";
import { useReviews } from "@/hooks/Admin/useReviews";

export function Reviews() {
  const { search, setSearch, statusFilter, setStatusFilter, page, setPage, filtered, paged, perPage } = useReviews();
  const [confirm, setConfirm] = useState<{
    show: boolean;
    action: string;
    item: (typeof adminReviewsList)[0] | null;
  }>({ show: false, action: "", item: null });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Quản lý đánh giá
        </h1>
        <p className="text-sm text-muted-foreground">
          Kiểm duyệt và xử lý các đánh giá từ khách hàng
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Tổng đánh giá",
            value: adminReviewsList.length,
            color: "text-blue-600",
          },
          {
            label: "Đã đăng",
            value: adminReviewsList.filter(
              (r) => r.status === "published",
            ).length,
            color: "text-green-600",
          },
          {
            label: "Vi phạm",
            value: adminReviewsList.filter(
              (r) => r.status === "flagged",
            ).length,
            color: "text-red-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-4 shadow-sm text-center"
          >
            <p className={`text-2xl font-extrabold ${s.color}`}>
              {s.value}
            </p>
            <p className="text-xs text-muted-foreground">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap gap-3">
          <AdminSearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Tìm theo tên khách, thợ, nội dung..."
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border border-border rounded-xl px-3 py-2 text-sm focus:outline-none bg-background"
          >
            <option value="all">Tất cả</option>
            <option value="published">Đã đăng</option>
            <option value="flagged">Vi phạm</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-muted/40">
              <tr>
                {[
                  "Khách hàng",
                  "Thợ",
                  "Dịch vụ",
                  "Điểm",
                  "Nội dung",
                  "Ngày",
                  "Trạng thái",
                  "Thao tác",
                ].map((h) => (
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
              {paged.map((r) => (
                <tr
                  key={r.id}
                  className={`hover:bg-muted/30 transition-colors ${r.status === "flagged" ? "bg-red-50/30" : ""}`}
                >
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {r.customer}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {r.provider}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {r.service}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px] truncate">
                    {r.comment}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {r.date}
                  </td>
                  <td className="px-4 py-3">
                    <AdminBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {r.status === "flagged" && (
                        <button
                          onClick={() =>
                            setConfirm({
                              show: true,
                              action: "restore",
                              item: r,
                            })
                          }
                          className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Khôi phục
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setConfirm({
                            show: true,
                            action: "delete",
                            item: r,
                          })
                        }
                        className="px-2 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AdminPagination
          page={page}
          total={filtered.length}
          perPage={perPage}
          onChange={setPage}
        />
      </div>

      {confirm.show && confirm.item && (
        <ConfirmModal
          title={
            confirm.action === "delete"
              ? "Xóa đánh giá?"
              : "Khôi phục đánh giá?"
          }
          message={
            confirm.action === "delete"
              ? `Đánh giá của ${confirm.item.customer} sẽ bị xóa vĩnh viễn.`
              : `Đánh giá của ${confirm.item.customer} sẽ được đăng lại.`
          }
          confirmLabel={
            confirm.action === "delete" ? "Xóa" : "Khôi phục"
          }
          danger={confirm.action === "delete"}
          onConfirm={() =>
            setConfirm({ show: false, action: "", item: null })
          }
          onCancel={() =>
            setConfirm({ show: false, action: "", item: null })
          }
        />
      )}
    </div>
  );
}
