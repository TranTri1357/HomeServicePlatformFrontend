import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/shared/lib";

export interface UseApiResult<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<T | undefined>;
}

export interface UseApiOptions<T> {
  
  immediate?: boolean;
  
  initialData?: T;
  
  onError?: (message: string, err: unknown) => void;
}


export function useApi<T>(
  fetcher: () => Promise<T>,
  options: UseApiOptions<T> = {},
): UseApiResult<T> {
  const { immediate = true, initialData, onError } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<string | null>(null);

  
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
