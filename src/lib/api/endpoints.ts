/**
 * Centralised API endpoint path constants.
 *
 * No service module may construct URL strings directly.
 * All paths are defined here so a prefix change or versioning
 * update has a single point of change.
 */

const V1 = '/api/v1';

export const ENDPOINTS = {
  // ── Health ───────────────────────────────────────────────────────────────
  health: {
    live:  `${V1}/health/live`,
    ready: `${V1}/health/ready`,
  },

  // ── Dashboard ────────────────────────────────────────────────────────────
  dashboard: {
    summary:     `${V1}/dashboard/summary`,
    riskMetrics: `${V1}/dashboard/risk-metrics`,
    exposure:    `${V1}/dashboard/exposure`,
    alerts:      `${V1}/dashboard/alerts`,
    performance: `${V1}/dashboard/performance`,
  },

  // ── Scenarios ────────────────────────────────────────────────────────────
  scenarios: {
    list:        `${V1}/scenarios/`,
    create:      `${V1}/scenarios/`,
    byId:        (id: string) => `${V1}/scenarios/${id}`,
    update:      (id: string) => `${V1}/scenarios/${id}`,
    delete:      (id: string) => `${V1}/scenarios/${id}`,
    hedges:      (id: string) => `${V1}/scenarios/${id}/hedges`,
    simulations: (id: string) => `${V1}/scenarios/${id}/simulations`,
  },

  // ── Hedges ───────────────────────────────────────────────────────────────
  hedges: {
    list:          `${V1}/hedges/`,
    create:        `${V1}/hedges/`,
    byId:          (id: string) => `${V1}/hedges/${id}`,
    update:        (id: string) => `${V1}/hedges/${id}`,
    delete:        (id: string) => `${V1}/hedges/${id}`,
    byScenario:    (scenarioId: string) => `${V1}/hedges/scenario/${scenarioId}`,
  },

  // ── Instruments & Market Data ─────────────────────────────────────────────
  instruments: {
    list:              `${V1}/instruments/`,
    byTicker:          (ticker: string) => `${V1}/instruments/${ticker}`,
    marketDataIngest:  `${V1}/instruments/market-data`,
    marketDataQuery:   `${V1}/instruments/market-data`,
    commodities:       `${V1}/instruments/commodities`,
    commodityBySymbol: (symbol: string) => `${V1}/instruments/commodities/${symbol}`,
  },

  // ── FX ───────────────────────────────────────────────────────────────────
  fx: {
    rates:           `${V1}/fx/rates`,
    rateByPair:      (pair: string) => `${V1}/fx/rates/${pair}`,
    forwardCurve:    (pair: string) => `${V1}/fx/forward-curve/${pair}`,
    exposure:        `${V1}/fx/exposure`,
    exposureByCcy:   (currency: string) => `${V1}/fx/exposure/${currency}`,
    stressTest:      `${V1}/fx/stress-test`,
  },

  // ── Simulations ──────────────────────────────────────────────────────────
  simulations: {
    list:   `${V1}/simulations/`,
    submit: `${V1}/simulations/`,
    byId:   (id: string) => `${V1}/simulations/${id}`,
  },

  // ── Forecasting ──────────────────────────────────────────────────────────
  forecasting: {
    run:    `${V1}/forecasting/run`,
    byId:   (id: string) => `${V1}/forecasting/${id}`,
    models: `${V1}/forecasting/models`,
  },
} as const;
