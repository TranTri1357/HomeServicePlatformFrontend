import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/shared/lib";
import type { PagedResult } from "@/shared/types";


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
  
  loading: boolean;
  
  loadingMore: boolean;
  error: string | null;
  
  loaded: boolean;
  loadMore: () => void;
  reload: () => void;
}


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

  
  useEffect(() => {
    void run(1, true);
  }, [run]);

  const loadMore = useCallback(() => {
    if (hasNext && !loadingMore) void run(nextPage, false);
  }, [hasNext, loadingMore, nextPage, run]);

  const reload = useCallback(() => run(1, true), [run]);

  return { items, total, hasNext, loading, loadingMore, error, loaded, loadMore, reload };
}
