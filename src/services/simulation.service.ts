import { apiGet, apiPost } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { cleanParams } from '@/lib/api/types';
import type {
  SimulationResult,
  SubmitSimulationInput,
  SimulationListParams,
  UUID,
} from '@/types/api';

export class SimulationService {
  /**
   * Submit an async simulation job.
   * Returns 202 Accepted with status='pending'.
   * Poll getById() until status is 'completed' or 'failed'.
   */
  static async submit(input: SubmitSimulationInput): Promise<SimulationResult> {
    return apiPost<SimulationResult, SubmitSimulationInput>(
      ENDPOINTS.simulations.submit,
      input
    );
  }

  /** List simulation jobs with optional scenario / status filters. */
  static async list(
    params?: SimulationListParams
  ): Promise<SimulationResult[]> {
    return apiGet<SimulationResult[]>(ENDPOINTS.simulations.list, {
      params: cleanParams(params ?? {}),
    });
  }

  /** Retrieve the current status and summary statistics for a job. */
  static async getById(id: UUID): Promise<SimulationResult> {
    return apiGet<SimulationResult>(ENDPOINTS.simulations.byId(id));
  }

  /**
   * Poll a simulation job until it reaches a terminal state.
   * Resolves with the completed result or rejects on failure / timeout.
   *
   * @param id         Simulation UUID
   * @param intervalMs Poll interval (default 2 000 ms)
   * @param maxAttempts Maximum poll attempts before giving up (default 60 → 2 min)
   */
  static async poll(
    id: UUID,
    intervalMs = 2_000,
    maxAttempts = 60
  ): Promise<SimulationResult> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await SimulationService.getById(id);

      if (result.status === 'completed') return result;
      if (result.status === 'failed') {
        throw new Error(`Simulation ${id} failed: ${result.notes ?? 'no details'}`);
      }

      await new Promise<void>((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error(
      `Simulation ${id} did not complete after ${maxAttempts} poll attempts`
    );
  }
}
