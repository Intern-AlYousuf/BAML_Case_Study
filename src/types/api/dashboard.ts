import type { Decimal, ISODatetime, CurrencyCode } from './common';

// ── Risk metrics ──────────────────────────────────────────────────────────────

export interface RiskMetricSnapshot {
  metric_name: string;
  value: Decimal | null;
  currency: CurrencyCode;
  unit: string | null;
  as_of: ISODatetime;
}

// ── Exposure ──────────────────────────────────────────────────────────────────

export interface ExposureSummary {
  asset_class: string;
  gross_exposure: Decimal;
  net_exposure: Decimal;
  currency: CurrencyCode;
  hedge_coverage: Decimal | null;
}

// ── Alerts ────────────────────────────────────────────────────────────────────

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface RiskAlert {
  alert_id: string;
  severity: AlertSeverity;
  metric: string;
  threshold: Decimal;
  current_value: Decimal;
  currency: CurrencyCode;
  triggered_at: ISODatetime;
  message: string;
}

// ── Performance attribution ───────────────────────────────────────────────────

export interface PerformanceAttribution {
  period: string;
  total_pnl: Decimal;
  fx_pnl: Decimal;
  rates_pnl: Decimal;
  commodity_pnl: Decimal;
  hedging_cost: Decimal;
  currency: CurrencyCode;
  as_of: ISODatetime;
}

// ── Dashboard summary ─────────────────────────────────────────────────────────

export interface DashboardSummary {
  total_scenarios: number;
  active_scenarios: number;
  pending_simulations: number;
  active_alerts: number;
  risk_metrics: RiskMetricSnapshot[];
  exposure_summary: ExposureSummary[];
  alerts: RiskAlert[];
  as_of: ISODatetime;
}

// ── Query params ──────────────────────────────────────────────────────────────

export interface RiskMetricsParams {
  currency?: CurrencyCode;
  scenario_id?: string;
}

export interface ExposureParams {
  currency?: CurrencyCode;
}

export interface AlertsParams {
  severity?: AlertSeverity;
}

export interface PerformanceParams {
  period?: 'daily' | 'mtd' | 'qtd' | 'ytd';
  currency?: CurrencyCode;
}
