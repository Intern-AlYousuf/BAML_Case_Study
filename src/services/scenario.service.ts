import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { cleanParams } from '@/lib/api/types';
import type {
  Scenario,
  ScenarioListResponse,
  CreateScenarioInput,
  UpdateScenarioInput,
  ScenarioListParams,
  UUID,
} from '@/types/api';

export class ScenarioService {
  /** Paginated list of all scenarios with optional status filter. */
  static async list(params?: ScenarioListParams): Promise<ScenarioListResponse> {
    return apiGet<ScenarioListResponse>(ENDPOINTS.scenarios.list, {
      params: cleanParams(params ?? {}),
    });
  }

  /** Retrieve a single scenario by UUID. */
  static async getById(id: UUID): Promise<Scenario> {
    return apiGet<Scenario>(ENDPOINTS.scenarios.byId(id));
  }

  /** Create a new risk scenario. Returns 201 with the created record. */
  static async create(input: CreateScenarioInput): Promise<Scenario> {
    return apiPost<Scenario, CreateScenarioInput>(
      ENDPOINTS.scenarios.create,
      input
    );
  }

  /** Partially update a scenario. Only supplied fields are changed. */
  static async update(id: UUID, input: UpdateScenarioInput): Promise<Scenario> {
    return apiPatch<Scenario, UpdateScenarioInput>(
      ENDPOINTS.scenarios.update(id),
      input
    );
  }

  /** Soft-delete a scenario. Returns 204 No Content. */
  static async delete(id: UUID): Promise<void> {
    return apiDelete(ENDPOINTS.scenarios.delete(id));
  }

  /** Hedges linked to a specific scenario. */
  static async listHedges(scenarioId: UUID): Promise<unknown[]> {
    return apiGet<unknown[]>(ENDPOINTS.scenarios.hedges(scenarioId));
  }

  /** Simulation results linked to a specific scenario. */
  static async listSimulations(scenarioId: UUID): Promise<unknown[]> {
    return apiGet<unknown[]>(ENDPOINTS.scenarios.simulations(scenarioId));
  }
}
