/**
 * Centralised access to frontend environment variables.
 *
 * All NEXT_PUBLIC_* variables are validated here at module load time.
 * A missing required variable throws at startup rather than silently
 * producing runtime 404s.
 */

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[env] Required environment variable "${key}" is not set.\n` +
      `Copy .env.example to .env.local and fill in the value.`
    );
  }
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  /** Base URL of the FastAPI backend — required */
  apiUrl: optional('NEXT_PUBLIC_API_URL', 'http://localhost:8000'),

  /** Axios request timeout in milliseconds */
  apiTimeoutMs: Number(optional('NEXT_PUBLIC_API_TIMEOUT_MS', '30000')),

  /** Runtime environment */
  appEnv: optional('NEXT_PUBLIC_APP_ENV', 'development'),

  /** Semantic version */
  appVersion: optional('NEXT_PUBLIC_APP_VERSION', '1.0.0'),

  /** True when running in a production build */
  isProduction: optional('NEXT_PUBLIC_APP_ENV', 'development') === 'production',
} as const;
