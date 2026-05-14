/**
 * Core API response envelope types.
 *
 * Every backend response (success or error) is typed through these shapes
 * so callers never have to guess the response structure.
 *
 * Matches the backend error envelope from app/core/exceptions.py:
 *   { "error": { "status", "detail", "path", "request_id" } }
 */

// ── Success envelopes ─────────────────────────────────────────────────────────

/** Unwrapped typed response — most endpoints return T directly. */
export type ApiResponse<T> = T;

/** Standard paginated list response. */
export interface PaginatedResponse<T> {
  total: number;
  items: T[];
}

/** Generic paginated response with full metadata (used by some endpoints). */
export interface PaginatedData<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  offset: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

// ── Error types ───────────────────────────────────────────────────────────────

/** Shape of the backend error detail object. */
export interface ApiErrorDetail {
  status: number;
  detail: string | object;
  path: string;
  request_id: string | null;
}

/** Normalized error thrown by the Axios response interceptor. */
export class ApiError extends Error {
  readonly status: number;
  readonly detail: string;
  readonly path: string;
  readonly requestId: string | null;
  readonly raw: unknown;

  constructor(detail: ApiErrorDetail, raw?: unknown) {
    const message =
      typeof detail.detail === 'string'
        ? detail.detail
        : JSON.stringify(detail.detail);

    super(message);
    this.name = 'ApiError';
    this.status = detail.status;
    this.detail = message;
    this.path = detail.path ?? '';
    this.requestId = detail.request_id ?? null;
    this.raw = raw;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isValidationError(): boolean {
    return this.status === 422;
  }

  get isServiceUnavailable(): boolean {
    return this.status === 503;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }
}

// ── Query params ──────────────────────────────────────────────────────────────

export interface PaginationParams {
  offset?: number;
  limit?: number;
}

export interface DateRangeParams {
  date_from?: string;   // ISO date string YYYY-MM-DD
  date_to?: string;
}

// ── Utility ───────────────────────────────────────────────────────────────────

/** Strip undefined values before passing to Axios params. */
export function cleanParams<T extends Record<string, unknown>>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ) as Partial<T>;
}
