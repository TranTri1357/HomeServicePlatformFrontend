import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminPaginationProps {
  page: number;
  total: number;
  perPage: number;
  onChange: (p: number) => void;
}


const WINDOW_SIZE = 3;


function buildPages(current: number, totalPages: number): (number | "gap-left" | "gap-right")[] {
  
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

  
  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("gap-left");
  }

  for (let p = start; p <= end; p++) pages.push(p);

  
  if (end < totalPages) {
    if (end < totalPages - 1) pages.push("gap-right");
    pages.push(totalPages);
  }

  return pages;
}

export function AdminPagination({ page, total, perPage, onChange }: AdminPaginationProps) {
  const totalPages = perPage > 0 ? Math.ceil(total / perPage) : 0;

  
  
  const current = Math.min(Math.max(1, page), Math.max(1, totalPages));

  
  
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) onChange(totalPages);
    else if (page < 1) onChange(1);
  }, [page, totalPages, onChange]);

  if (totalPages <= 1) return null;

  
  
  
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
