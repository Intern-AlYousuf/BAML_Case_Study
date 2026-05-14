import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { cleanParams } from '@/lib/api/types';
import type {
  HedgeConfiguration,
  CreateHedgeInput,
  UpdateHedgeInput,
  HedgeListParams,
  UUID,
} from '@/types/api';

export class HedgeService {
  /** List hedge configurations, optionally filtered by scenario. */
  static async list(params?: HedgeListParams): Promise<HedgeConfiguration[]> {
    return apiGet<HedgeConfiguration[]>(ENDPOINTS.hedges.list, {
      params: cleanParams(params ?? {}),
    });
  }

  /** Retrieve a single hedge configuration by UUID. */
  static async getById(id: UUID): Promise<HedgeConfiguration> {
    return apiGet<HedgeConfiguration>(ENDPOINTS.hedges.byId(id));
  }

  /** Create a new hedge configuration. */
  static async create(input: CreateHedgeInput): Promise<HedgeConfiguration> {
    return apiPost<HedgeConfiguration, CreateHedgeInput>(
      ENDPOINTS.hedges.create,
      input
    );
  }

  /** Partially update a hedge configuration. */
  static async update(
    id: UUID,
    input: UpdateHedgeInput
  ): Promise<HedgeConfiguration> {
    return apiPatch<HedgeConfiguration, UpdateHedgeInput>(
      ENDPOINTS.hedges.update(id),
      input
    );
  }

  /** Delete a hedge configuration. Returns 204 No Content. */
  static async delete(id: UUID): Promise<void> {
    return apiDelete(ENDPOINTS.hedges.delete(id));
  }

  /** All hedge configurations linked to a specific scenario. */
  static async listByScenario(
    scenarioId: UUID,
    params?: Pick<HedgeListParams, 'offset' | 'limit'>
  ): Promise<HedgeConfiguration[]> {
    return apiGet<HedgeConfiguration[]>(
      ENDPOINTS.hedges.byScenario(scenarioId),
      { params: cleanParams(params ?? {}) }
    );
  }
}
