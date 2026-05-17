'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { KPIStatCard } from '@/components/ui/KPIStatCard';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Download, BookmarkPlus } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { PRESETS, BASE_EBITDA } from '@/lib/scenarioModel';
import { useScenarioStore } from '@/store/useScenarioStore';
import {
  WaterfallChart,
  SensitivityCurveChart,
  ComparisonChart,
  SENSITIVITY_CURVE_LEGEND,
} from '@/components/charts/ScenarioCharts';

/* ─────────────────────────────────────────────────────────────────────────────
   Left panel — control sub-components
───────────────────────────────────────────────────────────────────────────── */

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 px-6 pt-6 pb-1">
      <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)] whitespace-nowrap">
        {title}
      </span>
      <div className="h-px flex-1 bg-[var(--border-subtle)]" />
    </div>
  );
}

function ControlBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5 px-6 py-5 border-b border-[var(--border-subtle)] last:border-b-0">
      {children}
    </div>
  );
}

function ScenarioSlider({
  label, value, min, max, step, onChange, displayFormat, unit, delta,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; displayFormat?: (v: number) => string;
  unit?: string; delta?: number;
}) {
  const pct     = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const display = displayFormat ? displayFormat(value) : value.toFixed(2);
  const hasDelta = delta !== undefined && Math.abs(delta) > 0.001;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[14px] font-medium leading-none text-[var(--text-secondary)]">{label}</span>
        <div className="flex shrink-0 items-center gap-2">
          {hasDelta && (
            <span className={cn(
              'rounded px-1.5 py-0.5 font-mono text-[10.5px] font-semibold nums-tabular',
              delta! > 0
                ? 'bg-[var(--status-positive-dim)] text-[var(--status-positive)]'
                : 'bg-[var(--status-negative-dim)] text-[var(--status-negative)]',
            )}>
              {delta! > 0 ? '+' : ''}{delta!.toFixed(2)}
            </span>
          )}
          <span className="font-mono text-[15px] font-bold leading-none nums-tabular text-[var(--text-primary)]">
            {display}
          </span>
          {unit && <span className="text-[10.5px] leading-none text-[var(--text-muted)]">{unit}</span>}
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider-track w-full"
        style={{ '--slider-pct': `${pct}%` } as React.CSSProperties}
      />
      <div className="flex justify-between">
        <span className="font-mono text-[10px] text-[var(--text-muted)] nums-tabular">
          {displayFormat ? displayFormat(min) : min}
        </span>
        <span className="font-mono text-[10px] text-[var(--text-muted)] nums-tabular">
          {displayFormat ? displayFormat(max) : max}
        </span>
      </div>
    </div>
  );
}

function HedgeToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[13px] font-medium leading-none text-[var(--text-primary)]">
          Active Hedge Program
        </p>
        <p className="mt-1.5 text-[11.5px] leading-none text-[var(--text-muted)]">
          {checked ? 'Hedges applied to downside exposure' : 'No hedge protection active'}
        </p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        role="switch" aria-checked={checked}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
          checked ? 'bg-[var(--accent-primary)]' : 'bg-[var(--surface-elevated)] border border-[var(--border-strong)]',
        )}
      >
        <motion.span
          className={cn(
            'absolute top-[3px] h-[18px] w-[18px] rounded-full shadow-sm transition-colors duration-200',
            checked ? 'bg-black' : 'bg-[var(--text-muted)]',
          )}
          animate={{ left: checked ? 'calc(100% - 21px)' : '3px' }}
          transition={{ type: 'spring', stiffness: 700, damping: 38 }}
        />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Chart panel wrapper
───────────────────────────────────────────────────────────────────────────── */

function ChartPanel({ title, subtitle, badge, legend, children }: {
  title: string; subtitle?: string; badge?: React.ReactNode;
  legend?: Array<{ color: string; label: string }>; children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-base)] bg-[var(--surface-elevated)]">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-8 py-6">
        <div>
          <p className="text-[15px] font-semibold leading-none text-[var(--text-primary)]">{title}</p>
          {subtitle && <p className="mt-1.5 text-[13px] text-[var(--text-muted)]">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-6 shrink-0">
          {legend?.map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="h-[10px] w-[10px] rounded-[2px] shrink-0" style={{ background: color }} />
              <span className="text-[12px] text-[var(--text-muted)]">{label}</span>
            </div>
          ))}
          {badge}
        </div>
      </div>
      <div className="px-8 py-7">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────────────────── */

export default function ScenarioPage() {
  /* ── Store selectors ──────────────────────────────────────────────────────
     Each selector is scoped to exactly what the component needs.
     `useShallow` on the inputs object prevents re-renders when unrelated
     store state (e.g. savedScenarios) changes.
  ────────────────────────────────────────────────────────────────────────── */
  const inputs         = useScenarioStore(useShallow((s) => s.inputs));
  const activePreset   = useScenarioStore((s) => s.activePreset);
  const outputs        = useScenarioStore(useShallow((s) => s.outputs));
  const waterfallData  = useScenarioStore((s) => s.waterfallData);
  const comparisonData = useScenarioStore((s) => s.comparisonData);

  /* Actions are stable function references — no useCallback needed */
  const setField            = useScenarioStore((s) => s.setField);
  const applyPreset         = useScenarioStore((s) => s.applyPreset);
  const resetToBase         = useScenarioStore((s) => s.resetToBase);
  const saveCurrentScenario = useScenarioStore((s) => s.saveCurrentScenario);

  /* Derived display values (cheap, computed inline) */
  const isPositive      = outputs.totalImpact >= 0;
  const totalSignal     = (isPositive ? 'positive' : 'negative') as 'positive' | 'negative';
  const impactFormatted = `${isPositive ? '+' : ''}$${Math.abs(outputs.totalImpact).toFixed(1)}M`;
  const currentPreset   = activePreset !== 'custom' ? PRESETS[activePreset] : null;

  return (
    <DashboardShell breadcrumb={['BAML Platform', 'Scenario Analysis']}>
      <div className="flex h-[calc(100vh-80px)] overflow-hidden">

        {/* ══════════════════════════════════════════════════════════════
            LEFT — Scenario Controls (~32%)
        ══════════════════════════════════════════════════════════════ */}
        <aside className="flex h-full w-[380px] min-w-[320px] shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-panel)] overflow-hidden">

          {/* ── Header + preset grid ─────────────────────────────────── */}
          <div className="shrink-0 border-b border-[var(--border-subtle)] px-6 py-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[20px] font-semibold leading-none tracking-tight text-[var(--text-primary)]">
                  Scenario Controls
                </h2>
                <p className="mt-2 text-[14px] leading-none text-[var(--text-muted)]">
                  Adjust inputs · outputs update live
                </p>
              </div>
              <button
                onClick={resetToBase}
                className="btn btn-sm btn-secondary flex items-center gap-1.5 shrink-0"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {Object.entries(PRESETS).map(([key, preset]) => {
                const isActive = activePreset === key;
                return (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className={cn(
                      'flex flex-col gap-1 rounded-xl border px-3.5 py-3 text-left transition-all duration-150',
                      isActive
                        ? 'border-[rgba(255,230,0,0.3)] bg-[var(--accent-dim)] text-[var(--accent-primary)]'
                        : 'border-[var(--border-base)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)]',
                    )}
                  >
                    <span className={cn('text-[12.5px] font-semibold leading-none', isActive && 'text-[var(--accent-primary)]')}>
                      {preset.label}
                    </span>
                    <span className={cn('text-[10.5px] leading-none', isActive ? 'text-[var(--accent-muted)]' : 'text-[var(--text-muted)]')}>
                      {preset.description}
                    </span>
                  </button>
                );
              })}
              {activePreset === 'custom' && (
                <div className="flex flex-col gap-1 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-3.5 py-3">
                  <span className="text-[12.5px] font-semibold leading-none text-[var(--text-primary)]">Custom</span>
                  <span className="text-[10.5px] leading-none text-[var(--text-muted)]">Modified scenario</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Scrollable sliders ───────────────────────────────────── */}
          <div className="scroll-thin flex-1 overflow-y-auto">

            <SectionDivider title="Commodity Prices" />
            <ControlBlock>
              <ScenarioSlider label="WTI Crude Oil"  value={inputs.wti}         min={40}  max={150} step={0.5}  onChange={(v) => setField('wti', v)}         displayFormat={(v) => `$${v.toFixed(2)}`} unit="/bbl"   delta={inputs.wti - 82.14} />
              <ScenarioSlider label="Brent Crude"    value={inputs.brent}       min={40}  max={160} step={0.5}  onChange={(v) => setField('brent', v)}       displayFormat={(v) => `$${v.toFixed(2)}`} unit="/bbl"   delta={inputs.brent - 85.60} />
              <ScenarioSlider label="Natural Gas"    value={inputs.naturalGas}  min={1.0} max={10}  step={0.05} onChange={(v) => setField('naturalGas', v)}  displayFormat={(v) => `$${v.toFixed(2)}`} unit="/MMBtu" delta={inputs.naturalGas - 2.84} />
              <ScenarioSlider label="Carbon Credits" value={inputs.carbonCost}  min={20}  max={120} step={0.5}  onChange={(v) => setField('carbonCost', v)}  displayFormat={(v) => `€${v.toFixed(2)}`} unit="/tCO₂" delta={inputs.carbonCost - 65.20} />
            </ControlBlock>

            <SectionDivider title="FX Rates" />
            <ControlBlock>
              <ScenarioSlider label="EUR / USD" value={inputs.eurUsd} min={0.85} max={1.35} step={0.001} onChange={(v) => setField('eurUsd', v)} displayFormat={(v) => v.toFixed(4)} delta={inputs.eurUsd - 1.0845} />
              <ScenarioSlider label="GBP / USD" value={inputs.gbpUsd} min={1.00} max={1.60} step={0.001} onChange={(v) => setField('gbpUsd', v)} displayFormat={(v) => v.toFixed(4)} delta={inputs.gbpUsd - 1.2731} />
            </ControlBlock>

            <SectionDivider title="Operating Assumptions" />
            <ControlBlock>
              <ScenarioSlider label="Freight Cost Multiplier" value={inputs.freight} min={0.5} max={2.5} step={0.05} onChange={(v) => setField('freight', v)} displayFormat={(v) => `${v.toFixed(2)}×`} delta={inputs.freight - 1.0} />
            </ControlBlock>

            <SectionDivider title="Hedge Settings" />
            <ControlBlock>
              <HedgeToggle checked={inputs.hedgeEnabled} onChange={(v) => setField('hedgeEnabled', v)} />
              <AnimatePresence>
                {inputs.hedgeEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="pt-5">
                      <ScenarioSlider label="Hedge Coverage" value={inputs.hedgeRatio} min={0} max={100} step={0.5} onChange={(v) => setField('hedgeRatio', v)} displayFormat={(v) => `${v.toFixed(1)}`} unit="%" delta={inputs.hedgeRatio - 67.4} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </ControlBlock>
          </div>

          {/* ── Impact footer ────────────────────────────────────────── */}
          <div className="shrink-0 border-t border-[var(--border-base)] bg-[var(--surface-secondary)]">

            {/* Net EBITDA hero */}
            <div className="border-b border-[var(--border-subtle)] px-6 pt-5 pb-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  Net EBITDA
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--status-positive)]" />
                  <span className="text-[10px] text-[var(--text-muted)]">Live</span>
                </span>
              </div>
              <motion.div
                key={outputs.netEBITDA.toFixed(1)}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.12 }}
                className="flex items-baseline gap-1.5"
              >
                <span className="font-mono text-[13px] font-medium text-[var(--text-secondary)]">$</span>
                <span className="font-mono text-[38px] font-bold leading-none nums-tabular tracking-tight text-[var(--text-primary)]">
                  {outputs.netEBITDA.toFixed(1)}
                </span>
                <span className="font-mono text-[14px] font-medium text-[var(--text-secondary)]">M</span>
              </motion.div>
            </div>

            {/* Breakdown rows */}
            <div className="space-y-2.5 border-b border-[var(--border-subtle)] px-6 py-4">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-[var(--text-muted)]">vs Base Case</span>
                <motion.span
                  key={impactFormatted}
                  initial={{ opacity: 0, y: -3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'font-mono text-[14px] font-bold nums-tabular',
                    isPositive ? 'text-[var(--status-positive)]' : 'text-[var(--status-negative)]',
                  )}
                >
                  {impactFormatted}
                </motion.span>
              </div>
              {inputs.hedgeEnabled && (
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] text-[var(--text-muted)]">Hedge Benefit</span>
                  <span className="font-mono text-[13px] font-semibold nums-tabular text-[var(--chart-2)]">
                    +${outputs.hedgeBenefit.toFixed(1)}M
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 px-4 py-3">
              <button className="btn btn-sm btn-secondary flex flex-1 items-center justify-center gap-1.5">
                <Download className="h-3 w-3" />
                Export
              </button>
              <button
                onClick={() => saveCurrentScenario()}
                className="btn btn-sm btn-primary flex flex-1 items-center justify-center gap-1.5"
              >
                <BookmarkPlus className="h-3 w-3" />
                Save
              </button>
            </div>
          </div>
        </aside>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT — Outputs & Visualizations (~68%)
        ══════════════════════════════════════════════════════════════ */}
        <main className="scroll-thin flex-1 overflow-y-auto bg-[var(--surface-base)]">
          <div className="space-y-8 p-10">

            {/* ── Scenario header ───────────────────────────────────── */}
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--accent-primary)]" />
                <div>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    {activePreset === 'custom' ? 'Custom Scenario' : 'Preset Scenario'}
                  </div>
                  <h1 className="text-[30px] font-semibold leading-none tracking-tight text-[var(--text-primary)]">
                    {currentPreset?.label ?? 'Custom Scenario'}
                  </h1>
                  <p className="mt-2 text-[15px] text-[var(--text-muted)]">
                    {currentPreset?.description ?? 'Modified from base case assumptions'}
                  </p>
                </div>
              </div>
            </div>

            {/* ── KPI output cards ─────────────────────────────────── */}
            <div className="grid grid-cols-4 gap-5">
              <KPIStatCard
                label="Net EBITDA"
                value={outputs.netEBITDA.toFixed(1)}
                unit="$M" unitPosition="prefix"
                delta={impactFormatted}
                signal={totalSignal}
                accent="yellow" featured size="md"
              />
              <KPIStatCard
                label="vs Base Case"
                value={Math.abs(outputs.totalImpact).toFixed(1)}
                unit="$M" unitPosition="prefix"
                deltaLabel={`${isPositive ? 'Improvement' : 'Reduction'} from $${BASE_EBITDA}M`}
                signal={totalSignal} size="md"
              />
              <KPIStatCard
                label="Hedge Benefit"
                value={outputs.hedgeBenefit.toFixed(1)}
                unit="$M" unitPosition="prefix"
                deltaLabel={inputs.hedgeEnabled ? `${inputs.hedgeRatio.toFixed(1)}% coverage` : 'No hedge active'}
                signal={outputs.hedgeBenefit > 0 ? 'positive' : 'neutral'} size="md"
              />
              <KPIStatCard
                label="Unhedged Exposure"
                value={outputs.totalNegativeExposure.toFixed(1)}
                unit="$M" unitPosition="prefix"
                deltaLabel={
                  outputs.totalNegativeExposure > 0
                    ? `${((1 - inputs.hedgeRatio / 100) * 100).toFixed(0)}% unprotected`
                    : 'No downside exposure'
                }
                signal={outputs.totalNegativeExposure > 10 ? 'negative' : 'neutral'} size="md"
              />
            </div>

            {/* ── EBITDA Bridge — hero visualization ───────────────── */}
            <ChartPanel
              title="EBITDA Bridge"
              subtitle="Base → Net · all values in $M"
              legend={[
                { color: 'var(--accent-primary)',  label: 'Total'    },
                { color: 'var(--status-positive)', label: 'Positive' },
                { color: 'var(--status-negative)', label: 'Negative' },
                { color: 'var(--chart-2)',          label: 'Hedge'    },
              ]}
            >
              <WaterfallChart data={waterfallData} height={400} />
            </ChartPanel>

            {/* ── Comparison + Sensitivity — equal-width row ─────────── */}
            <div className="grid grid-cols-2 gap-6">

              <ChartPanel
                title="Hedged vs Unhedged"
                subtitle="EBITDA outcome comparison"
                badge={
                  <span className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em]',
                    inputs.hedgeEnabled
                      ? 'bg-[var(--status-positive-dim)] border-[rgba(34,197,94,0.2)] text-[var(--status-positive)]'
                      : 'bg-[var(--status-negative-dim)] border-[rgba(239,68,68,0.2)] text-[var(--status-negative)]',
                  )}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', inputs.hedgeEnabled ? 'bg-[var(--status-positive)]' : 'bg-[var(--status-negative)]')} />
                    {inputs.hedgeEnabled ? 'Hedge On' : 'Hedge Off'}
                  </span>
                }
              >
                <ComparisonChart data={comparisonData} height={340} />
              </ChartPanel>

              <ChartPanel
                title="Sensitivity Curves"
                subtitle="EBITDA impact as each factor moves ±30% from current"
                legend={SENSITIVITY_CURVE_LEGEND}
              >
                <SensitivityCurveChart inputs={inputs} height={340} />
              </ChartPanel>

            </div>
          </div>
        </main>

      </div>
    </DashboardShell>
  );
}
