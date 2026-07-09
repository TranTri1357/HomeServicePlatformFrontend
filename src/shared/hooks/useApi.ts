import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/shared/lib";

export interface UseApiResult<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<T | undefined>;
}

export interface UseApiOptions<T> {
  /** Run the fetcher automatically on mount. Default: true. */
  immediate?: boolean;
  /** Seed value shown before the first successful response (e.g. a mock fallback). */
  initialData?: T;
  /** Called with the parsed message whenever the fetcher throws. */
  onError?: (message: string, err: unknown) => void;
}

/**
 * Standard data-fetching hook. Handles loading / error state, cancellation on
 * unmount, and message extraction from ApiError — so every screen fetches data
 * the same way.
 *
 * Example:
 *   const { data, loading, error, refetch } = useApi(
 *     () => serviceApi.getServices(),
 *     { initialData: [] },
 *   );
 *
 * For an action triggered by the user (not on mount), pass `immediate: false`
 * and call `refetch()` from the handler.
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  options: UseApiOptions<T> = {},
): UseApiResult<T> {
  const { immediate = true, initialData, onError } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<string | null>(null);

  // Keep the latest callbacks without retriggering the auto-fetch effect.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const mountedRef = useRef(true);
  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    [],
  );

  const refetch = useCallback(async (): Promise<T | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      if (mountedRef.current) setData(result);
      return result;
    } catch (err) {
      const message = getErrorMessage(err);
      if (mountedRef.current) setError(message);
      onErrorRef.current?.(message, err);
      return undefined;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (immediate) void refetch();
  }, [immediate, refetch]);

  return { data, loading, error, refetch };
}
