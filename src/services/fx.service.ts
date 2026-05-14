import { apiGet, apiPost } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { cleanParams } from '@/lib/api/types';
import type {
  FXRate,
  FXForwardCurve,
  FXExposure,
  FXExposureSummary,
  FXStressTestInput,
  FXRatesParams,
  FXForwardCurveParams,
  FXExposureParams,
  CurrencyCode,
} from '@/types/api';

export class FXService {
  /** All tracked FX rates with optional base/quote currency filter. */
  static async listRates(params?: FXRatesParams): Promise<FXRate[]> {
    return apiGet<FXRate[]>(ENDPOINTS.fx.rates, {
      params: cleanParams(params ?? {}),
    });
  }

  /** Rate for a specific currency pair — e.g. "EURUSD". */
  static async getRateByPair(pair: string, source?: string): Promise<FXRate> {
    return apiGet<FXRate>(ENDPOINTS.fx.rateByPair(pair), {
      params: cleanParams({ source }),
    });
  }

  /** Bootstrapped forward rate curve for a currency pair. */
  static async getForwardCurve(
    pair: string,
    params?: FXForwardCurveParams
  ): Promise<FXForwardCurve> {
    return apiGet<FXForwardCurve>(ENDPOINTS.fx.forwardCurve(pair), {
      params: cleanParams(params ?? {}),
    });
  }

  /**
   * Aggregate FX exposure across all currencies vs. a base currency.
   */
  static async getExposureSummary(
    params?: FXExposureParams
  ): Promise<FXExposureSummary> {
    return apiGet<FXExposureSummary>(ENDPOINTS.fx.exposure, {
      params: cleanParams(params ?? {}),
    });
  }

  /** Exposure for a single foreign currency. */
  static async getExposureByCurrency(
    currency: CurrencyCode,
    baseCurrency?: CurrencyCode
  ): Promise<FXExposure> {
    return apiGet<FXExposure>(ENDPOINTS.fx.exposureByCcy(currency), {
      params: cleanParams({ base_currency: baseCurrency }),
    });
  }

  /**
   * Submit a parallel-shock FX stress-test job.
   * Requires ENABLE_MONTE_CARLO on the backend.
   * Returns 202 Accepted — poll /simulations/{id} for results.
   */
  static async submitStressTest(
    input: FXStressTestInput
  ): Promise<{ status: string; message: string }> {
    return apiPost<{ status: string; message: string }, FXStressTestInput>(
      ENDPOINTS.fx.stressTest,
      input
    );
  }
}
