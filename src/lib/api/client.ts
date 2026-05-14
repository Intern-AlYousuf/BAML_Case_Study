/**
 * Axios API client — singleton instance shared across all services.
 *
 * Responsibilities:
 *  - Base URL and timeout from environment variables
 *  - Request interceptor: inject Bearer token when present (auth-ready)
 *  - Response interceptor: normalize backend error envelopes into ApiError
 *  - Request ID logging for correlation with backend traces
 */
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { env } from '@/lib/env';
import { ApiError, type ApiErrorDetail } from './types';

// ── Token store ───────────────────────────────────────────────────────────────
// Thin abstraction over localStorage so the token source can be swapped
// (e.g. to an httpOnly cookie via a server-side proxy) without touching services.

let _accessToken: string | null = null;

export const tokenStore = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    return _accessToken ?? localStorage.getItem('baml_access_token');
  },
  set: (token: string): void => {
    _accessToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('baml_access_token', token);
    }
  },
  clear: (): void => {
    _accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('baml_access_token');
    }
  },
};

// ── Axios instance ────────────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  timeout: env.apiTimeoutMs,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Request interceptor ───────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStore.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  // Success: pass through as-is — services destructure `.data`
  (response: AxiosResponse) => response,

  // Error: normalize backend envelope to ApiError
  (error: AxiosError<{ error?: ApiErrorDetail }>) => {
    const status = error.response?.status ?? 0;
    const backendError = error.response?.data?.error;

    if (backendError) {
      return Promise.reject(new ApiError(backendError, error));
    }

    // No structured error body — synthesize one from the HTTP status
    return Promise.reject(
      new ApiError(
        {
          status,
          detail: error.message ?? 'An unexpected error occurred',
          path: error.config?.url ?? '',
          request_id: null,
        },
        error
      )
    );
  }
);

export default apiClient;

// ── Typed request helpers ─────────────────────────────────────────────────────
// Thin wrappers that resolve `response.data` so services never call
// `.data` themselves — keeps service code at the business-logic level.

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await apiClient.get<T>(url, config);
  return res.data;
}

export async function apiPost<T, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await apiClient.post<T>(url, body, config);
  return res.data;
}

export async function apiPatch<T, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await apiClient.patch<T>(url, body, config);
  return res.data;
}

export async function apiDelete(
  url: string,
  config?: AxiosRequestConfig
): Promise<void> {
  await apiClient.delete(url, config);
}
