import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminPaginationProps {
  page: number;
  total: number;
  perPage: number;
  onChange: (p: number) => void;
}

/** Số nút trang hiển thị quanh trang hiện tại (không kể trang đầu/cuối). */
const WINDOW_SIZE = 3;

/**
 * Dựng danh sách nút trang dạng "cửa sổ trượt": luôn có trang đầu + trang cuối,
 * tối đa 3 trang quanh trang hiện tại, chèn "…" ở chỗ bị ngắt quãng.
 *   Trang 1/9 → 1 2 3 … 9      Trang 5/9 → 1 … 4 5 6 … 9      Trang 9/9 → 1 … 7 8 9
 * Nhờ vậy số nút LUÔN cố định, dù có 9 hay 1000 trang.
 */
function buildPages(current: number, totalPages: number): (number | "gap-left" | "gap-right")[] {
  // Cửa sổ mặc định là [current-1, current+1]; ở sát hai đầu thì dồn lại cho đủ 3 nút.
  let start = Math.max(1, current - 1);
  let end = Math.min(totalPages, current + 1);
  if (current <= 2) {
    start = 1;
    end = Math.min(totalPages, WINDOW_SIZE);
  }
  if (current >= totalPages - 1) {
    end = totalPages;
    start = Math.max(1, totalPages - (WINDOW_SIZE - 1));
  }

  const pages: (number | "gap-left" | "gap-right")[] = [];

  // Trang đầu (+ "…" nếu cửa sổ không dính liền với nó).
  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("gap-left");
  }

  for (let p = start; p <= end; p++) pages.push(p);

  // Trang cuối (+ "…" nếu cửa sổ không dính liền với nó).
  if (end < totalPages) {
    if (end < totalPages - 1) pages.push("gap-right");
    pages.push(totalPages);
  }

  return pages;
}

export function AdminPagination({ page, total, perPage, onChange }: AdminPaginationProps) {
  const totalPages = perPage > 0 ? Math.ceil(total / perPage) : 0;

  // Trang dùng để HIỂN THỊ luôn nằm trong [1, totalPages] — tránh tô sai nút hoặc
  // in ra khoảng "81–80 / 80" khi state `page` đang lệch.
  const current = Math.min(Math.max(1, page), Math.max(1, totalPages));

  // Tự kéo về trang hợp lệ khi danh sách co lại (vd đang ở trang cuối, xóa nốt bản ghi
  // cuối cùng → totalPages giảm nhưng `page` vẫn giữ giá trị cũ nên bảng trống trơn).
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) onChange(totalPages);
    else if (page < 1) onChange(1);
  }, [page, totalPages, onChange]);

  if (totalPages <= 1) return null;

  // Mọi đường đổi trang đều đi qua đây: kẹp cứng vào [1, totalPages] nên không thể
  // ra số âm hay vượt quá số trang thật — kể cả khi thuộc tính `disabled` của nút bị
  // gỡ bằng devtools (disabled chỉ là lớp chặn giao diện, không phải lớp chặn logic).
  const goTo = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages);
    if (next !== current) onChange(next);
  };

  const from = (current - 1) * perPage + 1;
  const to = Math.min(current * perPage, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <span className="text-xs text-muted-foreground">
        Hiển thị {from}–{to} / {total} bản ghi
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => goTo(current - 1)}
          disabled={current <= 1}
          aria-label="Trang trước"
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {buildPages(current, totalPages).map((p) =>
          typeof p === "number" ? (
            <button
              key={p}
              onClick={() => goTo(p)}
              aria-current={p === current ? "page" : undefined}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                p === current ? "bg-blue-600 text-white" : "border border-border hover:bg-muted"
              }`}
            >
              {p}
            </button>
          ) : (
            <span
              key={p}
              aria-hidden="true"
              className="w-8 h-8 flex items-center justify-center text-xs text-muted-foreground select-none"
            >
              …
            </span>
          ),
        )}

        <button
          onClick={() => goTo(current + 1)}
          disabled={current >= totalPages}
          aria-label="Trang sau"
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
