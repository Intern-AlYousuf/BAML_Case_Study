'use client';

/**
 * ScenarioCharts — three production-grade financial analytics charts.
 *
 * WaterfallChart       — stacked-bar EBITDA bridge with value labels
 * SensitivityCurveChart — multi-line parametric sensitivity (replaces horizontal bars)
 * ComparisonChart      — hedged vs unhedged bar chart with reference line
 *
 * All charts are data-pure (receive data as props) and use the global
 * CSS design token palette so they match the dark theme automatically.
 */

import { useMemo } from 'react';
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
  LabelList,
  LineChart,
  Line,
} from 'recharts';
import { cn } from '@/lib/utils';
import { SENS, BASE_EBITDA } from '@/lib/scenarioModel';
import type { WaterfallEntry, ComparisonEntry, ScenarioInputs } from '@/lib/scenarioModel';

/* ─────────────────────────────────────────────────────────────────────────────
   Shared tooltip shell
───────────────────────────────────────────────────────────────────────────── */

function TooltipShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-base)] bg-[var(--surface-elevated)] px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
      <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {title}
      </p>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. Waterfall Chart
   Stacked-bar EBITDA bridge from Base → Net.
   Shows positive drivers, negative drivers, and hedge recovery.
   Value labels sit above each bar pair.
───────────────────────────────────────────────────────────────────────────── */

function WaterfallBar({ x = 0, y = 0, width = 0, height = 0, fill = '' }: {
  x?: number; y?: number; width?: number; height?: number; fill?: string;
}) {
  const radius = 4;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      rx={radius}
      ry={radius}
    />
  );
}

function WaterfallValueLabel({
  x = 0, y = 0, width = 0, value, index, data,
}: {
  x?: number; y?: number; width?: number; value?: number;
  index?: number; data: WaterfallEntry[];
}) {
  const entry = data[index ?? 0];
  if (!entry || !value || value === 0) return null;

  const isTotal = entry.isTotal;
  const rawVal  = isTotal ? entry.positive : entry.delta;
  const label   = isTotal
    ? `$${rawVal.toFixed(1)}M`
    : `${rawVal > 0 ? '+' : ''}$${rawVal.toFixed(1)}M`;

  const fill = isTotal
    ? 'var(--accent-primary)'
    : entry.isHedge
    ? 'var(--chart-2)'
    : rawVal > 0
    ? 'var(--status-positive)'
    : 'var(--status-negative)';

  return (
    <text
      x={x + width / 2}
      y={y - 6}
      textAnchor="middle"
      fill={fill}
      fontSize={10}
      fontFamily="var(--font-mono)"
      fontWeight={600}
    >
      {label}
    </text>
  );
}

interface WaterfallTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: WaterfallEntry }>;
}

function WaterfallTooltipContent({ active, payload }: WaterfallTooltipProps) {
  if (!active || !payload?.length) return null;
  const d   = payload[0].payload;
  const val = d.isTotal ? d.positive : d.delta;

  const valueColor = d.isTotal
    ? 'text-[var(--accent-primary)]'
    : d.isHedge
    ? 'text-[var(--chart-2)]'
    : val < 0
    ? 'text-[var(--status-negative)]'
    : 'text-[var(--status-positive)]';

  return (
    <TooltipShell title={d.name}>
      <p className={cn('font-mono text-[17px] font-bold nums-tabular', valueColor)}>
        {d.isTotal ? `$${val.toFixed(1)}M` : `${val > 0 ? '+' : ''}$${val.toFixed(1)}M`}
      </p>
      {!d.isTotal && (
        <p className="mt-1 text-[10.5px] text-[var(--text-muted)]">
          EBITDA impact · $M
        </p>
      )}
    </TooltipShell>
  );
}

export function WaterfallChart({ data, height = 300 }: { data: WaterfallEntry[]; height?: number }) {
  const allTops    = data.map((d) => d.baseline + Math.max(d.positive, d.negative));
  const domainMax  = Math.max(...allTops) * 1.08;
  const minBase    = Math.min(...data.map((d) => d.baseline));
  const domainMin  = Math.max(0, minBase * 0.90);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        barCategoryGap="30%"
        margin={{ top: 28, right: 12, left: 8, bottom: 4 }}
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
          dy={8}
          tick={{
            fill: 'var(--text-muted)',
            fontSize: 11,
            fontFamily: 'var(--font-sans)',
          }}
        />
        <YAxis
          domain={[domainMin, domainMax]}
          tickFormatter={(v) => `$${v.toFixed(0)}M`}
          axisLine={false}
          tickLine={false}
          width={62}
          tick={{
            fill: 'var(--text-muted)',
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
          }}
        />
        <Tooltip
          content={<WaterfallTooltipContent />}
          cursor={{ fill: 'rgba(255,255,255,0.025)' }}
        />

        {/* Transparent spacer — lifts visible bars to correct Y position */}
        <Bar dataKey="baseline" stackId="wf" fill="transparent" isAnimationActive={false} />

        {/* Positive / total bars */}
        <Bar
          dataKey="positive"
          stackId="wf"
          shape={<WaterfallBar />}
          isAnimationActive
          animationDuration={380}
          animationEasing="ease-out"
        >
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
              fillOpacity={entry.positive === 0 ? 0 : entry.isTotal ? 0.9 : 1}
            />
          ))}
          <LabelList
            content={(props) => (
              <WaterfallValueLabel
                {...(props as { x?: number; y?: number; width?: number; value?: number; index?: number })}
                data={data}
              />
            )}
          />
        </Bar>

        {/* Negative bars */}
        <Bar
          dataKey="negative"
          stackId="wf"
          shape={<WaterfallBar />}
          fill="var(--status-negative)"
          isAnimationActive
          animationDuration={380}
          animationEasing="ease-out"
        >
          <LabelList
            content={(props) => {
              const { x = 0, y = 0, width = 0, value, index = 0 } = props as {
                x?: number; y?: number; width?: number; value?: number; index?: number;
              };
              const entry = data[index];
              if (!entry || !value || value === 0) return null;
              return (
                <text
                  x={x + width / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fill="var(--status-negative)"
                  fontSize={10}
                  fontFamily="var(--font-mono)"
                  fontWeight={600}
                >
                  {`−$${value.toFixed(1)}M`}
                </text>
              );
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. Sensitivity Curve Chart
   Multi-line parametric sensitivity: shows how EBITDA changes as each
   risk factor moves ±30% from its current value.
   Replaces the static horizontal bar chart with a live-updating line chart
   that responds to slider changes.
───────────────────────────────────────────────────────────────────────────── */

const CURVE_PCT_STEPS = [-30, -20, -10, -5, 0, 5, 10, 20, 30] as const;

type CurveKey = 'WTI' | 'EUR/USD' | 'Freight' | 'Carbon';

const CURVE_META: Record<CurveKey, { color: string; dash?: string }> = {
  WTI:        { color: 'var(--status-negative)' },
  'EUR/USD':  { color: 'var(--chart-2)' },
  Freight:    { color: 'var(--status-warning)' },
  Carbon:     { color: 'var(--chart-5)', dash: '4 3' },
};

interface CurveTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
}

function SensitivityCurveTooltip({ active, payload, label }: CurveTooltipProps) {
  if (!active || !payload?.length) return null;
  const pctLabel = `${(label ?? 0) > 0 ? '+' : ''}${label ?? 0}%`;

  return (
    <TooltipShell title={`At ${pctLabel} move`}>
      <div className="space-y-1.5">
        {[...payload]
          .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
          .map((p) => (
            <div key={p.name} className="flex items-center gap-3">
              <span
                className="h-[2px] w-4 shrink-0 rounded-full"
                style={{ background: p.color }}
              />
              <span className="text-[11px] text-[var(--text-secondary)] flex-1">
                {p.name}
              </span>
              <span
                className={cn(
                  'ml-auto font-mono text-[12.5px] font-semibold nums-tabular',
                  p.value > 0 ? 'text-[var(--status-positive)]' : p.value < 0 ? 'text-[var(--status-negative)]' : 'text-[var(--text-muted)]',
                )}
              >
                {p.value >= 0 ? '+' : ''}${p.value.toFixed(1)}M
              </span>
            </div>
          ))}
      </div>
    </TooltipShell>
  );
}

export function SensitivityCurveChart({ inputs, height = 220 }: { inputs: ScenarioInputs; height?: number }) {
  const data = useMemo(
    () =>
      CURVE_PCT_STEPS.map((pct) => {
        const m = pct / 100;
        return {
          pct,
          WTI:        inputs.wti       * m * SENS.wtiPerDollar,
          'EUR/USD':  (inputs.eurUsd   * m / 0.01) * SENS.eurUsdPer001,
          Freight:    (m * 10)         * SENS.freightPer10pct,
          Carbon:     inputs.carbonCost * m * SENS.carbonPerEuro,
        };
      }),
    // Re-compute whenever the relevant inputs change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inputs.wti, inputs.eurUsd, inputs.freight, inputs.carbonCost],
  );

  /* Dynamic Y-domain: round outward to the nearest 20 */
  const allValues = data.flatMap((d) =>
    (Object.keys(CURVE_META) as CurveKey[]).map((k) => d[k] as number),
  );
  const yMax = Math.ceil(Math.max(...allValues.map(Math.abs)) / 20) * 20;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 12, right: 24, left: 8, bottom: 4 }}
      >
        <CartesianGrid
          stroke="var(--chart-grid)"
          strokeDasharray="0"
          vertical={false}
        />

        <XAxis
          dataKey="pct"
          type="number"
          domain={[-30, 30]}
          ticks={[-30, -20, -10, 0, 10, 20, 30]}
          tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}%`}
          axisLine={false}
          tickLine={false}
          dy={8}
          tick={{
            fill: 'var(--text-muted)',
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
          }}
        />

        <YAxis
          domain={[-yMax, yMax]}
          tickFormatter={(v) => `${v >= 0 ? '+' : ''}$${Math.abs(v).toFixed(0)}M`}
          axisLine={false}
          tickLine={false}
          width={62}
          tick={{
            fill: 'var(--text-muted)',
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
          }}
        />

        {/* Zero EBITDA impact baseline */}
        <ReferenceLine
          y={0}
          stroke="var(--border-base)"
          strokeWidth={1}
        />

        {/* Current position — x=0 means no change */}
        <ReferenceLine
          x={0}
          stroke="var(--border-strong)"
          strokeDasharray="4 3"
          strokeWidth={1}
        />

        <Tooltip
          content={<SensitivityCurveTooltip />}
          cursor={{
            stroke: 'var(--border-strong)',
            strokeWidth: 1,
            strokeDasharray: '4 3',
          }}
        />

        {(Object.entries(CURVE_META) as [CurveKey, typeof CURVE_META[CurveKey]][]).map(
          ([key, meta]) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={meta.color}
              strokeWidth={1.75}
              strokeDasharray={meta.dash}
              dot={false}
              activeDot={{
                r: 4,
                fill: meta.color,
                stroke: 'var(--surface-elevated)',
                strokeWidth: 2,
              }}
              isAnimationActive
              animationDuration={420}
              animationEasing="ease-out"
            />
          ),
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

/* Legend for SensitivityCurveChart — used in ChartPanel's legend slot */
export const SENSITIVITY_CURVE_LEGEND = (
  Object.entries(CURVE_META) as [CurveKey, typeof CURVE_META[CurveKey]][]
).map(([label, meta]) => ({
  label,
  color: meta.color,
}));

/* ─────────────────────────────────────────────────────────────────────────────
   3. Comparison Chart
   Three vertical bars: Base Case / Unhedged / Hedged.
   A dashed reference line marks the base EBITDA.
   Value labels float above each bar.
───────────────────────────────────────────────────────────────────────────── */

interface ComparisonTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; fill: string }>;
  label?: string;
}

function ComparisonTooltipContent({ active, payload, label }: ComparisonTooltipProps) {
  if (!active || !payload?.length) return null;
  const val  = payload[0].value;
  const diff = val - BASE_EBITDA;

  return (
    <TooltipShell title={label ?? ''}>
      <p className="font-mono text-[17px] font-bold nums-tabular text-[var(--text-primary)]">
        ${val.toFixed(1)}M
      </p>
      {diff !== 0 && (
        <p
          className={cn(
            'mt-1 font-mono text-[11.5px] font-semibold nums-tabular',
            diff > 0 ? 'text-[var(--status-positive)]' : 'text-[var(--status-negative)]',
          )}
        >
          {diff > 0 ? '+' : ''}${diff.toFixed(1)}M vs base
        </p>
      )}
    </TooltipShell>
  );
}

function ComparisonValueLabel({
  x = 0,
  y = 0,
  width = 0,
  value,
  fill = '',
}: {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
  fill?: string;
}) {
  if (!value) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 7}
      textAnchor="middle"
      fill={fill || 'var(--text-secondary)'}
      fontSize={10.5}
      fontFamily="var(--font-mono)"
      fontWeight={600}
    >
      ${value.toFixed(1)}M
    </text>
  );
}

function barFillForComparison(entry: ComparisonEntry, index: number, data: ComparisonEntry[]): string {
  if (index === 0) return 'var(--accent-primary)';
  if (entry.ebitda >= BASE_EBITDA) return 'var(--status-positive)';
  if (entry.ebitda >= data[1]?.ebitda) return 'var(--chart-2)';
  return 'var(--status-negative)';
}

export function ComparisonChart({
  data,
  height = 220,
}: {
  data: ComparisonEntry[];
  height?: number;
}) {
  const values   = data.map((d) => d.ebitda);
  const domainMin = Math.min(...values) * 0.90;
  const domainMax = Math.max(...values) * 1.10;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        barCategoryGap="38%"
        margin={{ top: 28, right: 12, left: 8, bottom: 4 }}
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
          dy={8}
          tick={{
            fill: 'var(--text-muted)',
            fontSize: 11,
            fontFamily: 'var(--font-sans)',
          }}
        />
        <YAxis
          domain={[domainMin, domainMax]}
          tickFormatter={(v) => `$${v.toFixed(0)}M`}
          axisLine={false}
          tickLine={false}
          width={62}
          tick={{
            fill: 'var(--text-muted)',
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
          }}
        />
        <Tooltip
          content={<ComparisonTooltipContent />}
          cursor={{ fill: 'rgba(255,255,255,0.025)' }}
        />

        {/* Base case reference line */}
        <ReferenceLine
          y={BASE_EBITDA}
          stroke="var(--border-strong)"
          strokeDasharray="5 4"
          strokeWidth={1}
          label={{
            value: `Base $${BASE_EBITDA}M`,
            position: 'insideTopRight',
            fill: 'var(--text-muted)',
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            dy: -4,
          }}
        />

        <Bar
          dataKey="ebitda"
          name="EBITDA"
          radius={[5, 5, 0, 0]}
          isAnimationActive
          animationDuration={400}
          animationEasing="ease-out"
        >
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={barFillForComparison(entry, i, data)}
              fillOpacity={i === 0 ? 0.75 : 1}
            />
          ))}
          <LabelList
            dataKey="ebitda"
            content={(props) => {
              const { x, y, width, value, index = 0 } = props as {
                x?: number; y?: number; width?: number;
                value?: number; index?: number;
              };
              const entry = data[index];
              const fill  = barFillForComparison(entry, index, data);
              return (
                <ComparisonValueLabel
                  x={x} y={y} width={width} value={value as number} fill={fill}
                />
              );
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
