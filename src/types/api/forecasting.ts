import type { JobStatus } from './common';

// ── Forecast job ──────────────────────────────────────────────────────────────

export interface ForecastResult {
  forecast_id: string;
  ticker: string;
  horizon_days: number;
  model_name: string;
  status: JobStatus | 'pending';
}

// ── Model catalog ─────────────────────────────────────────────────────────────

export interface ForecastModelInfo {
  model_name: string;
  description: string;
  supported_asset_classes: string[];
  min_horizon_days: number;
  max_horizon_days: number;
  requires_live_feeds: boolean;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export interface RunForecastInput {
  ticker: string;
  horizon_days: number;
  model_name?: string;
  scenario_id?: string;
}

// ── Query params ──────────────────────────────────────────────────────────────

export interface ForecastModelParams {
  asset_class?: string;
}
