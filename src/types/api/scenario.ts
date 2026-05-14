import type { UUID, Decimal, ISODatetime } from './common';

export type ScenarioStatus = 'draft' | 'active' | 'archived';

// ── Scenario ──────────────────────────────────────────────────────────────────

export interface Scenario {
  id: UUID;
  name: string;
  description: string | null;
  status: ScenarioStatus;
  base_rate: Decimal | null;
  stress_factor: Decimal | null;
  horizon_days: number | null;
  created_at: ISODatetime;
  updated_at: ISODatetime;
}

export interface ScenarioListResponse {
  total: number;
  items: Scenario[];
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export interface CreateScenarioInput {
  name: string;
  description?: string;
  base_rate?: number;
  stress_factor?: number;
  horizon_days?: number;
}

export interface UpdateScenarioInput {
  name?: string;
  description?: string;
  status?: ScenarioStatus;
  base_rate?: number;
  stress_factor?: number;
  horizon_days?: number;
}

// ── Query params ──────────────────────────────────────────────────────────────

export interface ScenarioListParams {
  offset?: number;
  limit?: number;
  status?: ScenarioStatus;
}
