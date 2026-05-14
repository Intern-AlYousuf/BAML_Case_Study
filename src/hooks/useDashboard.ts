'use client';

import { useApi } from './useApi';
import { DashboardService } from '@/services/dashboard.service';
import type {
  AlertsParams,
  ExposureParams,
  PerformanceParams,
  RiskMetricsParams,
} from '@/types/api';

/**
 * Fetches the full dashboard summary on mount.
 * Includes scenario counts, simulation queue, exposure, and alerts.
 */
export function useDashboardSummary() {
  return useApi(() => DashboardService.getSummary(), { immediate: true });
}

/**
 * Fetches risk metrics (VaR, CVaR, DV01) for the dashboard.
 * Re-fetches when `params` identity changes (pass a stable object or useMemo).
 */
export function useRiskMetrics(params?: RiskMetricsParams) {
  return useApi(() => DashboardService.getRiskMetrics(params), {
    immediate: true,
    deps: [params?.currency, params?.scenario_id],
  });
}

/**
 * Fetches cross-asset exposure breakdown.
 */
export function useExposure(params?: ExposureParams) {
  return useApi(() => DashboardService.getExposure(params), {
    immediate: true,
    deps: [params?.currency],
  });
}

/**
 * Fetches active risk limit alerts.
 */
export function useRiskAlerts(params?: AlertsParams) {
  return useApi(() => DashboardService.getAlerts(params), {
    immediate: true,
    deps: [params?.severity],
  });
}

/**
 * Fetches P&L performance attribution.
 */
export function usePerformanceAttribution(params?: PerformanceParams) {
  return useApi(() => DashboardService.getPerformance(params), {
    immediate: true,
    deps: [params?.period, params?.currency],
  });
}
