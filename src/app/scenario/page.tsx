'use client';

import { useState, useMemo, useCallback } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import {
  RotateCcw,
  Zap,
  TrendingUp,
  TrendingDown,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FlameKindling,
  ChevronRight,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   Model types & constants
───────────────────────────────────────────────────────────────────────────── */

interface ScenarioState {
  wti: number;
  brent: number;
  naturalGas: number;
  eurUsd: number;
  gbpUsd: number;
  freight: number;
  carbonCost: number;
  hedgeEnabled: boolean;
  hedgeRatio: number;
}

const BASE: ScenarioState = {
  wti: 82.14,
  brent: 85.60,
  naturalGas: 2.84,
  eurUsd: 1.0845,
  gbpUsd: 1.2731,
  freight: 1.0,
  carbonCost: 65.20,
  hedgeEnabled: true,
  hedgeRatio: 67.4,
};

const BASE_EBITDA = 487.2;

// Impact sensitivities
const SENS = {
  wtiPerDollar:    -2.80,   // $M per $1/bbl change in WTI
  brentPerDollar:  -1.20,   // $M per $1/bbl change in Brent
  gasPerTenth:     -1.80,   // $M per $0.1/MMBtu change in NatGas
  eurUsdPer001:     3.20,   // $M per +0.01 in EUR/USD (positive = EUR up = good)
  gbpUsdPer001:     1.80,   // $M per +0.01 in GBP/USD
  freightPer10pct: -12.40,  // $M per 10% increase in freight
  carbonPerEuro:   -0.80,   // $M per +€1/tCO₂
};

const PRESETS: Record<string, { label: string; description: string; state: ScenarioState }> = {
  base: {
    label: 'Base Case',
    description: 'FY2026 planning assumptions',
    state: { ...BASE },
  },
  'bear-oil': {
    label: 'Bear Oil +20%',
    description: 'WTI, Brent and gas shock',
    state: {
      ...BASE,
      wti: 98.57,
      brent: 102.72,
      naturalGas: 3.41,
      freight: 1.15,
    },
  },
  'fx-shock': {
    label: 'FX Bear',
    description: 'USD strengthens 10%',
    state: {
      ...BASE,
      eurUsd: 0.9761,
      gbpUsd: 1.1458,
    },
  },
  'full-hedge': {
    label: 'Full Hedge',
    description: '90% hedge coverage',
    state: {
      ...BASE,
      hedgeRatio: 90,
    },
  },
  'stress-test': {
    label: 'Stress Test',
    description: 'Combined adverse scenario',
    state: {
      wti: 108.0,
      brent: 112.0,
      naturalGas: 4.10,
      eurUsd: 0.9400,
      gbpUsd: 1.0900,
      freight: 1.45,
      carbonCost: 78.0,
      hedgeEnabled: false,
      hedgeRatio: 67.4,
    },
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Scenario computation
───────────────────────────────────────────────────────────────────────────── */

function computeOutputs(s: ScenarioState) {
  const commodityImpact =
    (s.wti - BASE.wti) * SENS.wtiPerDollar +
    (s.brent - BASE.brent) * SENS.brentPerDollar +
    ((s.naturalGas - BASE.naturalGas) / 0.1) * SENS.gasPerTenth;

  const fxImpact =
    ((s.eurUsd - BASE.eurUsd) / 0.01) * SENS.eurUsdPer001 +
    ((s.gbpUsd - BASE.gbpUsd) / 0.01) * SENS.gbpUsdPer001;

  const freightImpact = (s.freight - BASE.freight) * 10 * SENS.freightPer10pct;

  const carbonImpact = (s.carbonCost - BASE.carbonCost) * SENS.carbonPerEuro;

  const totalNegativeExposure = -Math.min(0, commodityImpact + fxImpact + freightImpact + carbonImpact);
  const hedgeBenefit = s.hedgeEnabled ? totalNegativeExposure * (s.hedgeRatio / 100) : 0;

  const netEBITDA =
    BASE_EBITDA + commodityImpact + fxImpact + freightImpact + carbonImpact + hedgeBenefit;

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

/* Waterfall data builder */
function buildWaterfall(outputs: ReturnType<typeof computeOutputs>) {
  const { commodityImpact, fxImpact, freightImpact, carbonImpact, hedgeBenefit, netEBITDA } = outputs;

  let running = BASE_EBITDA;

  const makeStep = (
    name: string,
    delta: number,
    isTotal = false,
    isHedge = false,
  ) => {
    if (isTotal) {
      const entry = { name, baseline: 0, positive: delta, negative: 0, isTotal: true, isHedge: false, delta };
      return entry;
    }
    if (delta >= 0) {
      const entry = { name, baseline: running, positive: delta, negative: 0, isTotal: false, isHedge, delta };
      running += delta;
      return entry;
    } else {
      running += delta;
      return { name, baseline: running, positive: 0, negative: -delta, isTotal: false, isHedge: false, delta };
    }
  };

  return [
    makeStep('Base\nEBITDA', BASE_EBITDA, true),
    makeStep('Commodity', commodityImpact),
    makeStep('FX\nRates', fxImpact),
    makeStep('Freight', freightImpact),
    makeStep('Carbon', carbonImpact),
    makeStep('Hedge\nBenefit', hedgeBenefit, false, true),
    makeStep('Net\nEBITDA', netEBITDA, true),
  ];
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sub-components — Controls
───────────────────────────────────────────────────────────────────────────── */

function ControlSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-b border-[var(--border-subtle)] last:border-b-0">
      <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-[var(--text-muted)] mb-4">
        {title}
      </p>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function ScenarioSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  displayFormat,
  unit,
  delta,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  displayFormat?: (v: number) => string;
  unit?: string;
  delta?: number;
}) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const display = displayFormat ? displayFormat(value) : value.toFixed(2);
  const hasDelta = delta !== undefined && Math.abs(delta) > 0.001;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12.5px] font-medium text-[var(--text-secondary)] leading-none">
          {label}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {hasDelta && (
            <span
              className={cn(
                'text-[10.5px] font-mono font-semibold nums-tabular',
                delta! > 0 ? 'text-[var(--status-positive)]' : 'text-[var(--status-negative)]'
              )}
            >
              {delta! > 0 ? '+' : ''}{delta!.toFixed(2)}
            </span>
          )}
          <span className="font-mono text-[13px] font-bold text-[var(--text-primary)] nums-tabular leading-none">
            {display}
          </span>
          {unit && (
            <span className="text-[10px] text-[var(--text-muted)] leading-none">{unit}</span>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider-track w-full"
        style={{
          '--slider-pct': `${pct}%`,
        } as React.CSSProperties}
      />
      <div className="flex justify-between">
        <span className="text-[10px] text-[var(--text-muted)] nums-tabular">
          {displayFormat ? displayFormat(min) : min}
        </span>
        <span className="text-[10px] text-[var(--text-muted)] nums-tabular">
          {displayFormat ? displayFormat(max) : max}
        </span>
      </div>
    </div>
  );
}

function HedgeToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[12.5px] font-medium text-[var(--text-primary)]">Active Hedge Program</p>
        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
          {checked ? 'Hedges applied to downside exposure' : 'No hedge protection active'}
        </p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-10 h-[22px] rounded-full transition-colors duration-200 shrink-0',
          checked ? 'bg-[var(--accent-primary)]' : 'bg-[var(--surface-elevated)]'
        )}
        role="switch"
        aria-checked={checked}
      >
        <motion.span
          className={cn(
            'absolute top-[3px] w-4 h-4 rounded-full transition-colors duration-200',
            checked ? 'bg-black' : 'bg-[var(--text-muted)]'
          )}
          animate={{ left: checked ? 'calc(100% - 19px)' : '3px' }}
          transition={{ type: 'spring', stiffness: 600, damping: 35 }}
        />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sub-components — Outputs
───────────────────────────────────────────────────────────────────────────── */

function OutputKPI({
  label,
  value,
  delta,
  unit,
  unitPrefix,
  trend,
  highlight,
}: {
  label: string;
  value: string;
  delta?: string;
  unit?: string;
  unitPrefix?: boolean;
  trend?: 'positive' | 'negative' | 'neutral';
  highlight?: boolean;
}) {
  const DeltaIcon =
    trend === 'positive' ? ArrowUpRight :
    trend === 'negative' ? ArrowDownRight :
    Minus;

  const deltaColor =
    trend === 'positive' ? 'text-[var(--status-positive)]' :
    trend === 'negative' ? 'text-[var(--status-negative)]' :
    'text-[var(--text-muted)]';

  return (
    <div
      className={cn(
        'flex flex-col p-5 rounded-xl border transition-colors duration-150',
        highlight
          ? 'bg-[var(--accent-dim)] border-[rgba(255,230,0,0.2)]'
          : 'bg-[var(--surface-secondary)] border-[var(--border-subtle)] hover:bg-[var(--surface-elevated)]'
      )}
    >
      <p className="text-[10.5px] font-semibold tracking-[0.14em] uppercase text-[var(--text-muted)] mb-4">
        {label}
      </p>
      <div className="flex items-baseline gap-1 mt-auto mb-2">
        {unit && unitPrefix && (
          <span className={cn('font-mono text-[17px] font-medium', highlight ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]')}>
            {unit}
          </span>
        )}
        <span
          className={cn(
            'font-mono font-bold leading-none nums-tabular tracking-tight',
            highlight ? 'text-[var(--accent-primary)] text-[38px]' : 'text-[var(--text-primary)] text-[34px]'
          )}
        >
          {value}
        </span>
        {unit && !unitPrefix && (
          <span className={cn('font-mono text-[17px] font-medium', highlight ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]')}>
            {unit}
          </span>
        )}
      </div>
      {delta && (
        <div className={cn('flex items-center gap-1.5', deltaColor)}>
          <DeltaIcon className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
          <span className="font-mono text-[12.5px] font-semibold nums-tabular">{delta}</span>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Charts
───────────────────────────────────────────────────────────────────────────── */

interface WaterfallEntry {
  name: string;
  baseline: number;
  positive: number;
  negative: number;
  isTotal: boolean;
  isHedge: boolean;
  delta: number;
}

function WaterfallTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: WaterfallEntry }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const val = d.isTotal ? d.positive : d.delta;
  const isNeg = val < 0;

  return (
    <div className="bg-[var(--surface-elevated)] border border-[var(--border-base)] rounded-lg px-3.5 py-2.5 shadow-lg">
      <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[var(--text-muted)] mb-1.5">
        {d.name.replace('\n', ' ')}
      </p>
      <p
        className={cn(
          'font-mono text-[15px] font-bold nums-tabular',
          d.isTotal
            ? 'text-[var(--accent-primary)]'
            : d.isHedge
            ? 'text-[var(--chart-2)]'
            : isNeg
            ? 'text-[var(--status-negative)]'
            : 'text-[var(--status-positive)]'
        )}
      >
        {d.isTotal
          ? `$${val.toFixed(1)}M`
          : `${val > 0 ? '+' : ''}$${val.toFixed(1)}M`}
      </p>
    </div>
  );
}

function WaterfallChart({ data }: { data: WaterfallEntry[] }) {
  const allValues = data.map(d => d.baseline + Math.max(d.positive, d.negative));
  const maxVal = Math.max(...allValues);
  const minBaseline = Math.min(...data.map(d => d.baseline));
  const domainMin = Math.max(0, minBaseline * 0.92);
  const domainMax = maxVal * 1.04;

  const fmt = (v: number) => `$${(v).toFixed(0)}M`;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barCategoryGap="28%" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="0"
          stroke="var(--chart-grid)"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis
          domain={[domainMin, domainMax]}
          tickFormatter={fmt}
          tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
          width={58}
        />
        <Tooltip
          content={<WaterfallTooltip />}
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
        />
        {/* Transparent base — lifts bars to correct Y position */}
        <Bar dataKey="baseline" stackId="wf" fill="transparent" isAnimationActive={false} />
        {/* Positive / total bars */}
        <Bar dataKey="positive" stackId="wf" radius={[3, 3, 0, 0]} isAnimationActive={true} animationDuration={300}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={
                entry.isTotal
                  ? 'var(--accent-primary)'
                  : entry.isHedge
                  ? 'var(--chart-2)'
                  : 'var(--status-positive)'
              }
              fillOpacity={entry.positive === 0 ? 0 : 1}
            />
          ))}
        </Bar>
        {/* Negative bars */}
        <Bar dataKey="negative" stackId="wf" fill="var(--status-negative)" radius={[3, 3, 0, 0]} isAnimationActive={true} animationDuration={300} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ComparisonTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; fill: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--surface-elevated)] border border-[var(--border-base)] rounded-lg px-3.5 py-2.5 shadow-lg space-y-1.5">
      <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[var(--text-muted)]">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.fill }} />
          <span className="text-[11px] text-[var(--text-secondary)]">{p.name}</span>
          <span className="font-mono text-[12px] font-semibold text-[var(--text-primary)] nums-tabular ml-auto">
            ${p.value.toFixed(1)}M
          </span>
        </div>
      ))}
    </div>
  );
}

function SensitivityTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="bg-[var(--surface-elevated)] border border-[var(--border-base)] rounded-lg px-3.5 py-2.5 shadow-lg">
      <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[var(--text-muted)] mb-1">{label}</p>
      <p className={cn('font-mono text-[13px] font-bold nums-tabular', val >= 0 ? 'text-[var(--status-positive)]' : 'text-[var(--status-negative)]')}>
        {val >= 0 ? '+' : ''}${val.toFixed(1)}M
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main page
───────────────────────────────────────────────────────────────────────────── */

export default function ScenarioPage() {
  const [activePreset, setActivePreset] = useState<string>('base');
  const [state, setState] = useState<ScenarioState>({ ...BASE });

  const updateField = useCallback(<K extends keyof ScenarioState>(key: K, value: ScenarioState[K]) => {
    setState(prev => ({ ...prev, [key]: value }));
    setActivePreset('custom');
  }, []);

  const applyPreset = useCallback((key: string) => {
    setActivePreset(key);
    setState({ ...PRESETS[key].state });
  }, []);

  const resetToBase = useCallback(() => {
    applyPreset('base');
  }, [applyPreset]);

  const outputs = useMemo(() => computeOutputs(state), [state]);
  const waterfallData = useMemo(() => buildWaterfall(outputs), [outputs]);

  // Comparison chart data
  const comparisonData = useMemo(() => [
    {
      name: 'Base Case',
      ebitda: BASE_EBITDA,
    },
    {
      name: 'Unhedged',
      ebitda:
        BASE_EBITDA +
        outputs.commodityImpact +
        outputs.fxImpact +
        outputs.freightImpact +
        outputs.carbonImpact,
    },
    {
      name: 'Hedged',
      ebitda: outputs.netEBITDA,
    },
  ], [outputs]);

  // Sensitivity data — impact of +10% on each variable from current state
  const sensitivityData = useMemo(() => [
    { name: 'WTI +$8', value: 8 * SENS.wtiPerDollar },
    { name: 'Brent +$9', value: 9 * SENS.brentPerDollar },
    { name: 'Nat. Gas +10%', value: (state.naturalGas * 0.1 / 0.1) * SENS.gasPerTenth },
    { name: 'EUR/USD +3%', value: (state.eurUsd * 0.03 / 0.01) * SENS.eurUsdPer001 },
    { name: 'GBP/USD +3%', value: (state.gbpUsd * 0.03 / 0.01) * SENS.gbpUsdPer001 },
    { name: 'Freight +20%', value: 2 * SENS.freightPer10pct },
    { name: 'Carbon +€10', value: 10 * SENS.carbonPerEuro },
  ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value)), [state]);

  const totalImpactSign = outputs.totalImpact >= 0 ? 'positive' : 'negative' as const;
  const impactFormatted = `${outputs.totalImpact >= 0 ? '+' : ''}$${Math.abs(outputs.totalImpact).toFixed(1)}M`;

  return (
    <DashboardShell breadcrumb={['BAML Platform', 'Scenario Analysis']}>
      <div className="flex h-[calc(100vh-56px)] overflow-hidden">

        {/* ══════════════════════════════════════════════════════════════
            LEFT PANEL — Scenario Controls
        ══════════════════════════════════════════════════════════════ */}
        <aside className="w-[360px] shrink-0 flex flex-col h-full bg-[var(--surface-panel)] border-r border-[var(--border-subtle)] overflow-hidden">

          {/* Panel header */}
          <div className="shrink-0 px-5 pt-5 pb-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[15px] font-bold text-[var(--text-primary)] leading-none tracking-tight">
                  Scenario Controls
                </h2>
                <p className="text-[11.5px] text-[var(--text-muted)] mt-1.5 leading-none">
                  Adjust assumptions · see live impact
                </p>
              </div>
              <button
                onClick={resetToBase}
                className="flex items-center gap-1.5 btn btn-sm btn-secondary"
                title="Reset to base case"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Preset pills */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {Object.entries(PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className={cn(
                    'px-2.5 py-1.5 rounded-md text-[11px] font-semibold tracking-[0.04em] border transition-all duration-150',
                    activePreset === key
                      ? 'bg-[var(--accent-dim)] text-[var(--accent-primary)] border-[rgba(255,230,0,0.25)]'
                      : 'bg-transparent text-[var(--text-muted)] border-[var(--border-base)] hover:text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                  )}
                >
                  {preset.label}
                </button>
              ))}
              {activePreset === 'custom' && (
                <span className="px-2.5 py-1.5 rounded-md text-[11px] font-semibold tracking-[0.04em] bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-base)]">
                  Custom
                </span>
              )}
            </div>
          </div>

          {/* Scrollable controls */}
          <div className="flex-1 overflow-y-auto scroll-thin">

            {/* Commodity Prices */}
            <ControlSection title="Commodity Prices">
              <ScenarioSlider
                label="WTI Crude Oil"
                value={state.wti}
                min={40}
                max={150}
                step={0.5}
                onChange={v => updateField('wti', v)}
                displayFormat={v => `$${v.toFixed(2)}`}
                unit="/bbl"
                delta={state.wti - BASE.wti}
              />
              <ScenarioSlider
                label="Brent Crude"
                value={state.brent}
                min={40}
                max={160}
                step={0.5}
                onChange={v => updateField('brent', v)}
                displayFormat={v => `$${v.toFixed(2)}`}
                unit="/bbl"
                delta={state.brent - BASE.brent}
              />
              <ScenarioSlider
                label="Natural Gas"
                value={state.naturalGas}
                min={1.0}
                max={10.0}
                step={0.05}
                onChange={v => updateField('naturalGas', v)}
                displayFormat={v => `$${v.toFixed(2)}`}
                unit="/MMBtu"
                delta={state.naturalGas - BASE.naturalGas}
              />
              <ScenarioSlider
                label="Carbon Credits"
                value={state.carbonCost}
                min={20}
                max={120}
                step={0.5}
                onChange={v => updateField('carbonCost', v)}
                displayFormat={v => `€${v.toFixed(2)}`}
                unit="/tCO₂"
                delta={state.carbonCost - BASE.carbonCost}
              />
            </ControlSection>

            {/* FX Rates */}
            <ControlSection title="FX Rates">
              <ScenarioSlider
                label="EUR / USD"
                value={state.eurUsd}
                min={0.85}
                max={1.35}
                step={0.001}
                onChange={v => updateField('eurUsd', v)}
                displayFormat={v => v.toFixed(4)}
                delta={state.eurUsd - BASE.eurUsd}
              />
              <ScenarioSlider
                label="GBP / USD"
                value={state.gbpUsd}
                min={1.00}
                max={1.60}
                step={0.001}
                onChange={v => updateField('gbpUsd', v)}
                displayFormat={v => v.toFixed(4)}
                delta={state.gbpUsd - BASE.gbpUsd}
              />
            </ControlSection>

            {/* Operating Assumptions */}
            <ControlSection title="Operating Assumptions">
              <ScenarioSlider
                label="Freight Cost Multiplier"
                value={state.freight}
                min={0.5}
                max={2.5}
                step={0.05}
                onChange={v => updateField('freight', v)}
                displayFormat={v => `${v.toFixed(2)}×`}
                delta={state.freight - BASE.freight}
              />
            </ControlSection>

            {/* Hedge Settings */}
            <ControlSection title="Hedge Settings">
              <HedgeToggle
                checked={state.hedgeEnabled}
                onChange={v => updateField('hedgeEnabled', v)}
              />
              <AnimatePresence>
                {state.hedgeEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <ScenarioSlider
                      label="Hedge Coverage"
                      value={state.hedgeRatio}
                      min={0}
                      max={100}
                      step={0.5}
                      onChange={v => updateField('hedgeRatio', v)}
                      displayFormat={v => `${v.toFixed(1)}`}
                      unit="%"
                      delta={state.hedgeRatio - BASE.hedgeRatio}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </ControlSection>

          </div>

          {/* Impact summary footer */}
          <div className="shrink-0 border-t border-[var(--border-base)] px-5 py-4 bg-[var(--surface-secondary)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[var(--text-muted)]">
                EBITDA Impact
              </span>
              <motion.span
                key={impactFormatted}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'font-mono text-[18px] font-bold nums-tabular',
                  outputs.totalImpact >= 0
                    ? 'text-[var(--status-positive)]'
                    : 'text-[var(--status-negative)]'
                )}
              >
                {impactFormatted}
              </motion.span>
            </div>
            {state.hedgeEnabled && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-[var(--text-muted)]">Hedge Benefit</span>
                <span className="font-mono text-[12px] font-semibold text-[var(--chart-2)] nums-tabular">
                  +${outputs.hedgeBenefit.toFixed(1)}M
                </span>
              </div>
            )}
          </div>
        </aside>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT PANEL — Outputs & Visualization
        ══════════════════════════════════════════════════════════════ */}
        <main className="flex-1 overflow-y-auto scroll-thin bg-[var(--surface-base)]">
          <div className="p-6 space-y-5 max-w-[1100px]">

            {/* Scenario label */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-5 rounded-full bg-[var(--accent-primary)]" />
                <div>
                  <h1 className="text-[17px] font-bold text-[var(--text-primary)] tracking-tight leading-none">
                    {activePreset === 'custom'
                      ? 'Custom Scenario'
                      : PRESETS[activePreset]?.label}
                  </h1>
                  <p className="text-[12px] text-[var(--text-muted)] mt-1 leading-none">
                    {activePreset === 'custom'
                      ? 'Modified from base case'
                      : PRESETS[activePreset]?.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn btn-sm btn-secondary">Export</button>
                <button className="btn btn-sm btn-primary flex items-center gap-1.5">
                  <Zap className="w-3 h-3" />
                  Save Scenario
                </button>
              </div>
            </div>

            {/* ── KPI output cards ─────────────────────────────────── */}
            <div className="grid grid-cols-4 gap-3">
              <OutputKPI
                label="Net EBITDA"
                value={outputs.netEBITDA.toFixed(1)}
                unit="$M"
                unitPrefix
                delta={impactFormatted}
                trend={totalImpactSign}
                highlight
              />
              <OutputKPI
                label="vs Base Case"
                value={Math.abs(outputs.totalImpact).toFixed(1)}
                unit="$M"
                unitPrefix
                delta={`${outputs.totalImpact >= 0 ? 'Improvement' : 'Reduction'} from $${BASE_EBITDA}M`}
                trend={totalImpactSign}
              />
              <OutputKPI
                label="Hedge Benefit"
                value={outputs.hedgeBenefit.toFixed(1)}
                unit="$M"
                unitPrefix
                delta={state.hedgeEnabled ? `${state.hedgeRatio.toFixed(1)}% coverage` : 'No hedge active'}
                trend={outputs.hedgeBenefit > 0 ? 'positive' : 'neutral'}
              />
              <OutputKPI
                label="Unhedged Exposure"
                value={outputs.totalNegativeExposure.toFixed(1)}
                unit="$M"
                unitPrefix
                delta={
                  outputs.totalNegativeExposure > 0
                    ? `${((1 - state.hedgeRatio / 100) * 100).toFixed(0)}% unprotected`
                    : 'No downside exposure'
                }
                trend={outputs.totalNegativeExposure > 10 ? 'negative' : 'neutral'}
              />
            </div>

            {/* ── EBITDA Waterfall ─────────────────────────────────── */}
            <div className="bg-[var(--surface-secondary)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--surface-panel)]">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-[var(--text-muted)]">
                    EBITDA Bridge
                  </span>
                  <span className="text-[10px] font-medium text-[var(--text-muted)]">·</span>
                  <span className="text-[10.5px] text-[var(--text-muted)]">
                    Base → Net · all values in $M
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {[
                    { color: 'var(--accent-primary)', label: 'Total' },
                    { color: 'var(--status-positive)', label: 'Positive driver' },
                    { color: 'var(--status-negative)', label: 'Negative driver' },
                    { color: 'var(--chart-2)', label: 'Hedge benefit' },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-sm" style={{ background: color }} />
                      <span className="text-[10px] text-[var(--text-muted)]">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <WaterfallChart data={waterfallData} />
              </div>
            </div>

            {/* ── Bottom row: Comparison + Sensitivity ──────────────── */}
            <div className="grid grid-cols-2 gap-5">

              {/* Hedged vs Unhedged Comparison */}
              <div className="bg-[var(--surface-secondary)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--surface-panel)]">
                  <span className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-[var(--text-muted)]">
                    Hedged vs Unhedged
                  </span>
                  <span className="badge badge-accent text-[9px]">
                    {state.hedgeEnabled ? 'Hedge On' : 'Hedge Off'}
                  </span>
                </div>
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={comparisonData}
                      barCategoryGap="36%"
                      margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="0"
                        stroke="var(--chart-grid)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[
                          Math.min(...comparisonData.map(d => d.ebitda)) * 0.92,
                          Math.max(...comparisonData.map(d => d.ebitda)) * 1.04,
                        ]}
                        tickFormatter={v => `$${v.toFixed(0)}M`}
                        tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                        axisLine={false}
                        tickLine={false}
                        width={58}
                      />
                      <Tooltip
                        content={<ComparisonTooltip />}
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      />
                      <ReferenceLine
                        y={BASE_EBITDA}
                        stroke="var(--border-strong)"
                        strokeDasharray="4 3"
                        strokeWidth={1}
                      />
                      <Bar dataKey="ebitda" name="EBITDA" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={350}>
                        {comparisonData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={
                              i === 0
                                ? 'var(--accent-primary)'
                                : entry.ebitda >= BASE_EBITDA
                                ? 'var(--status-positive)'
                                : entry.ebitda >= comparisonData[1].ebitda
                                ? 'var(--chart-2)'
                                : 'var(--status-negative)'
                            }
                            fillOpacity={i === 0 ? 0.6 : 1}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sensitivity Analysis */}
              <div className="bg-[var(--surface-secondary)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--surface-panel)]">
                  <span className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-[var(--text-muted)]">
                    Risk Sensitivity
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">EBITDA impact per stress event</span>
                </div>
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={sensitivityData}
                      layout="vertical"
                      margin={{ top: 0, right: 20, left: 80, bottom: 0 }}
                      barCategoryGap="30%"
                    >
                      <CartesianGrid strokeDasharray="0" stroke="var(--chart-grid)" horizontal={false} />
                      <XAxis
                        type="number"
                        tickFormatter={v => `${v >= 0 ? '+' : ''}$${v.toFixed(0)}M`}
                        tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-sans)' }}
                        axisLine={false}
                        tickLine={false}
                        width={80}
                      />
                      <Tooltip
                        content={<SensitivityTooltip />}
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      />
                      <ReferenceLine x={0} stroke="var(--border-base)" strokeWidth={1} />
                      <Bar dataKey="value" name="Impact" radius={[0, 3, 3, 0]} isAnimationActive={true} animationDuration={350}>
                        {sensitivityData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={entry.value >= 0 ? 'var(--status-positive)' : 'var(--status-negative)'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>
        </main>

      </div>
    </DashboardShell>
  );
}
