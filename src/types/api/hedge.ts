import type { UUID, Decimal, ISODatetime } from './common';

// ── Hedge configuration ───────────────────────────────────────────────────────

export interface HedgeConfiguration {
  id: UUID;
  scenario_id: UUID | null;
  instrument_type: string;
  notional: Decimal | null;
  strike: Decimal | null;
  maturity_days: number | null;
  hedge_ratio: Decimal | null;
  created_at: ISODatetime;
  updated_at: ISODatetime;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export interface CreateHedgeInput {
  scenario_id?: UUID;
  instrument_type: string;
  notional?: number;
  strike?: number;
  maturity_days?: number;
  hedge_ratio?: number;
}

export interface UpdateHedgeInput {
  instrument_type?: string;
  notional?: number;
  strike?: number;
  maturity_days?: number;
  hedge_ratio?: number;
}

// ── Query params ──────────────────────────────────────────────────────────────

export interface HedgeListParams {
  scenario_id?: UUID;
  offset?: number;
  limit?: number;
}
