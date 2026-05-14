import { DashboardShell } from '@/components/layout/DashboardShell';
import { PanelContainer } from '@/components/ui/PanelContainer';
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, Shield, BarChart3, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────────────────────
   KPI Stat Card — institutional metric tile
───────────────────────────────────────────────────────────────────────────── */
interface KPIStat {
  label: string;
  value: string;
  delta: string;
  deltaLabel: string;
  trend: 'positive' | 'negative' | 'neutral';
  unit?: string;
}

function KPIStatCard({ label, value, delta, deltaLabel, trend, unit }: KPIStat) {
  const DeltaIcon =
    trend === 'positive' ? ArrowUpRight :
    trend === 'negative' ? ArrowDownRight :
    Minus;

  const deltaColor =
    trend === 'positive' ? 'text-[var(--status-positive)]' :
    trend === 'negative' ? 'text-[var(--status-negative)]' :
    'text-[var(--text-muted)]';

  return (
    <PanelContainer className="min-h-[110px]">
      <div className="flex flex-col justify-between h-full">
        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[var(--text-muted)]">
          {label}
        </p>
        <div>
          <div className="flex items-baseline gap-1 mt-2">
            {unit && (
              <span className="font-mono text-[15px] font-medium text-[var(--text-muted)]">{unit}</span>
            )}
            <span className="font-mono text-[28px] font-bold text-[var(--text-primary)] leading-none nums-tabular tracking-tight">
              {value}
            </span>
          </div>
          <div className={cn('flex items-center gap-1 mt-2', deltaColor)}>
            <DeltaIcon className="w-[13px] h-[13px] shrink-0" strokeWidth={2} />
            <span className="font-mono text-[11px] font-semibold nums-tabular">{delta}</span>
            <span className="text-[11px] text-[var(--text-muted)] font-normal">{deltaLabel}</span>
          </div>
        </div>
      </div>
    </PanelContainer>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Metric Row — compact label / value pair
───────────────────────────────────────────────────────────────────────────── */
function MetricRow({
  label,
  value,
  valueClass,
  border = true,
}: {
  label: string;
  value: string;
  valueClass?: string;
  border?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between py-[9px]',
        border && 'border-b border-[var(--border-subtle)] last:border-b-0'
      )}
    >
      <span className="text-[12px] text-[var(--text-secondary)]">{label}</span>
      <span className={cn('font-mono text-[12px] font-medium nums-tabular text-[var(--text-primary)]', valueClass)}>
        {value}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Signal Badge — risk alert row
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
    <div className="flex items-start gap-3 py-[9px] border-b border-[var(--border-subtle)] last:border-b-0">
      <span
        className={cn(
          'mt-[1px] shrink-0 inline-flex items-center px-[5px] py-[2px] rounded-[2px] text-[9px] font-bold tracking-[0.1em] uppercase border',
          levelStyle[level]
        )}
      >
        {level}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-[var(--text-primary)] leading-snug">{label}</p>
        <p className="text-[11px] text-[var(--text-muted)] mt-[2px] leading-snug truncate">{detail}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0 text-[var(--text-muted)]">
        <Clock className="w-3 h-3" strokeWidth={1.5} />
        <span className="text-[10px]">{time}</span>
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
      <div className="p-5 space-y-4 max-w-[1600px]">

        {/* ── Page header ────────────────────────────────────────────── */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[18px] font-bold tracking-tight text-[var(--text-primary)]">
              Risk Dashboard
            </h1>
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
              As of 14 May 2026 · FY2026 Q2 · Consolidated view
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary btn-sm">Export</button>
            <button className="btn btn-primary btn-sm flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" />
              Run Scenario
            </button>
          </div>
        </div>

        {/* ── Row 1 — KPI tiles ──────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3">
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
        <div className="grid grid-cols-3 gap-3">

          {/* Risk Summary */}
          <PanelContainer
            label="Risk Summary"
            accent="negative"
            action={
              <button className="text-[10px] font-semibold tracking-widest uppercase text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors">
                Details →
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
            label="Hedge Portfolio Status"
            accent="yellow"
            action={
              <span className="badge badge-positive">Active</span>
            }
          >
            <MetricRow label="Total Notional Hedged"    value="$231.4M" />
            <MetricRow label="Mark-to-Market P&L"       value="+$6.8M"  valueClass="text-[var(--status-positive)]" />
            <MetricRow label="Average Hedge Duration"   value="8.4 mo"  />
            <MetricRow label="Instruments (Active)"     value="14"      />
            <MetricRow label="Next Maturity"            value="Jun 30"  />
          </PanelContainer>

          {/* Active Scenarios */}
          <PanelContainer
            label="Active Scenarios"
            action={
              <button className="text-[10px] font-semibold tracking-widest uppercase text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors">
                Manage →
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
                className="flex items-center justify-between py-[9px] border-b border-[var(--border-subtle)] last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full shrink-0',
                      s.badge === 'positive' ? 'bg-[var(--status-positive)]' :
                      s.badge === 'negative' ? 'bg-[var(--status-negative)]' :
                      'bg-[var(--text-muted)]'
                    )}
                  />
                  <span className="text-[12px] text-[var(--text-primary)]">{s.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[12px] text-[var(--text-primary)] nums-tabular">{s.ebitda}</span>
                  <span
                    className={cn(
                      'font-mono text-[11px] nums-tabular w-[64px] text-right',
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
        <div className="grid grid-cols-2 gap-3">

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
              <p className="text-[10px] text-[var(--text-muted)]">
                Data sourced from Bloomberg L.P. · Delayed 15 min · Last refresh 09:42 EST
              </p>
            }
          >
            <div className="grid grid-cols-2 gap-x-8">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[var(--text-muted)] mb-1.5">
                  Commodities
                </p>
                <MetricRow label="WTI Crude"       value="$82.14 / bbl" />
                <MetricRow label="Brent Crude"     value="$85.60 / bbl" />
                <MetricRow label="Natural Gas"     value="$2.84 / MMBtu" />
                <MetricRow label="Carbon Credits"  value="€65.20 / tCO₂" />
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[var(--text-muted)] mb-1.5">
                  FX & Rates
                </p>
                <MetricRow label="EUR / USD"       value="1.0845" />
                <MetricRow label="GBP / USD"       value="1.2731" />
                <MetricRow label="LIBOR 3M"        value="5.320%" />
                <MetricRow label="10Y UST Yield"   value="4.485%" />
              </div>
            </div>
          </PanelContainer>
        </div>

      </div>
    </DashboardShell>
  );
}
