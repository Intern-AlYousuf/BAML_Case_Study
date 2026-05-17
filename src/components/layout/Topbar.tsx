'use client';

import { RefreshCw, Bell, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketTickerProps {
  label: string;
  value: string;
  delta: string;
  trend: 'positive' | 'negative' | 'neutral';
}

function MarketTicker({ label, value, delta, trend }: MarketTickerProps) {
  const deltaColor =
    trend === 'positive' ? 'text-[var(--status-positive)]' :
    trend === 'negative' ? 'text-[var(--status-negative)]' :
                           'text-[var(--text-muted)]';
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
        {label}
      </span>
      <span className="font-mono text-[14.5px] font-medium nums-tabular text-[var(--text-primary)]">
        {value}
      </span>
      <span className={cn('font-mono text-[12.5px] font-medium nums-tabular', deltaColor)}>
        {delta}
      </span>
    </div>
  );
}

interface TopbarProps {
  breadcrumb?: string[];
  title?: string;
}

export function Topbar({ breadcrumb, title }: TopbarProps) {
  return (
    <header
      className="fixed top-0 left-[280px] right-0 z-[200] flex items-center justify-between px-10"
      style={{
        height: '80px',
        backgroundColor: 'var(--surface-panel)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >

      {/* ── Left — breadcrumb / page title ─────────────────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        {breadcrumb && breadcrumb.length > 0 ? (
          breadcrumb.map((crumb, i) => (
            <div key={crumb} className="flex items-center gap-3">
              {i > 0 && (
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-muted)]" strokeWidth={1.5} />
              )}
              <span
                className={cn(
                  'leading-none',
                  i === breadcrumb.length - 1
                    ? 'text-[17px] font-semibold text-[var(--text-primary)]'
                    : 'text-[17px] font-normal text-[var(--text-muted)]',
                )}
              >
                {crumb}
              </span>
            </div>
          ))
        ) : (
          <span className="text-[17px] font-semibold text-[var(--text-primary)] leading-none">
            {title ?? 'Overview'}
          </span>
        )}
      </div>

      {/* ── Right — tickers + actions ───────────────────────────────── */}
      <div className="flex items-center gap-7 shrink-0">

        {/* Market tickers */}
        <div className="hidden xl:flex items-center gap-7">
          <MarketTicker label="WTI"      value="$82.14"  delta="+0.42%"  trend="positive" />
          <MarketTicker label="EUR/USD"  value="1.0845"  delta="−0.12%"  trend="negative" />
          <MarketTicker label="LIBOR 3M" value="5.32%"   delta="0.00%"   trend="neutral"  />
          <MarketTicker label="Brent"    value="$85.60"  delta="+0.28%"  trend="positive" />
        </div>

        <div className="hidden xl:block h-5 w-px bg-[var(--border-strong)]" />

        {/* Live feed status */}
        <button className="flex items-center gap-2 text-[14px] font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors duration-150 select-none">
          <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
          <span>Live</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-positive)] animate-pulse" />
        </button>

        <div className="h-5 w-px bg-[var(--border-strong)]" />

        {/* Notification bell */}
        <button className="relative p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150">
          <Bell className="h-5 w-5" strokeWidth={1.75} />
          <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full border-[1.5px] border-[var(--surface-panel)] bg-[var(--accent-primary)]" />
        </button>
      </div>
    </header>
  );
}
