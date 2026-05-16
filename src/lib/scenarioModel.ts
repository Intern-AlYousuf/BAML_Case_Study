/**
 * scenarioModel — pure financial computation layer.
 *
 * No framework imports. All functions are pure and synchronous.
 * This module is the single source of truth for:
 *  - scenario input types and defaults
 *  - sensitivity coefficients
 *  - EBITDA computation
 *  - chart data builders (waterfall, comparison, sensitivity)
 *
 * When the backend is connected, only `computeOutputs` needs to be
 * replaced with an API call; callers remain unchanged.
 */

/* ─────────────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────────────── */

export interface ScenarioInputs {
  wti:          number;   // $/bbl
  brent:        number;   // $/bbl
  naturalGas:   number;   // $/MMBtu
  eurUsd:       number;   // rate
  gbpUsd:       number;   // rate
  freight:      number;   // multiplier (1.0 = base)
  carbonCost:   number;   // €/tCO₂
  hedgeEnabled: boolean;
  hedgeRatio:   number;   // 0–100 %
}

export interface ScenarioOutputs {
  commodityImpact:       number;  // $M
  fxImpact:              number;  // $M
  freightImpact:         number;  // $M
  carbonImpact:          number;  // $M
  hedgeBenefit:          number;  // $M (always ≥ 0)
  netEBITDA:             number;  // $M
  totalImpact:           number;  // $M vs base (signed)
  totalNegativeExposure: number;  // $M (always ≥ 0)
}

export interface WaterfallEntry {
  name:     string;
  baseline: number;  // transparent spacer
  positive: number;
  negative: number;
  isTotal:  boolean;
  isHedge:  boolean;
  delta:    number;  // signed change
}

export interface ComparisonEntry {
  name:   string;
  ebitda: number;
}

export interface SensitivityEntry {
  name:  string;
  value: number;  // signed $M impact
}

/* ─────────────────────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────────────────────── */

export const BASE_EBITDA = 487.2;  // $M — FY2026 base case

export const BASE_INPUTS: ScenarioInputs = {
  wti:          82.14,
  brent:        85.60,
  naturalGas:   2.84,
  eurUsd:       1.0845,
  gbpUsd:       1.2731,
  freight:      1.0,
  carbonCost:   65.20,
  hedgeEnabled: true,
  hedgeRatio:   67.4,
};

/** Linear sensitivity coefficients — replace with API-sourced values post-integration */
export const SENS = {
  wtiPerDollar:    -2.80,   // $M per +$1/bbl WTI
  brentPerDollar:  -1.20,   // $M per +$1/bbl Brent
  gasPerTenth:     -1.80,   // $M per +$0.1/MMBtu Natural Gas
  eurUsdPer001:     3.20,   // $M per +0.01 EUR/USD (EUR appreciation = good)
  gbpUsdPer001:     1.80,   // $M per +0.01 GBP/USD
  freightPer10pct: -12.40,  // $M per +10% freight multiplier
  carbonPerEuro:   -0.80,   // $M per +€1/tCO₂ carbon cost
} as const;

export interface PresetDefinition {
  label:       string;
  description: string;
  inputs:      ScenarioInputs;
}

export const PRESETS: Record<string, PresetDefinition> = {
  base: {
    label:       'Base Case',
    description: 'FY2026 planning assumptions',
    inputs:      { ...BASE_INPUTS },
  },
  'bear-oil': {
    label:       'Bear Oil +20%',
    description: 'WTI, Brent & gas shock',
    inputs:      { ...BASE_INPUTS, wti: 98.57, brent: 102.72, naturalGas: 3.41, freight: 1.15 },
  },
  'fx-shock': {
    label:       'FX Bear',
    description: 'USD strengthens 10%',
    inputs:      { ...BASE_INPUTS, eurUsd: 0.9761, gbpUsd: 1.1458 },
  },
  'full-hedge': {
    label:       'Full Hedge',
    description: '90% hedge coverage',
    inputs:      { ...BASE_INPUTS, hedgeRatio: 90 },
  },
  'stress-test': {
    label:       'Stress Test',
    description: 'Combined adverse scenario',
    inputs: {
      wti: 108.0, brent: 112.0, naturalGas: 4.10,
      eurUsd: 0.9400, gbpUsd: 1.0900,
      freight: 1.45, carbonCost: 78.0,
      hedgeEnabled: false, hedgeRatio: 67.4,
    },
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Core computation
───────────────────────────────────────────────────────────────────────────── */

export function computeOutputs(inputs: ScenarioInputs): ScenarioOutputs {
  const commodityImpact =
    (inputs.wti       - BASE_INPUTS.wti)       * SENS.wtiPerDollar +
    (inputs.brent     - BASE_INPUTS.brent)     * SENS.brentPerDollar +
    ((inputs.naturalGas - BASE_INPUTS.naturalGas) / 0.1) * SENS.gasPerTenth;

  const fxImpact =
    ((inputs.eurUsd - BASE_INPUTS.eurUsd) / 0.01) * SENS.eurUsdPer001 +
    ((inputs.gbpUsd - BASE_INPUTS.gbpUsd) / 0.01) * SENS.gbpUsdPer001;

  const freightImpact = (inputs.freight   - BASE_INPUTS.freight)   * 10 * SENS.freightPer10pct;
  const carbonImpact  = (inputs.carbonCost - BASE_INPUTS.carbonCost) * SENS.carbonPerEuro;

  const rawImpact             = commodityImpact + fxImpact + freightImpact + carbonImpact;
  const totalNegativeExposure = -Math.min(0, rawImpact);
  const hedgeBenefit          = inputs.hedgeEnabled
    ? totalNegativeExposure * (inputs.hedgeRatio / 100)
    : 0;

  const netEBITDA   = BASE_EBITDA + rawImpact + hedgeBenefit;
  const totalImpact = netEBITDA - BASE_EBITDA;

  return {
    commodityImpact,
    fxImpact,
    freightImpact,
    carbonImpact,
    hedgeBenefit,
    netEBITDA,
    totalImpact,
    totalNegativeExposure,
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   Chart data builders
───────────────────────────────────────────────────────────────────────────── */

export function buildWaterfallData(outputs: ScenarioOutputs): WaterfallEntry[] {
  const { commodityImpact, fxImpact, freightImpact, carbonImpact, hedgeBenefit, netEBITDA } = outputs;
  let running = BASE_EBITDA;

  function step(name: string, delta: number, isTotal = false, isHedge = false): WaterfallEntry {
    if (isTotal) {
      return { name, baseline: 0, positive: delta, negative: 0, isTotal: true, isHedge: false, delta };
    }
    if (delta >= 0) {
      const entry = { name, baseline: running, positive: delta, negative: 0, isTotal: false, isHedge, delta };
      running += delta;
      return entry;
    }
    running += delta;
    return { name, baseline: running, positive: 0, negative: -delta, isTotal: false, isHedge: false, delta };
  }

  return [
    step('Base',      BASE_EBITDA,    true),
    step('Commodity', commodityImpact),
    step('FX',        fxImpact),
    step('Freight',   freightImpact),
    step('Carbon',    carbonImpact),
    step('Hedge',     hedgeBenefit,  false, true),
    step('Net',       netEBITDA,     true),
  ];
}

export function buildComparisonData(outputs: ScenarioOutputs): ComparisonEntry[] {
  const unhedged = outputs.netEBITDA - outputs.hedgeBenefit;
  return [
    { name: 'Base Case', ebitda: BASE_EBITDA   },
    { name: 'Unhedged',  ebitda: unhedged       },
    { name: 'Hedged',    ebitda: outputs.netEBITDA },
  ];
}

export function buildSensitivityData(inputs: ScenarioInputs): SensitivityEntry[] {
  return [
    { name: 'WTI +$8',      value: 8 * SENS.wtiPerDollar },
    { name: 'Brent +$9',    value: 9 * SENS.brentPerDollar },
    { name: 'Nat Gas +10%', value: (inputs.naturalGas * 0.1 / 0.1) * SENS.gasPerTenth },
    { name: 'EUR/USD +3%',  value: (inputs.eurUsd * 0.03 / 0.01) * SENS.eurUsdPer001 },
    { name: 'GBP/USD +3%',  value: (inputs.gbpUsd * 0.03 / 0.01) * SENS.gbpUsdPer001 },
    { name: 'Freight +20%', value: 2 * SENS.freightPer10pct },
    { name: 'Carbon +€10',  value: 10 * SENS.carbonPerEuro },
  ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
}
