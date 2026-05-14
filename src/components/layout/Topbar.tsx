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
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[var(--text-muted)]">
        {label}
      </span>
      <span className="font-mono text-[13px] font-medium text-[var(--text-primary)] nums-tabular">
        {value}
      </span>
      <span className={cn('font-mono text-[11.5px] font-medium nums-tabular', deltaColor)}>
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
    <header className="fixed top-0 left-[260px] right-0 h-14 bg-[var(--surface-panel)] border-b border-[var(--border-subtle)] flex items-center justify-between px-6 z-[200]">

      {/* ── Left — breadcrumb / page title ─────────────────────────── */}
      <div className="flex items-center gap-2 min-w-0">
        {breadcrumb && breadcrumb.length > 0 ? (
          breadcrumb.map((crumb, i) => (
            <div key={crumb} className="flex items-center gap-2">
              {i > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" strokeWidth={1.5} />
              )}
              <span
                className={cn(
                  'leading-none',
                  i === breadcrumb.length - 1
                    ? 'text-[14px] font-semibold text-[var(--text-primary)]'
                    : 'text-[14px] font-normal text-[var(--text-muted)]'
                )}
              >
                {crumb}
              </span>
            </div>
          ))
        ) : (
          <span className="text-[14px] font-semibold text-[var(--text-primary)] leading-none">
            {title ?? 'Overview'}
          </span>
        )}
      </div>

      {/* ── Right — market tickers + actions ───────────────────────── */}
      <div className="flex items-center gap-5 shrink-0">

        {/* Market tickers */}
        <div className="hidden xl:flex items-center gap-5">
          <MarketTicker label="WTI"      value="$82.14"  delta="+0.42%"  trend="positive" />
          <MarketTicker label="EUR/USD"  value="1.0845"  delta="−0.12%"  trend="negative" />
          <MarketTicker label="LIBOR 3M" value="5.32%"   delta="0.00%"   trend="neutral"  />
          <MarketTicker label="Brent"    value="$85.60"  delta="+0.28%"  trend="positive" />
        </div>

        <div className="hidden xl:block w-px h-5 bg-[var(--border-base)]" />

        {/* Live feed status */}
        <button className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors duration-100 select-none">
          <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span className="tracking-wide">Live</span>
          <span className="w-1.5 h-1.5 bg-[var(--status-positive)] rounded-full animate-pulse" />
        </button>

        <div className="w-px h-5 bg-[var(--border-base)]" />

        {/* Notifications */}
        <button className="relative text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-100 p-0.5">
          <Bell className="w-[16px] h-[16px]" strokeWidth={1.75} />
          <span className="absolute -top-[1px] -right-[1px] w-[7px] h-[7px] bg-[var(--accent-primary)] rounded-full border-[1.5px] border-[var(--surface-panel)]" />
        </button>
      </div>
    </header>
  );
}
