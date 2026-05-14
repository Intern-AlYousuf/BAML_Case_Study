import type { Decimal, ISODatetime, CurrencyCode } from './common';

// ── Currency pair ─────────────────────────────────────────────────────────────

export interface CurrencyPair {
  pair: string;
  base_currency: CurrencyCode;
  quote_currency: CurrencyCode;
}

// ── FX rate ───────────────────────────────────────────────────────────────────

export interface FXRate extends CurrencyPair {
  mid: Decimal | null;
  bid: Decimal | null;
  ask: Decimal | null;
  spread_bps: Decimal | null;
  source: string;
  as_of: ISODatetime;
}

// ── Forward curve ─────────────────────────────────────────────────────────────

export interface FXForwardPoint {
  tenor: string;
  tenor_days: number;
  forward_rate: Decimal;
  swap_points: Decimal;
}

export interface FXForwardCurve extends CurrencyPair {
  spot_rate: Decimal;
  points: FXForwardPoint[];
  as_of: ISODatetime;
}

// ── Exposure ──────────────────────────────────────────────────────────────────

export interface FXExposure {
  currency: CurrencyCode;
  base_currency: CurrencyCode;
  gross_notional: Decimal;
  net_notional: Decimal;
  hedge_notional: Decimal;
  hedge_ratio: Decimal;
  unrealised_pnl: Decimal | null;
  as_of: ISODatetime;
}

export interface FXExposureSummary {
  base_currency: CurrencyCode;
  exposures: FXExposure[];
  total_gross: Decimal;
  total_net: Decimal;
  overall_hedge_ratio: Decimal;
  as_of: ISODatetime;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export interface FXStressTestInput {
  currency_pairs: string[];
  shock_bps: number;
  scenario_id?: string;
}

// ── Query params ──────────────────────────────────────────────────────────────

export interface FXRatesParams {
  base?: CurrencyCode;
  quote?: CurrencyCode;
  source?: string;
}

export interface FXForwardCurveParams {
  tenors?: string;
}

export interface FXExposureParams {
  base_currency?: CurrencyCode;
  scenario_id?: string;
}
