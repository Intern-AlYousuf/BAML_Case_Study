import { apiGet, apiPost } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { cleanParams } from '@/lib/api/types';
import type {
  ForecastResult,
  ForecastModelInfo,
  RunForecastInput,
  ForecastModelParams,
} from '@/types/api';

export class ForecastingService {
  /**
   * Submit a forecast job.
   * Returns 202 Accepted — poll getById() for results.
   * Requires ENABLE_ML_FORECASTING on the backend.
   */
  static async run(input: RunForecastInput): Promise<ForecastResult> {
    return apiPost<ForecastResult, RunForecastInput>(
      ENDPOINTS.forecasting.run,
      input
    );
  }

  /** Retrieve forecast job status and results. */
  static async getById(forecastId: string): Promise<ForecastResult> {
    return apiGet<ForecastResult>(ENDPOINTS.forecasting.byId(forecastId));
  }

  /** Registered forecasting models with supported asset classes and horizon bounds. */
  static async listModels(
    params?: ForecastModelParams
  ): Promise<ForecastModelInfo[]> {
    return apiGet<ForecastModelInfo[]>(ENDPOINTS.forecasting.models, {
      params: cleanParams(params ?? {}),
    });
  }
}
