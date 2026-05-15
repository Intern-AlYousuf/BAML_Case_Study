import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { PanelContainer } from '@/components/ui/PanelContainer';
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  TrendingUp,
  ChevronRight,
  Zap,
  Shield,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────────────────────
   KPI Card
───────────────────────────────────────────────────────────────────────────── */
function KPICard({
  label,
  value,
  delta,
  deltaLabel,
  trend,
  unit,
  unitSuffix,
}: {
  label: string;
  value: string;
  delta: string;
  deltaLabel: string;
  trend: 'positive' | 'negative' | 'neutral';
  unit?: string;
  unitSuffix?: boolean;
}) {
  const DeltaIcon =
    trend === 'positive' ? ArrowUpRight :
    trend === 'negative' ? ArrowDownRight :
    Minus;

  const deltaColor =
    trend === 'positive' ? 'text-[var(--status-positive)]' :
    trend === 'negative' ? 'text-[var(--status-negative)]' :
    'text-[var(--text-muted)]';

  const accentBar =
    trend === 'positive' ? 'bg-[var(--status-positive)]' :
    trend === 'negative' ? 'bg-[var(--status-negative)]' :
    'bg-[var(--border-base)]';

  return (
    <div className="relative flex flex-col bg-[var(--surface-secondary)] rounded-xl border border-[var(--border-subtle)] p-6 min-h-[168px] transition-colors duration-150 hover:bg-[var(--surface-elevated)] group">
      <div className={cn('absolute top-0 left-6 right-6 h-[2px] rounded-b-full opacity-50', accentBar)} />
      <p className="text-[10.5px] font-semibold tracking-[0.14em] uppercase text-[var(--text-muted)] mb-auto">
        {label}
      </p>
      <div className="flex items-baseline gap-1.5 mt-6 mb-3">
        {unit && !unitSuffix && (
          <span className="font-mono text-[18px] font-medium text-[var(--text-secondary)]">{unit}</span>
        )}
        <span className="font-mono text-[42px] font-bold text-[var(--text-primary)] leading-none nums-tabular tracking-tight">
          {value}
        </span>
        {unit && unitSuffix && (
          <span className="font-mono text-[18px] font-medium text-[var(--text-secondary)]">{unit}</span>
        )}
      </div>
      <div className={cn('flex items-center gap-1.5', deltaColor)}>
        <DeltaIcon className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
        <span className="font-mono text-[12.5px] font-semibold nums-tabular">{delta}</span>
        <span className="text-[11.5px] text-[var(--text-muted)] font-normal">{deltaLabel}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Metric Row
───────────────────────────────────────────────────────────────────────────── */
function MetricRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border-subtle)] last:border-b-0">
      <span className="text-[13px] text-[var(--text-secondary)]">{label}</span>
      <span className={cn('font-mono text-[13px] font-medium nums-tabular text-[var(--text-primary)]', valueClass)}>
        {value}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────────────────── */
export default function OverviewPage() {
  return (
    <DashboardShell title="Overview" breadcrumb={['BAML Platform', 'Overview']}>
      <div className="px-8 py-8 space-y-8 max-w-[1400px]">

        {/* ── Page header ──────────────────────────────────────────── */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-[var(--text-primary)] leading-none">
              Portfolio Overview
            </h1>
            <p className="text-[12.5px] text-[var(--text-muted)] mt-2">
              FY2026 Q2 · Consolidated · As of 14 May 2026
            </p>
          </div>
          <Link href="/scenario">
            <button className="btn btn-primary flex items-center gap-2 text-[13px] px-4 py-2">
              <Zap className="w-3.5 h-3.5" />
              Open Scenario Analysis
            </button>
          </Link>
        </div>

        {/* ── KPI tiles ────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard
            label="EBITDA at Risk"
            value="124.3"
            unit="$M"
            delta="−$8.2M"
            deltaLabel="vs last quarter"
            trend="negative"
          />
          <KPICard
            label="Hedge Ratio"
            value="67.4"
            unit="%"
            unitSuffix
            delta="+3.1%"
            deltaLabel="vs target 70%"
            trend="positive"
          />
          <KPICard
            label="FX Exposure"
            value="342.8"
            unit="$M"
            delta="+$12.4M"
            deltaLabel="unhedged notional"
            trend="negative"
          />
          <KPICard
            label="Commodity Exp."
            value="89.6"
            unit="$M"
            delta="—"
            deltaLabel="no change"
            trend="neutral"
          />
        </div>

        {/* ── Scenario Analysis CTA ────────────────────────────────── */}
        <Link href="/scenario" className="block group">
          <div className="relative overflow-hidden rounded-xl border border-[rgba(255,230,0,0.18)] bg-[var(--accent-dim)] px-8 py-6 transition-all duration-200 hover:border-[rgba(255,230,0,0.3)] hover:bg-[rgba(35,31,0,0.9)]">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,230,0,0.02)] to-transparent pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-black" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <h2 className="text-[15px] font-bold text-[var(--accent-primary)] leading-none tracking-tight">
                      Scenario Analysis
                    </h2>
                    <span className="text-[9px] font-bold tracking-[0.14em] text-[var(--accent-primary)] bg-[rgba(255,230,0,0.12)] border border-[rgba(255,230,0,0.2)] px-[5px] py-[2.5px] rounded-[3px] uppercase leading-none">
                      Primary
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed max-w-[560px]">
                    Model commodity shocks, FX moves and hedge strategies interactively.
                    Adjust sliders and see EBITDA impact, waterfall bridge, and sensitivity analysis live.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[var(--accent-primary)] group-hover:gap-3 transition-all duration-200 shrink-0">
                <span className="text-[13px] font-semibold">Open</span>
                <ChevronRight className="w-4 h-4" strokeWidth={2} />
              </div>
            </div>

            {/* Feature pills */}
            <div className="flex items-center gap-2 mt-4 ml-[60px]">
              {[
                'Live Recalculation',
                'EBITDA Waterfall',
                'Hedge Simulation',
                'Sensitivity Analysis',
                'Stress Testing',
              ].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium text-[var(--text-muted)] bg-[var(--surface-elevated)] border border-[var(--border-base)] px-2.5 py-1 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Link>

        {/* ── Risk summary / Hedge portfolio / Active scenarios ─────── */}
        <div className="grid grid-cols-3 gap-5">

          {/* Risk Summary */}
          <PanelContainer
            label="Risk Summary"
            accent="negative"
            action={
              <Link href="/risk">
                <button className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors">
                  <Shield className="w-3 h-3" />
                  Risk detail
                </button>
              </Link>
            }
          >
            <MetricRow label="Commodity Price Risk"      value="$52.1M" valueClass="text-[var(--status-negative)]" />
            <MetricRow label="FX Translation Risk"       value="$38.7M" valueClass="text-[var(--status-negative)]" />
            <MetricRow label="Interest Rate Sensitivity" value="$18.4M" />
            <MetricRow label="Counterparty Credit"       value="$15.1M" />
            <MetricRow label="Liquidity Reserve"         value="$210.0M" valueClass="text-[var(--status-positive)]" />
          </PanelContainer>

          {/* Hedge Portfolio */}
          <PanelContainer
            label="Hedge Portfolio"
            accent="yellow"
            action={
              <span className="badge badge-positive text-[9px]">Active</span>
            }
          >
            <MetricRow label="Total Notional Hedged"  value="$231.4M" />
            <MetricRow label="Mark-to-Market P&L"     value="+$6.8M" valueClass="text-[var(--status-positive)]" />
            <MetricRow label="Average Hedge Duration" value="8.4 mo" />
            <MetricRow label="Instruments (Active)"   value="14" />
            <MetricRow label="Next Maturity"          value="Jun 30" />
          </PanelContainer>

          {/* Active Scenarios */}
          <PanelContainer
            label="Saved Scenarios"
            action={
              <Link href="/scenario">
                <button className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors">
                  <BarChart3 className="w-3 h-3" />
                  Open simulator
                </button>
              </Link>
            }
          >
            {[
              { name: 'Base Case',         ebitda: '$487.2M', impact: '—',       badge: 'neutral'  },
              { name: 'Oil +20% Shock',    ebitda: '$421.6M', impact: '−$65.6M', badge: 'negative' },
              { name: 'FX Bear (USD+10%)', ebitda: '$459.3M', impact: '−$27.9M', badge: 'negative' },
              { name: 'Hedged Recovery',   ebitda: '$471.0M', impact: '+$49.4M', badge: 'positive' },
            ].map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between py-3 border-b border-[var(--border-subtle)] last:border-b-0"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full shrink-0',
                      s.badge === 'positive' ? 'bg-[var(--status-positive)]' :
                      s.badge === 'negative' ? 'bg-[var(--status-negative)]' :
                      'bg-[var(--text-muted)]'
                    )}
                  />
                  <span className="text-[13px] text-[var(--text-primary)]">{s.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[13px] text-[var(--text-primary)] nums-tabular">{s.ebitda}</span>
                  <span
                    className={cn(
                      'font-mono text-[12px] nums-tabular w-[64px] text-right',
                      s.badge === 'positive' ? 'text-[var(--status-positive)]' :
                      s.badge === 'negative' ? 'text-[var(--status-negative)]' :
                      'text-[var(--text-muted)]'
                    )}
                  >
                    {s.impact}
                  </span>
                </div>
              </div>
            ))}
          </PanelContainer>

        </div>

      </div>
    </DashboardShell>
  );
}
