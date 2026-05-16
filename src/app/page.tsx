'use client';

import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { KPIStatCard } from '@/components/ui/KPIStatCard';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────────────────────
   Static data
───────────────────────────────────────────────────────────────────────────── */

const BASE_EBITDA = 487.2;

const SCENARIOS = [
  { name: 'Base Case',   ebitda: 487.2, type: 'base'     },
  { name: 'Oil +20%',    ebitda: 421.6, type: 'negative' },
  { name: 'FX Bear',     ebitda: 459.3, type: 'negative' },
  { name: 'Full Hedge',  ebitda: 498.8, type: 'positive' },
  { name: 'Stress Test', ebitda: 312.4, type: 'severe'   },
] as const;

const MARKET_DATA = [
  { label: 'WTI Crude',  value: '$82.14', delta: '+0.42%', trend: 'positive' as const },
  { label: 'Brent',      value: '$85.60', delta: '+0.28%', trend: 'positive' as const },
  { label: 'EUR / USD',  value: '1.0845', delta: '−0.12%', trend: 'negative' as const },
  { label: 'Nat. Gas',   value: '$2.84',  delta: '−0.08%', trend: 'negative' as const },
  { label: 'Carbon EU',  value: '€65.20', delta: '+1.14%', trend: 'positive' as const },
  { label: 'Freight',    value: '1.00×',  delta: 'Flat',   trend: 'neutral'  as const },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Chart tooltip
───────────────────────────────────────────────────────────────────────────── */

function ScenarioTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const val   = payload[0].value;
  const diff  = val - BASE_EBITDA;
  const isPos = diff >= 0;

  return (
    <div className="rounded-xl border border-[var(--border-base)] bg-[var(--surface-elevated)] px-4 py-3 shadow-lg">
      <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="font-mono text-[17px] font-bold nums-tabular text-[var(--text-primary)]">
        ${val.toFixed(1)}M
      </p>
      {diff !== 0 && (
        <p
          className={cn(
            'mt-1 font-mono text-[12px] font-semibold nums-tabular',
            isPos ? 'text-[var(--status-positive)]' : 'text-[var(--status-negative)]',
          )}
        >
          {isPos ? '+' : ''}${diff.toFixed(1)}M vs base
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Market ticker row item
───────────────────────────────────────────────────────────────────────────── */

function MarketItem({
  label,
  value,
  delta,
  trend,
}: (typeof MARKET_DATA)[number]) {
  const Icon =
    trend === 'positive' ? ArrowUpRight :
    trend === 'negative' ? ArrowDownRight :
    Minus;

  const deltaColor =
    trend === 'positive' ? 'text-[var(--status-positive)]' :
    trend === 'negative' ? 'text-[var(--status-negative)]' :
    'text-[var(--text-muted)]';

  return (
    <div className="flex flex-1 flex-col gap-2 border-r border-[var(--border-subtle)] px-5 last:border-r-0 first:pl-0">
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
        {label}
      </span>
      <span className="font-mono text-[16px] font-semibold nums-tabular text-[var(--text-primary)]">
        {value}
      </span>
      <span className={cn('flex items-center gap-0.5 font-mono text-[11.5px] font-medium nums-tabular', deltaColor)}>
        <Icon className="h-3 w-3 shrink-0" strokeWidth={2.5} />
        {delta}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Bar fill by scenario type
───────────────────────────────────────────────────────────────────────────── */

function barFill(type: string): string {
  if (type === 'base')     return 'var(--accent-primary)';
  if (type === 'positive') return 'var(--status-positive)';
  if (type === 'negative') return 'var(--status-negative)';
  if (type === 'severe')   return '#9f1717';
  return 'var(--border-strong)';
}

/* ─────────────────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────────────────── */

export default function OverviewPage() {
  return (
    <DashboardShell title="Overview" breadcrumb={['BAML Platform', 'Overview']}>
      <div className="mx-auto max-w-[1600px] px-10 py-12 space-y-10">

        {/* ── 1. Page header ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
          className="flex items-end justify-between"
        >
          <div className="space-y-2">
            <h1 className="text-[36px] font-semibold tracking-tight text-[var(--text-primary)] leading-none">
              Portfolio Overview
            </h1>
            <p className="text-[15px] text-[var(--text-muted)]">
              FY2026 Q2 · Consolidated · As of 14 May 2026
            </p>
          </div>

          <Link href="/scenario">
            <button className="btn btn-primary flex items-center gap-2 px-5 py-2.5 text-[13.5px]">
              <TrendingUp className="h-4 w-4" />
              Run Scenario Analysis
            </button>
          </Link>
        </motion.div>

        {/* ── 2. KPI row ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.04, ease: [0.2, 0, 0, 1] }}
          className="grid grid-cols-4 gap-5"
        >
          <KPIStatCard
            label="EBITDA at Risk"
            value="124.3"
            unit="$M"
            unitPosition="prefix"
            delta="−$8.2M"
            deltaLabel="vs last quarter"
            signal="negative"
            accent="negative"
            size="lg"
          />
          <KPIStatCard
            label="Hedge Ratio"
            value="67.4"
            unit="%"
            unitPosition="suffix"
            delta="+3.1%"
            deltaLabel="vs target 70%"
            signal="positive"
            accent="positive"
            size="lg"
          />
          <KPIStatCard
            label="FX Exposure"
            value="342.8"
            unit="$M"
            unitPosition="prefix"
            delta="+$12.4M"
            deltaLabel="unhedged notional"
            signal="negative"
            accent="negative"
            size="lg"
          />
          <KPIStatCard
            label="Net EBITDA (Base)"
            value="487.2"
            unit="$M"
            unitPosition="prefix"
            delta="+$6.8M"
            deltaLabel="hedge benefit"
            signal="positive"
            accent="yellow"
            size="lg"
            featured
          />
        </motion.div>

        {/* ── 3. Scenario Analysis CTA ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.08, ease: [0.2, 0, 0, 1] }}
        >
          <Link href="/scenario" className="block group">
            <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-[rgba(245,217,10,0.18)] bg-[var(--accent-dim)] px-12 py-10 transition-all duration-200 hover:border-[rgba(245,217,10,0.35)]">
              {/* Ambient glow layers */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(255,230,0,0.05)] via-transparent to-transparent" />
              <div className="pointer-events-none absolute right-0 top-0 h-full w-2/5 bg-gradient-to-l from-[rgba(255,230,0,0.03)] to-transparent" />

              <div className="relative flex items-center justify-between gap-16">

                {/* Left — content */}
                <div className="flex-1">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-primary)]">
                      <TrendingUp className="h-5 w-5 text-black" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[var(--accent-muted)]">
                      Primary Feature
                    </span>
                  </div>

                  <h2 className="mb-3 text-[26px] font-bold leading-tight tracking-tight text-[var(--accent-primary)]">
                    Scenario Analysis
                  </h2>
                  <p className="mb-7 max-w-[520px] text-[14.5px] leading-relaxed text-[var(--text-secondary)]">
                    Model commodity shocks, FX rate movements, and hedge strategy changes
                    interactively. Watch EBITDA impact, waterfall decomposition, and
                    sensitivity analysis update in real time.
                  </p>

                  {/* Feature pills */}
                  <div className="flex items-center gap-6">
                    {[
                      'Live EBITDA Recalculation',
                      'Waterfall Bridge',
                      'Hedge Simulation',
                      'Stress Testing',
                    ].map((tag) => (
                      <span key={tag} className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)]">
                        <span className="h-1 w-1 rounded-full bg-[var(--accent-muted)]" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right — CTA arrow */}
                <div className="shrink-0 flex flex-col items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-primary)] shadow-[0_0_32px_rgba(255,230,0,0.18)] transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_0_48px_rgba(255,230,0,0.28)]">
                    <ArrowRight className="h-7 w-7 text-black" strokeWidth={2.5} />
                  </div>
                  <span className="text-[12px] font-semibold text-[var(--accent-muted)] opacity-70 transition-opacity duration-200 group-hover:opacity-100">
                    Launch
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* ── 4. Chart + Market summary ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.12, ease: [0.2, 0, 0, 1] }}
          className="grid grid-cols-[1fr_340px] gap-5"
        >

          {/* Primary visualization — EBITDA by Scenario */}
          <div className="rounded-[var(--radius-card)] border border-[var(--border-base)] bg-[var(--surface-elevated)] overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-7 py-5">
              <div>
                <p className="text-[13px] font-semibold text-[var(--text-primary)] leading-none">
                  EBITDA by Scenario
                </p>
                <p className="mt-1 text-[11.5px] text-[var(--text-muted)]">
                  Net EBITDA · FY2026 Q2 planning · all values $M
                </p>
              </div>
              <div className="flex items-center gap-4">
                {[
                  { color: 'var(--accent-primary)',   label: 'Base' },
                  { color: 'var(--status-positive)',   label: 'Upside' },
                  { color: 'var(--status-negative)',   label: 'Stress' },
                  { color: '#9f1717',                  label: 'Severe' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className="h-[8px] w-[8px] rounded-sm" style={{ background: color }} />
                    <span className="text-[10.5px] text-[var(--text-muted)]">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="px-7 py-6">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={SCENARIOS}
                  barCategoryGap="36%"
                  margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="var(--chart-grid)"
                    strokeDasharray="0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-sans)' }}
                    dy={8}
                  />
                  <YAxis
                    domain={[250, 520]}
                    tickFormatter={(v) => `$${v}M`}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                    width={56}
                  />
                  <Tooltip
                    content={<ScenarioTooltip />}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <ReferenceLine
                    y={BASE_EBITDA}
                    stroke="var(--border-strong)"
                    strokeDasharray="5 4"
                    strokeWidth={1}
                    label={{
                      value: 'Base $487M',
                      position: 'insideTopRight',
                      fill: 'var(--text-muted)',
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      dy: -6,
                    }}
                  />
                  <Bar
                    dataKey="ebitda"
                    radius={[5, 5, 0, 0]}
                    isAnimationActive
                    animationDuration={500}
                    animationEasing="ease-out"
                  >
                    {SCENARIOS.map((s) => (
                      <Cell
                        key={s.name}
                        fill={barFill(s.type)}
                        fillOpacity={s.type === 'base' ? 0.85 : 1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Market snapshot */}
          <div className="flex flex-col rounded-[var(--radius-card)] border border-[var(--border-base)] bg-[var(--surface-elevated)] overflow-hidden">
            <div className="border-b border-[var(--border-subtle)] px-6 py-5">
              <p className="text-[13px] font-semibold text-[var(--text-primary)] leading-none">
                Market Snapshot
              </p>
              <p className="mt-1 text-[11.5px] text-[var(--text-muted)]">
                Live · As of market close
              </p>
            </div>

            <div className="flex flex-1 flex-col divide-y divide-[var(--border-subtle)] px-6">
              {MARKET_DATA.map((item) => {
                const Icon =
                  item.trend === 'positive' ? ArrowUpRight :
                  item.trend === 'negative' ? ArrowDownRight :
                  Minus;
                const deltaColor =
                  item.trend === 'positive' ? 'text-[var(--status-positive)]' :
                  item.trend === 'negative' ? 'text-[var(--status-negative)]' :
                  'text-[var(--text-muted)]';

                return (
                  <div key={item.label} className="flex items-center justify-between py-[14px]">
                    <span className="text-[13px] text-[var(--text-secondary)]">{item.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[14px] font-semibold nums-tabular text-[var(--text-primary)]">
                        {item.value}
                      </span>
                      <span className={cn('flex items-center gap-0.5 font-mono text-[12px] font-medium nums-tabular', deltaColor)}>
                        <Icon className="h-3 w-3 shrink-0" strokeWidth={2.5} />
                        {item.delta}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live indicator */}
            <div className="border-t border-[var(--border-subtle)] px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-positive)] animate-pulse" />
                <span className="text-[11px] text-[var(--text-muted)]">
                  Live feed · updates every 30s
                </span>
              </div>
            </div>
          </div>

        </motion.div>

      </div>
    </DashboardShell>
  );
}
