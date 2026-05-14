'use client';

/**
 * Generic async data fetching hook.
 *
 * Provides a minimal but production-correct pattern for calling a service
 * method from a React component: loading / error / data state, optional
 * auto-fetch on mount, and an imperative refetch handle.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi(
 *     () => DashboardService.getSummary(),
 *     { immediate: true }
 *   );
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiError } from '@/lib/api/types';

// ── State ─────────────────────────────────────────────────────────────────────

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export interface UseApiOptions {
  /** Fetch on mount (default true) */
  immediate?: boolean;
  /** Re-fetch when any of these values change (like useEffect dependencies) */
  deps?: unknown[];
}

export interface UseApiResult<T> extends ApiState<T> {
  /** Manually trigger a re-fetch */
  refetch: () => Promise<void>;
  /** Reset state to initial (data=null, loading=false, error=null) */
  reset: () => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useApi<T>(
  fetcher: () => Promise<T>,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const { immediate = true, deps = [] } = options;

  const [state, setState] = useState<ApiState<T>>({
    data:    null,
    loading: immediate,
    error:   null,
  });

  // Ref prevents stale-closure warnings without adding `fetcher` to deps
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetcherRef.current();
      setState({ data, loading: false, error: null });
    } catch (err) {
      const error =
        err instanceof ApiError
          ? err
          : new ApiError(
              {
                status: 0,
                detail: err instanceof Error ? err.message : 'Unknown error',
                path: '',
                request_id: null,
              },
              err
            );
      setState({ data: null, loading: false, error });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...deps]);

  return { ...state, refetch: execute, reset };
}

// ── Mutation variant ──────────────────────────────────────────────────────────
// For POST / PATCH / DELETE — not auto-triggered, only runs when called.

export interface UseMutationResult<T, I> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  mutate: (input: I) => Promise<T>;
  reset: () => void;
}

export function useMutation<T, I = void>(
  mutator: (input: I) => Promise<T>
): UseMutationResult<T, I> {
  const [state, setState] = useState<ApiState<T>>({
    data:    null,
    loading: false,
    error:   null,
  });

  const mutatorRef = useRef(mutator);
  mutatorRef.current = mutator;

  const mutate = useCallback(async (input: I): Promise<T> => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await mutatorRef.current(input);
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const error =
        err instanceof ApiError
          ? err
          : new ApiError(
              {
                status: 0,
                detail: err instanceof Error ? err.message : 'Unknown error',
                path: '',
                request_id: null,
              },
              err
            );
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, mutate, reset };
}
