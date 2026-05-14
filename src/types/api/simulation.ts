import type { UUID, Decimal, ISODatetime, JobStatus } from './common';

// ── Simulation result ─────────────────────────────────────────────────────────

export interface SimulationResult {
  id: UUID;
  scenario_id: UUID | null;
  simulation_type: string;
  iterations: number | null;
  status: JobStatus;
  mean_value: Decimal | null;
  std_dev: Decimal | null;
  var_95: Decimal | null;
  var_99: Decimal | null;
  notes: string | null;
  created_at: ISODatetime;
  updated_at: ISODatetime;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export interface SubmitSimulationInput {
  scenario_id?: UUID;
  simulation_type: string;
  iterations?: number;
  notes?: string;
}

// ── Query params ──────────────────────────────────────────────────────────────

export interface SimulationListParams {
  scenario_id?: UUID;
  status?: JobStatus;
  offset?: number;
  limit?: number;
}
