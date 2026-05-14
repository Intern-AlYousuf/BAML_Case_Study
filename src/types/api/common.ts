/** Shared API field types used across multiple domains. */

/** ISO 8601 datetime string — e.g. "2026-05-14T09:41:22.000Z" */
export type ISODatetime = string;

/** ISO date string — e.g. "2026-05-14" */
export type ISODate = string;

/** UUID string — e.g. "3fa85f64-5717-4562-b3fc-2c963f66afa6" */
export type UUID = string;

/**
 * Financial decimal value serialised as a number by FastAPI / Pydantic v2.
 * Use `Number.toFixed()` or a formatting utility before display.
 */
export type Decimal = number;

/** ISO 4217 three-letter currency code */
export type CurrencyCode = string;

/** Status of a long-running async job */
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';
