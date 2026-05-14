import { apiGet } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { cleanParams } from '@/lib/api/types';
import type {
  DashboardSummary,
  RiskMetricSnapshot,
  ExposureSummary,
  RiskAlert,
  PerformanceAttribution,
  RiskMetricsParams,
  ExposureParams,
  AlertsParams,
  PerformanceParams,
} from '@/types/api';

export class DashboardService {
  /**
   * Aggregate risk dashboard snapshot.
   * Includes scenario counts, simulation queue, exposure, and alerts.
   */
  static async getSummary(): Promise<DashboardSummary> {
    return apiGet<DashboardSummary>(ENDPOINTS.dashboard.summary);
  }

  /**
   * Portfolio-level risk metrics: VaR 95/99, CVaR, DV01, Greeks.
   */
  static async getRiskMetrics(
    params?: RiskMetricsParams
  ): Promise<RiskMetricSnapshot[]> {
    return apiGet<RiskMetricSnapshot[]>(ENDPOINTS.dashboard.riskMetrics, {
      params: cleanParams(params ?? {}),
    });
  }

  /**
   * Cross-asset exposure breakdown with hedge coverage ratios.
   */
  static async getExposure(
    params?: ExposureParams
  ): Promise<ExposureSummary[]> {
    return apiGet<ExposureSummary[]>(ENDPOINTS.dashboard.exposure, {
      params: cleanParams(params ?? {}),
    });
  }

  /**
   * Active risk limit alerts ordered by severity.
   */
  static async getAlerts(params?: AlertsParams): Promise<RiskAlert[]> {
    return apiGet<RiskAlert[]>(ENDPOINTS.dashboard.alerts, {
      params: cleanParams(params ?? {}),
    });
  }

  /**
   * P&L attribution split by source: FX, rates, commodities, hedging cost.
   */
  static async getPerformance(
    params?: PerformanceParams
  ): Promise<PerformanceAttribution[]> {
    return apiGet<PerformanceAttribution[]>(ENDPOINTS.dashboard.performance, {
      params: cleanParams(params ?? {}),
    });
  }
}
