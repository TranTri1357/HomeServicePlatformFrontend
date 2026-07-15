import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/shared/lib";
import type { PagedResult } from "@/shared/types";

/** Giá trị `value` bị trễ `delay` ms — dùng cho ô tìm kiếm để tránh gọi API mỗi phím. */
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export interface UseInfiniteListResult<T> {
  items: T[];
  total: number;
  hasNext: boolean;
  /** Đang tải trang đầu / tải lại (thay toàn bộ). */
  loading: boolean;
  /** Đang tải thêm trang tiếp theo (nối vào cuối). */
  loadingMore: boolean;
  error: string | null;
  /** Đã hoàn tất ít nhất một lần tải (để hiện skeleton lần đầu). */
  loaded: boolean;
  loadMore: () => void;
  reload: () => void;
}

/**
 * Danh sách phân trang "tải thêm" dùng chung: tự tải trang 1 và tải lại mỗi khi
 * `fetchPage` đổi (hãy bọc `fetchPage` bằng useCallback theo đúng các bộ lọc).
 *
 * Ví dụ:
 *   const search = useDebounced(searchInput);
 *   const fetchPage = useCallback(
 *     (page: number) => api.getList({ search, pageIndex: page, pageSize: 10 }),
 *     [search],
 *   );
 *   const { items, hasNext, loadMore, loading } = useInfiniteList(fetchPage);
 */
export function useInfiniteList<T>(
  fetchPage: (pageIndex: number) => Promise<PagedResult<T>>,
): UseInfiniteListResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [nextPage, setNextPage] = useState(2);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const run = useCallback(
    async (page: number, replace: boolean) => {
      if (replace) setLoading(true);
      else setLoadingMore(true);
      setError(null);
      try {
        const res = await fetchPage(page);
        setItems((prev) => (replace ? res.items : [...prev, ...res.items]));
        setTotal(res.totalCount);
        setHasNext(res.hasNextPage);
        setNextPage(res.pageIndex + 1);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setLoaded(true);
      }
    },
    [fetchPage],
  );

  // Tải lại từ trang 1 khi fetchPage đổi (tức khi bộ lọc/từ khoá đổi).
  useEffect(() => {
    void run(1, true);
  }, [run]);

  const loadMore = useCallback(() => {
    if (hasNext && !loadingMore) void run(nextPage, false);
  }, [hasNext, loadingMore, nextPage, run]);

  const reload = useCallback(() => run(1, true), [run]);

  return { items, total, hasNext, loading, loadingMore, error, loaded, loadMore, reload };
}
