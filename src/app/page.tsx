import { DashboardShell } from '@/components/layout/DashboardShell';
import { PanelContainer } from '@/components/ui/PanelContainer';
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  TrendingUp,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────────────────────
   KPI Stat Card
   Prominent metric tile — large value, clear hierarchy, minimal chrome
───────────────────────────────────────────────────────────────────────────── */
interface KPIStat {
  label: string;
  value: string;
  delta: string;
  deltaLabel: string;
  trend: 'positive' | 'negative' | 'neutral';
  unit?: string;
  unitSuffix?: boolean;
}

function KPIStatCard({ label, value, delta, deltaLabel, trend, unit, unitSuffix }: KPIStat) {
  const DeltaIcon =
    trend === 'positive' ? ArrowUpRight :
    trend === 'negative' ? ArrowDownRight :
    Minus;

  const deltaColor =
    trend === 'positive' ? 'text-[var(--status-positive)]' :
    trend === 'negative' ? 'text-[var(--status-negative)]' :
    'text-[var(--text-muted)]';

  const accentLine =
    trend === 'positive' ? 'bg-[var(--status-positive)]' :
    trend === 'negative' ? 'bg-[var(--status-negative)]' :
    'bg-[var(--border-base)]';

  return (
    <div className="relative flex flex-col bg-[var(--surface-secondary)] rounded-[10px] border border-[var(--border-subtle)] p-5 min-h-[160px] group transition-colors duration-150 hover:bg-[var(--surface-elevated)]">
      {/* Top accent bar */}
      <div className={cn('absolute top-0 left-5 right-5 h-[2px] rounded-b-full opacity-60', accentLine)} />

      {/* Label */}
      <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[var(--text-muted)] mb-auto">
        {label}
      </p>

      {/* Value */}
      <div className="flex items-baseline gap-1.5 mt-5 mb-3">
        {unit && !unitSuffix && (
          <span className="font-mono text-[19px] font-medium text-[var(--text-secondary)]">{unit}</span>
        )}
        <span className="font-mono text-[44px] font-bold text-[var(--text-primary)] leading-none nums-tabular tracking-tight">
          {value}
        </span>
        {unit && unitSuffix && (
          <span className="font-mono text-[19px] font-medium text-[var(--text-secondary)]">{unit}</span>
        )}
      </div>

      {/* Delta */}
      <div className={cn('flex items-center gap-1.5', deltaColor)}>
        <DeltaIcon className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
        <span className="font-mono text-[13px] font-semibold nums-tabular">{delta}</span>
        <span className="text-[12px] text-[var(--text-muted)] font-normal">{deltaLabel}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Metric Row — label / value pair with generous spacing
───────────────────────────────────────────────────────────────────────────── */
function MetricRow({
  label,
  value,
  valueClass,
  divider = true,
}: {
  label: string;
  value: string;
  valueClass?: string;
  divider?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between py-3',
        divider && 'border-b border-[var(--border-subtle)] last:border-b-0'
      )}
    >
      <span className="text-[13px] text-[var(--text-secondary)]">{label}</span>
      <span className={cn('font-mono text-[13px] font-medium nums-tabular text-[var(--text-primary)]', valueClass)}>
        {value}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Signal Row — risk alert with severity badge
───────────────────────────────────────────────────────────────────────────── */
type SignalLevel = 'high' | 'medium' | 'low';

function SignalRow({ label, detail, level, time }: {
  label: string;
  detail: string;
  level: SignalLevel;
  time: string;
}) {
  const levelStyle: Record<SignalLevel, string> = {
    high:   'bg-[var(--status-negative-dim)] text-[var(--status-negative)] border-[rgba(239,68,68,0.2)]',
    medium: 'bg-[var(--status-warning-dim)]  text-[var(--status-warning)]  border-[rgba(245,158,11,0.2)]',
    low:    'bg-[var(--status-neutral-dim)]  text-[var(--status-neutral)]  border-[rgba(59,130,246,0.2)]',
  };

  return (
    <div className="flex items-start gap-3.5 py-3.5 border-b border-[var(--border-subtle)] last:border-b-0">
      <span
        className={cn(
          'mt-[2px] shrink-0 inline-flex items-center px-[6px] py-[3px] rounded-[3px] text-[10px] font-bold tracking-[0.1em] uppercase border',
          levelStyle[level]
        )}
      >
        {level}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[var(--text-primary)] leading-snug">{label}</p>
        <p className="text-[12px] text-[var(--text-muted)] mt-[3px] leading-snug truncate">{detail}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 text-[var(--text-muted)] mt-[2px]">
        <Clock className="w-3 h-3" strokeWidth={1.5} />
        <span className="text-[11px]">{time}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Page — Overview
───────────────────────────────────────────────────────────────────────────── */
export default function OverviewPage() {
  return (
    <DashboardShell title="Overview" breadcrumb={['BAML Platform', 'Overview']}>
      <div className="px-8 py-7 space-y-7 max-w-[1680px]">

        {/* ── Page header ──────────────────────────────────────────── */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[24px] font-bold tracking-tight text-[var(--text-primary)] leading-tight">
              Risk Dashboard
            </h1>
            <p className="text-[13px] text-[var(--text-muted)] mt-1">
              As of 14 May 2026 · FY2026 Q2 · Consolidated view
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button className="btn btn-secondary">Export</button>
            <button className="btn btn-primary flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Run Scenario
            </button>
          </div>
        </div>

        {/* ── Row 1 — KPI tiles ────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-4">
          <KPIStatCard
            label="EBITDA at Risk"
            value="124.3"
            unit="$M"
            delta="−$8.2M"
            deltaLabel="vs. last quarter"
            trend="negative"
          />
          <KPIStatCard
            label="Hedge Ratio"
            value="67.4"
            unit="%"
            unitSuffix
            delta="+3.1%"
            deltaLabel="vs. target 70%"
            trend="positive"
          />
          <KPIStatCard
            label="FX Exposure"
            value="342.8"
            unit="$M"
            delta="+$12.4M"
            deltaLabel="unhedged notional"
            trend="negative"
          />
          <KPIStatCard
            label="Commodity Exp."
            value="89.6"
            unit="$M"
            delta="0.0%"
            deltaLabel="no change"
            trend="neutral"
          />
        </div>

        {/* ── Row 2 — Risk / Hedge / Scenarios ─────────────────────── */}
        <div className="grid grid-cols-3 gap-5">

          {/* Risk Summary */}
          <PanelContainer
            label="Risk Summary"
            accent="negative"
            action={
              <button className="flex items-center gap-1 text-[11.5px] font-medium text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors">
                Details
                <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
              </button>
            }
          >
            <MetricRow label="Commodity Price Risk"      value="$52.1M"  valueClass="text-[var(--status-negative)]" />
            <MetricRow label="FX Translation Risk"       value="$38.7M"  valueClass="text-[var(--status-negative)]" />
            <MetricRow label="Interest Rate Sensitivity" value="$18.4M"  />
            <MetricRow label="Counterparty Credit"       value="$15.1M"  />
            <MetricRow label="Liquidity Reserve"         value="$210.0M" valueClass="text-[var(--status-positive)]" />
          </PanelContainer>

          {/* Hedge Status */}
          <PanelContainer
            label="Hedge Portfolio"
            accent="yellow"
            action={
              <span className="badge badge-positive">Active</span>
            }
          >
            <MetricRow label="Total Notional Hedged"  value="$231.4M" />
            <MetricRow label="Mark-to-Market P&L"     value="+$6.8M"  valueClass="text-[var(--status-positive)]" />
            <MetricRow label="Average Hedge Duration" value="8.4 mo"  />
            <MetricRow label="Instruments (Active)"   value="14"      />
            <MetricRow label="Next Maturity"          value="Jun 30"  />
          </PanelContainer>

          {/* Active Scenarios */}
          <PanelContainer
            label="Active Scenarios"
            action={
              <button className="flex items-center gap-1 text-[11.5px] font-medium text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors">
                Manage
                <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
              </button>
            }
          >
            {[
              { name: 'Base Case',          ebitda: '$487.2M',  impact: '—',         badge: 'neutral'   },
              { name: 'Oil +20% Shock',     ebitda: '$421.6M',  impact: '−$65.6M',   badge: 'negative'  },
              { name: 'FX Bear (USD+10%)',  ebitda: '$459.3M',  impact: '−$27.9M',   badge: 'negative'  },
              { name: 'Hedged Recovery',    ebitda: '$471.0M',  impact: '+$49.4M',   badge: 'positive'  },
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
                      'font-mono text-[12px] nums-tabular w-[68px] text-right',
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

        {/* ── Row 3 — Signals / Market Snapshot ────────────────────── */}
        <div className="grid grid-cols-2 gap-5">

          {/* Risk Signals */}
          <PanelContainer
            label="Risk Signals"
            action={<span className="badge badge-negative">3 Active</span>}
          >
            <SignalRow
              label="Commodity hedge ratio below threshold"
              detail="WTI position unhedged — 32.6% of Q3 requirement"
              level="high"
              time="2h ago"
            />
            <SignalRow
              label="EUR/USD rate movement exceeds trigger"
              detail="Rate crossed −1.5% intraday threshold (currently −1.82%)"
              level="high"
              time="4h ago"
            />
            <SignalRow
              label="Counterparty credit review due"
              detail="Barclays IB — annual review overdue by 12 days"
              level="medium"
              time="1d ago"
            />
            <SignalRow
              label="Base case scenario updated"
              detail="FY2026 assumptions revised by finance team"
              level="low"
              time="2d ago"
            />
          </PanelContainer>

          {/* Market Snapshot */}
          <PanelContainer
            label="Market Snapshot"
            footer={
              <p className="text-[11px] text-[var(--text-muted)]">
                Bloomberg L.P. · Delayed 15 min · Last refresh 09:42 EST
              </p>
            }
          >
            <div className="grid grid-cols-2 gap-x-8">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[var(--text-muted)] mb-2">
                  Commodities
                </p>
                <MetricRow label="WTI Crude"      value="$82.14 / bbl"  />
                <MetricRow label="Brent Crude"    value="$85.60 / bbl"  />
                <MetricRow label="Natural Gas"    value="$2.84 / MMBtu" />
                <MetricRow label="Carbon Credits" value="€65.20 / tCO₂" />
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[var(--text-muted)] mb-2">
                  FX & Rates
                </p>
                <MetricRow label="EUR / USD"    value="1.0845" />
                <MetricRow label="GBP / USD"    value="1.2731" />
                <MetricRow label="LIBOR 3M"     value="5.320%" />
                <MetricRow label="10Y UST Yield" value="4.485%" />
              </div>
            </div>
          </PanelContainer>
        </div>

      </div>
    </DashboardShell>
  );
}
