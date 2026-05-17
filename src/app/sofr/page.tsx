'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { KPIStatCard } from '@/components/ui/KPIStatCard';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  Download,
  TrendingUp,
  Activity,
  AlertTriangle,
  ChevronRight,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────────────────────
   Static forecast data
───────────────────────────────────────────────────────────────────────────── */

const HORIZON_OPTIONS = ['3M', '6M', '12M', '24M'] as const;
type Horizon = (typeof HORIZON_OPTIONS)[number];

const FORECAST_DATA: Record<Horizon, Array<{
  date: string;
  forecast: number;
  p10: number;
  p25: number;
  p75: number;
  p90: number;
  actual?: number;
}>> = {
  '3M': [
    { date: 'Dec 25', actual: 5.30, forecast: 5.30, p10: 5.30, p25: 5.30, p75: 5.30, p90: 5.30 },
    { date: 'Jan 26', actual: 5.28, forecast: 5.28, p10: 5.28, p25: 5.28, p75: 5.28, p90: 5.28 },
    { date: 'Feb 26', actual: 5.24, forecast: 5.24, p10: 5.24, p25: 5.24, p75: 5.24, p90: 5.24 },
    { date: 'Mar 26', forecast: 5.18, p10: 4.92, p25: 5.04, p75: 5.32, p90: 5.44 },
    { date: 'Apr 26', forecast: 5.10, p10: 4.76, p25: 4.94, p75: 5.27, p90: 5.44 },
    { date: 'May 26', forecast: 4.98, p10: 4.58, p25: 4.80, p75: 5.18, p90: 5.38 },
  ],
  '6M': [
    { date: 'Dec 25', actual: 5.30, forecast: 5.30, p10: 5.30, p25: 5.30, p75: 5.30, p90: 5.30 },
    { date: 'Jan 26', actual: 5.28, forecast: 5.28, p10: 5.28, p25: 5.28, p75: 5.28, p90: 5.28 },
    { date: 'Feb 26', actual: 5.24, forecast: 5.24, p10: 5.24, p25: 5.24, p75: 5.24, p90: 5.24 },
    { date: 'Mar 26', forecast: 5.18, p10: 4.90, p25: 5.02, p75: 5.34, p90: 5.46 },
    { date: 'Apr 26', forecast: 5.08, p10: 4.72, p25: 4.92, p75: 5.28, p90: 5.48 },
    { date: 'May 26', forecast: 4.96, p10: 4.55, p25: 4.78, p75: 5.18, p90: 5.42 },
    { date: 'Jun 26', forecast: 4.82, p10: 4.32, p25: 4.60, p75: 5.06, p90: 5.36 },
    { date: 'Jul 26', forecast: 4.68, p10: 4.10, p25: 4.42, p75: 4.98, p90: 5.32 },
    { date: 'Aug 26', forecast: 4.56, p10: 3.92, p25: 4.27, p75: 4.89, p90: 5.28 },
  ],
  '12M': [
    { date: 'Dec 25', actual: 5.30, forecast: 5.30, p10: 5.30, p25: 5.30, p75: 5.30, p90: 5.30 },
    { date: 'Jan 26', actual: 5.28, forecast: 5.28, p10: 5.28, p25: 5.28, p75: 5.28, p90: 5.28 },
    { date: 'Feb 26', actual: 5.24, forecast: 5.24, p10: 5.24, p25: 5.24, p75: 5.24, p90: 5.24 },
    { date: 'Mar 26', forecast: 5.16, p10: 4.88, p25: 5.02, p75: 5.32, p90: 5.46 },
    { date: 'Apr 26', forecast: 5.06, p10: 4.70, p25: 4.90, p75: 5.26, p90: 5.48 },
    { date: 'May 26', forecast: 4.93, p10: 4.50, p25: 4.74, p75: 5.16, p90: 5.44 },
    { date: 'Jun 26', forecast: 4.78, p10: 4.28, p25: 4.56, p75: 5.04, p90: 5.38 },
    { date: 'Jul 26', forecast: 4.62, p10: 4.05, p25: 4.38, p75: 4.92, p90: 5.30 },
    { date: 'Aug 26', forecast: 4.48, p10: 3.86, p25: 4.20, p75: 4.80, p90: 5.24 },
    { date: 'Sep 26', forecast: 4.36, p10: 3.68, p25: 4.05, p75: 4.72, p90: 5.18 },
    { date: 'Oct 26', forecast: 4.24, p10: 3.52, p25: 3.92, p75: 4.62, p90: 5.12 },
    { date: 'Nov 26', forecast: 4.14, p10: 3.38, p25: 3.80, p75: 4.54, p90: 5.06 },
    { date: 'Dec 26', forecast: 4.05, p10: 3.25, p25: 3.68, p75: 4.48, p90: 5.00 },
  ],
  '24M': [
    { date: 'Dec 25', actual: 5.30, forecast: 5.30, p10: 5.30, p25: 5.30, p75: 5.30, p90: 5.30 },
    { date: 'Mar 26', forecast: 5.12, p10: 4.82, p25: 4.98, p75: 5.28, p90: 5.44 },
    { date: 'Jun 26', forecast: 4.76, p10: 4.22, p25: 4.52, p75: 5.04, p90: 5.38 },
    { date: 'Sep 26', forecast: 4.32, p10: 3.60, p25: 3.98, p75: 4.70, p90: 5.16 },
    { date: 'Dec 26', forecast: 3.98, p10: 3.14, p25: 3.58, p75: 4.44, p90: 4.94 },
    { date: 'Mar 27', forecast: 3.72, p10: 2.78, p25: 3.28, p75: 4.22, p90: 4.78 },
    { date: 'Jun 27', forecast: 3.52, p10: 2.50, p25: 3.06, p75: 4.06, p90: 4.68 },
    { date: 'Sep 27', forecast: 3.38, p10: 2.30, p25: 2.90, p75: 3.94, p90: 4.60 },
    { date: 'Dec 27', forecast: 3.28, p10: 2.15, p25: 2.78, p75: 3.86, p90: 4.54 },
  ],
};

const MONTE_CARLO_DISTRIBUTION = [
  { rate: '3.25', prob: 2.1 },
  { rate: '3.50', prob: 3.8 },
  { rate: '3.75', prob: 6.4 },
  { rate: '4.00', prob: 9.2 },
  { rate: '4.25', prob: 13.6 },
  { rate: '4.50', prob: 17.4 },
  { rate: '4.75', prob: 19.8 },
  { rate: '5.00', prob: 14.2 },
  { rate: '5.25', prob: 8.6 },
  { rate: '5.50', prob: 3.2 },
  { rate: '5.75', prob: 1.4 },
  { rate: '6.00', prob: 0.3 },
];

const METRICS_BY_HORIZON: Record<Horizon, {
  projected: string;
  volatility: string;
  probRange: string;
  confidence: string;
  projectedDelta: string;
  projectedSignal: 'positive' | 'negative' | 'neutral';
  volDelta: string;
  volSignal: 'positive' | 'negative' | 'neutral' | 'warning';
}> = {
  '3M':  { projected: '4.98', volatility: '18.4', probRange: '4.58–5.44', confidence: '84.2', projectedDelta: '−32 bps vs today', projectedSignal: 'negative', volDelta: 'Low regime', volSignal: 'positive' },
  '6M':  { projected: '4.56', volatility: '23.8', probRange: '3.92–5.28', confidence: '78.6', projectedDelta: '−74 bps vs today', projectedSignal: 'negative', volDelta: 'Moderate', volSignal: 'warning' },
  '12M': { projected: '4.05', volatility: '31.2', probRange: '3.25–5.00', confidence: '71.4', projectedDelta: '−125 bps vs today', projectedSignal: 'negative', volDelta: 'Elevated', volSignal: 'warning' },
  '24M': { projected: '3.28', volatility: '42.6', probRange: '2.15–4.54', confidence: '62.8', projectedDelta: '−202 bps vs today', projectedSignal: 'negative', volDelta: 'High regime', volSignal: 'negative' },
};

const INSIGHTS_BY_HORIZON: Record<Horizon, Array<{ icon: 'trend' | 'risk' | 'signal'; label: string; body: string; accent?: boolean }>> = {
  '3M': [
    { icon: 'trend', label: 'Easing Trajectory', body: 'Fed funds futures pricing in one 25bps cut before May. SOFR expected to track 2–5bps below effective fed funds rate throughout Q1.', accent: true },
    { icon: 'signal', label: 'Probability Skew', body: 'Distribution is modestly right-skewed, reflecting residual upside risk from persistent CPI. Base case remains dovish but conviction is moderate.' },
    { icon: 'risk', label: 'Key Risk Factor', body: 'March FOMC meeting represents the primary event risk. A hold decision would push the 3M forecast materially higher toward the P90 band.' },
  ],
  '6M': [
    { icon: 'trend', label: 'Two-Cut Scenario', body: 'Base case embeds two sequential 25bps cuts through H1 2026. SOFR projected to exit the period near 4.56%, representing a 74bps reduction from spot.', accent: true },
    { icon: 'signal', label: 'Confidence Erosion', body: 'Confidence interval widens materially after Q2, reflecting macro uncertainty. The P10–P90 spread expands to 136bps by August versus 52bps today.' },
    { icon: 'risk', label: 'Inflation Watch', body: 'Core PCE trajectory is the key input for this horizon. A re-acceleration above 2.8% would likely suspend the easing cycle and push SOFR toward the P75 band.' },
  ],
  '12M': [
    { icon: 'trend', label: 'Normalization Path', body: '12-month forecast embeds 125bps of cumulative cuts, landing SOFR at 4.05% by Dec 2026. This aligns with the FOMC dot plot median projection.', accent: true },
    { icon: 'signal', label: 'Wide Uncertainty Band', body: 'P10–P90 spread of 175bps reflects genuine macro ambiguity. Both a shallow 50bps easing and a deeper 200bps cycle are plausible within current data.' },
    { icon: 'risk', label: 'Recession Tail Risk', body: 'A hard landing scenario (probability ~14%) would accelerate cuts substantially, driving SOFR below 3.50% by mid-year and invalidating the base case.' },
  ],
  '24M': [
    { icon: 'trend', label: 'Terminal Rate Convergence', body: '24-month projection targets 3.28%, consistent with a neutral real rate of approximately 0.75% under current inflation expectations.', accent: true },
    { icon: 'signal', label: 'Structural Uncertainty', body: 'The 339bps P10–P90 spread at horizon reflects model uncertainty about the terminal rate regime. Conviction declines sharply after Q2 2027.' },
    { icon: 'risk', label: 'Structural Break Risk', body: 'Fiscal trajectory, trade policy shifts, and productivity dynamics represent regime-change risks that are not fully captured in the Monte Carlo ensemble.' },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
   Tooltip components
───────────────────────────────────────────────────────────────────────────── */

function ForecastTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const forecast = payload.find(p => p.name === 'forecast');
  const p10 = payload.find(p => p.name === 'p10');
  const p90 = payload.find(p => p.name === 'p90');

  return (
    <div className="rounded-xl border border-[var(--border-base)] bg-[var(--surface-elevated)] px-4 py-3.5 shadow-xl min-w-[160px]">
      <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</p>
      {forecast && (
        <div className="flex items-center justify-between gap-4 mb-1.5">
          <span className="text-[11px] text-[var(--text-muted)]">Forecast</span>
          <span className="font-mono text-[14px] font-bold text-[var(--accent-primary)] nums-tabular">
            {forecast.value.toFixed(2)}%
          </span>
        </div>
      )}
      {p10 && p90 && (
        <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-[var(--border-subtle)]">
          <span className="text-[11px] text-[var(--text-muted)]">90% CI</span>
          <span className="font-mono text-[12px] text-[var(--text-secondary)] nums-tabular">
            {p10.value.toFixed(2)}–{p90.value.toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
}

function DistributionTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[var(--border-base)] bg-[var(--surface-elevated)] px-3.5 py-3 shadow-xl">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1.5">SOFR {label}%</p>
      <p className="font-mono text-[14px] font-bold text-[var(--text-primary)] nums-tabular">{payload[0].value.toFixed(1)}%</p>
      <p className="text-[11px] text-[var(--text-muted)]">probability mass</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────────────────────────── */

function InsightCard({ icon, label, body, accent = false }: { icon: 'trend' | 'risk' | 'signal'; label: string; body: string; accent?: boolean }) {
  const IconEl = icon === 'trend' ? TrendingUp : icon === 'risk' ? AlertTriangle : Activity;
  const iconColor = icon === 'trend' ? 'text-[var(--accent-primary)]' : icon === 'risk' ? 'text-[var(--status-negative)]' : 'text-[var(--status-neutral)]';
  const iconBg = icon === 'trend' ? 'bg-[rgba(245,217,10,0.10)]' : icon === 'risk' ? 'bg-[rgba(239,68,68,0.10)]' : 'bg-[rgba(59,130,246,0.10)]';

  return (
    <div className={cn(
      'rounded-[18px] border p-6 transition-all duration-150',
      accent
        ? 'bg-[rgba(245,217,10,0.04)] border-[rgba(245,217,10,0.14)] hover:border-[rgba(245,217,10,0.24)]'
        : 'bg-[var(--surface-elevated)] border-[var(--border-base)] hover:border-[var(--border-strong)]'
    )}>
      <div className="flex items-start gap-4">
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', iconBg)}>
          <IconEl className={cn('h-4 w-4', iconColor)} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-[12.5px] font-bold uppercase tracking-[0.12em] mb-2',
            accent ? 'text-[var(--accent-muted)]' : 'text-[var(--text-muted)]'
          )}>
            {label}
          </p>
          <p className="text-[14.5px] leading-relaxed text-[var(--text-secondary)]">{body}</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────────────────── */

export default function SOFRForecastPage() {
  const [horizon, setHorizon] = useState<Horizon>('12M');

  const data    = FORECAST_DATA[horizon];
  const metrics = METRICS_BY_HORIZON[horizon];
  const insights = INSIGHTS_BY_HORIZON[horizon];

  /* Split history vs forecast for dual-style rendering */
  const splitIdx = data.findIndex(d => d.actual === undefined);

  return (
    <DashboardShell title="SOFR Forecast" breadcrumb={['BAML Platform', 'SOFR Forecast']}>
      <div className="mx-auto max-w-[1600px] px-12 py-14 space-y-12">

        {/* ── 1. Page Header ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
          className="flex items-end justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Rate Forecasting
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-positive)] animate-pulse" />
                <span className="text-[10.5px] text-[var(--text-muted)]">Model live</span>
              </span>
            </div>
            <h1 className="text-[40px] font-semibold tracking-tight text-[var(--text-primary)] leading-none">
              SOFR Forecast
            </h1>
            <p className="text-[16px] text-[var(--text-muted)]">
              Monte Carlo ensemble · 10,000 simulations · As of 17 May 2026
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Horizon selector */}
            <div className="flex items-center rounded-[12px] border border-[var(--border-base)] bg-[var(--surface-elevated)] p-1 gap-0.5">
              {HORIZON_OPTIONS.map((h) => (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className={cn(
                    'rounded-[9px] px-5 py-2.5 text-[14px] font-semibold transition-all duration-150',
                    horizon === h
                      ? 'bg-[var(--accent-primary)] text-black shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  )}
                >
                  {h}
                </button>
              ))}
            </div>

            {/* Export */}
            <button className="flex items-center gap-2 rounded-[12px] border border-[var(--border-base)] bg-[var(--surface-elevated)] px-5 py-3 text-[14px] font-medium text-[var(--text-secondary)] transition-all duration-150 hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </motion.div>

        {/* ── 2. Hero Forecast Chart ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.04, ease: [0.2, 0, 0, 1] }}
          className="rounded-[22px] border border-[var(--border-base)] bg-[var(--surface-elevated)] overflow-hidden"
        >
          {/* Panel header */}
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-9 py-7">
            <div>
              <p className="text-[16px] font-semibold text-[var(--text-primary)] leading-none">
                Rate Trajectory · {horizon} Forecast
              </p>
              <p className="mt-1.5 text-[13px] text-[var(--text-muted)]">
                Secured Overnight Financing Rate (SOFR) · Confidence intervals from Monte Carlo ensemble
              </p>
            </div>
            <div className="flex items-center gap-7">
              {[
                { color: '#F5D90A', label: 'Central Forecast', dash: false },
                { color: 'rgba(245,217,10,0.22)', label: '50% CI', dash: false },
                { color: 'rgba(245,217,10,0.09)', label: '90% CI', dash: false },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="h-[11px] w-[11px] rounded-sm" style={{ background: color }} />
                  <span className="text-[12px] text-[var(--text-muted)]">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="px-9 py-8">
            <ResponsiveContainer width="100%" height={420}>
              <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="ciOuter" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5D90A" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#F5D90A" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="ciInner" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5D90A" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#F5D90A" stopOpacity={0.06} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="var(--chart-grid)"
                  strokeDasharray="0"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-sans)' }}
                  dy={10}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => `${v.toFixed(2)}%`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11.5, fontFamily: 'var(--font-mono)' }}
                  width={62}
                />
                <Tooltip content={<ForecastTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />

                {/* 90% confidence band */}
                <Area
                  type="monotone"
                  dataKey="p90"
                  stroke="none"
                  fill="url(#ciOuter)"
                  fillOpacity={1}
                  name="p90"
                  activeDot={false}
                  isAnimationActive
                  animationDuration={600}
                  animationEasing="ease-out"
                />
                <Area
                  type="monotone"
                  dataKey="p10"
                  stroke="none"
                  fill="var(--surface-elevated)"
                  fillOpacity={1}
                  name="p10"
                  activeDot={false}
                  isAnimationActive={false}
                />

                {/* 50% confidence band */}
                <Area
                  type="monotone"
                  dataKey="p75"
                  stroke="none"
                  fill="url(#ciInner)"
                  fillOpacity={1}
                  name="p75"
                  activeDot={false}
                  isAnimationActive
                  animationDuration={700}
                  animationEasing="ease-out"
                />
                <Area
                  type="monotone"
                  dataKey="p25"
                  stroke="none"
                  fill="var(--surface-elevated)"
                  fillOpacity={1}
                  name="p25"
                  activeDot={false}
                  isAnimationActive={false}
                />

                {/* Central forecast line */}
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#F5D90A"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: '#F5D90A', strokeWidth: 0 }}
                  name="forecast"
                  isAnimationActive
                  animationDuration={800}
                  animationEasing="ease-out"
                />

                {/* Actual history overlay */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#F5F7FA"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={false}
                  name="actual"
                  isAnimationActive={false}
                />

                {/* Today divider */}
                {splitIdx > 0 && (
                  <ReferenceLine
                    x={data[splitIdx - 1]?.date}
                    stroke="rgba(255,255,255,0.12)"
                    strokeDasharray="4 4"
                    strokeWidth={1}
                    label={{
                      value: 'Today',
                      position: 'insideTopRight',
                      fill: 'var(--text-muted)',
                      fontSize: 10.5,
                      fontFamily: 'var(--font-sans)',
                      dy: -10,
                    }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── 3. Prediction Metrics Row ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.08, ease: [0.2, 0, 0, 1] }}
          className="grid grid-cols-4 gap-5"
        >
          <KPIStatCard
            label={`Projected SOFR · ${horizon}`}
            value={metrics.projected}
            unit="%"
            unitPosition="suffix"
            delta={metrics.projectedDelta}
            signal={metrics.projectedSignal}
            accent="yellow"
            size="lg"
            featured
          />
          <KPIStatCard
            label="Implied Volatility"
            value={metrics.volatility}
            unit="bps ann."
            unitPosition="suffix"
            delta={metrics.volDelta}
            signal={metrics.volSignal}
            accent="warning"
            size="lg"
          />
          <KPIStatCard
            label={`Probability Range · ${horizon}`}
            value={metrics.probRange}
            unit="%"
            unitPosition="suffix"
            delta="P10 – P90 spread"
            signal="neutral"
            accent="neutral"
            size="lg"
          />
          <KPIStatCard
            label="Model Confidence"
            value={metrics.confidence}
            unit="%"
            unitPosition="suffix"
            delta="Ensemble agreement"
            signal={parseFloat(metrics.confidence) >= 75 ? 'positive' : parseFloat(metrics.confidence) >= 65 ? 'warning' : 'negative'}
            accent={parseFloat(metrics.confidence) >= 75 ? 'positive' : 'warning'}
            size="lg"
          />
        </motion.div>

        {/* ── 4. Monte Carlo Section ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.12, ease: [0.2, 0, 0, 1] }}
          className="grid grid-cols-[1fr_420px] gap-5"
        >

          {/* Probability distribution */}
          <div className="rounded-[22px] border border-[var(--border-base)] bg-[var(--surface-elevated)] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-9 py-7">
              <div>
                <p className="text-[16px] font-semibold text-[var(--text-primary)] leading-none">
                  Outcome Distribution · {horizon}
                </p>
                <p className="mt-1.5 text-[13px] text-[var(--text-muted)]">
                  Probability mass by terminal SOFR rate · 10,000 paths
                </p>
              </div>
              <div className="flex items-center gap-2 text-[12.5px] text-[var(--text-muted)] bg-[var(--surface-overlay)] px-3.5 py-2 rounded-lg">
                <Info className="h-3.5 w-3.5" />
                Monte Carlo
              </div>
            </div>
            <div className="px-9 py-8">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={MONTE_CARLO_DISTRIBUTION}
                  barCategoryGap="12%"
                  margin={{ top: 4, right: 8, left: 4, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="var(--chart-grid)"
                    strokeDasharray="0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="rate"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11.5, fontFamily: 'var(--font-mono)' }}
                    tickFormatter={(v) => `${v}%`}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                    tickFormatter={(v) => `${v}%`}
                    width={44}
                  />
                  <Tooltip content={<DistributionTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar
                    dataKey="prob"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive
                    animationDuration={600}
                    animationEasing="ease-out"
                  >
                    {MONTE_CARLO_DISTRIBUTION.map((entry) => {
                      const rate = parseFloat(entry.rate);
                      const isMode = entry.prob === Math.max(...MONTE_CARLO_DISTRIBUTION.map(d => d.prob));
                      const isBase = rate >= 3.75 && rate <= 4.75;
                      return (
                        <Cell
                          key={entry.rate}
                          fill={
                            isMode
                              ? '#F5D90A'
                              : isBase
                              ? 'rgba(245,217,10,0.35)'
                              : 'rgba(245,217,10,0.12)'
                          }
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Percentile bands summary */}
          <div className="rounded-[22px] border border-[var(--border-base)] bg-[var(--surface-elevated)] overflow-hidden flex flex-col">
            <div className="border-b border-[var(--border-subtle)] px-8 py-7">
              <p className="text-[16px] font-semibold text-[var(--text-primary)] leading-none">
                Scenario Percentiles
              </p>
              <p className="mt-1.5 text-[13px] text-[var(--text-muted)]">
                Terminal SOFR at {horizon} horizon
              </p>
            </div>

            <div className="flex flex-1 flex-col divide-y divide-[var(--border-subtle)] px-8 justify-center">
              {[
                { label: 'P90 — Hawkish tail',    value: data[data.length - 1]?.p90,  color: 'var(--status-negative)',    desc: 'Persistent inflation, no cuts' },
                { label: 'P75 — Upside case',      value: data[data.length - 1]?.p75,  color: 'var(--status-warning)',     desc: 'Slower easing than base' },
                { label: 'P50 — Base case',        value: data[data.length - 1]?.forecast, color: 'var(--accent-primary)', desc: 'Consensus Fed path', featured: true },
                { label: 'P25 — Dovish case',      value: data[data.length - 1]?.p25,  color: 'var(--status-positive)',    desc: 'Faster easing cycle' },
                { label: 'P10 — Dovish tail',      value: data[data.length - 1]?.p10,  color: '#22C55E',                  desc: 'Hard landing / recession' },
              ].map(({ label, value, color, desc, featured }) => (
                <div
                  key={label}
                  className={cn(
                    'flex items-center justify-between py-5 transition-colors duration-100',
                    featured && 'bg-[rgba(245,217,10,0.03)]'
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: color }} />
                    <div>
                      <p className={cn(
                        'text-[13.5px] font-medium leading-none',
                        featured ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'
                      )}>
                        {label}
                      </p>
                      <p className="mt-1.5 text-[12px] text-[var(--text-muted)]">{desc}</p>
                    </div>
                  </div>
                  <span className={cn(
                    'font-mono text-[16px] font-bold nums-tabular',
                    featured ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'
                  )}>
                    {value !== undefined ? `${value.toFixed(2)}%` : '—'}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--border-subtle)] px-8 py-5">
              <p className="text-[12px] text-[var(--text-muted)]">
                Rates shown as end-of-period SOFR. Ensemble of 10,000 simulated paths.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── 5. Forecast Insights Panel ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.16, ease: [0.2, 0, 0, 1] }}
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[20px] font-semibold text-[var(--text-primary)]">Forecast Insights</p>
              <p className="mt-1 text-[13.5px] text-[var(--text-muted)]">Model-generated analysis for the {horizon} horizon</p>
            </div>
            <button className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent-muted)] hover:text-[var(--accent-primary)] transition-colors duration-150">
              Full report
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {insights.map((insight) => (
              <InsightCard key={insight.label} {...insight} />
            ))}
          </div>
        </motion.div>

        {/* ── Footer note ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex items-center justify-between pt-2 pb-6 border-t border-[var(--border-subtle)]"
        >
          <p className="text-[11.5px] text-[var(--text-muted)]">
            BAML Risk Intelligence Platform · SOFR forecasts are model outputs and not investment advice. Past model performance does not guarantee future accuracy.
          </p>
          <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--text-muted)]">
            <ArrowUpRight className="h-3.5 w-3.5" />
            Last updated: 17 May 2026, 16:45 EST
          </div>
        </motion.div>

      </div>
    </DashboardShell>
  );
}
