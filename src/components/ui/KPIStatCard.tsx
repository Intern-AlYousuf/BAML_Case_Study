'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

export type SignalDirection = 'positive' | 'negative' | 'neutral' | 'warning';
export type KPISize = 'sm' | 'md' | 'lg';
export type KPIAccent = 'none' | 'yellow' | 'positive' | 'negative' | 'warning' | 'neutral';

// ── Accent border map ─────────────────────────────────────────────────────────

const ACCENT_BORDER: Record<KPIAccent, string> = {
  none:     '',
  yellow:   'border-l-2 border-l-[var(--accent-primary)]',
  positive: 'border-l-2 border-l-[var(--status-positive)]',
  negative: 'border-l-2 border-l-[var(--status-negative)]',
  warning:  'border-l-2 border-l-[var(--status-warning)]',
  neutral:  'border-l-2 border-l-[var(--status-neutral)]',
};

// ── Size scale ────────────────────────────────────────────────────────────────

const SIZE_CONFIG: Record<KPISize, {
  card:    string;
  label:   string;
  value:   string;
  unit:    string;
  delta:   string;
  period:  string;
  padding: string;
}> = {
  sm: {
    card:    'min-h-[96px]',
    label:   'text-[10px] tracking-[0.12em]',
    value:   'text-[1.5rem] leading-none',
    unit:    'text-[0.8rem]',
    delta:   'text-[11px]',
    period:  'text-[10px]',
    padding: 'p-3',
  },
  md: {
    card:    'min-h-[120px]',
    label:   'text-[10px] tracking-[0.12em]',
    value:   'text-[2rem] leading-none',
    unit:    'text-[1rem]',
    delta:   'text-[12px]',
    period:  'text-[11px]',
    padding: 'p-4',
  },
  lg: {
    card:    'min-h-[148px]',
    label:   'text-[11px] tracking-[0.12em]',
    value:   'text-[2.5rem] leading-none',
    unit:    'text-[1.2rem]',
    delta:   'text-[13px]',
    period:  'text-[11px]',
    padding: 'p-5',
  },
};

// ── Delta direction config ────────────────────────────────────────────────────

const DELTA_CONFIG: Record<SignalDirection, {
  color:    string;
  bgColor:  string;
  Icon:     React.ElementType;
}> = {
  positive: {
    color:   'text-[var(--status-positive)]',
    bgColor: 'bg-[var(--status-positive-dim)]',
    Icon:    TrendingUp,
  },
  negative: {
    color:   'text-[var(--status-negative)]',
    bgColor: 'bg-[var(--status-negative-dim)]',
    Icon:    TrendingDown,
  },
  warning: {
    color:   'text-[var(--status-warning)]',
    bgColor: 'bg-[var(--status-warning-dim)]',
    Icon:    TrendingUp,
  },
  neutral: {
    color:   'text-[var(--text-muted)]',
    bgColor: 'bg-[var(--surface-overlay)]',
    Icon:    Minus,
  },
};

// ── Props ─────────────────────────────────────────────────────────────────────

export interface KPIStatCardProps {
  /** Uppercase metric label */
  label: string;
  /** Primary display value — use formatted string for full control */
  value: string;
  /** Currency symbol, unit, or prefix (e.g. "$", "€") */
  unit?: string;
  /** Position of the unit symbol */
  unitPosition?: 'prefix' | 'suffix';
  /** Change value — e.g. "+2.34%" or "−$4.2M" */
  delta?: string;
  /** Period context for the delta — e.g. "vs prior day", "MTD", "YTD" */
  deltaLabel?: string;
  /** Semantic direction of the change */
  signal?: SignalDirection;
  /** Card size preset */
  size?: KPISize;
  /** Left accent border color */
  accent?: KPIAccent;
  /** Show skeleton loading state */
  loading?: boolean;
  /** Right-side action slot (icon buttons, context menus) */
  action?: React.ReactNode;
  /** Sparkline / mini chart slot — renders below the value row */
  sparkline?: React.ReactNode;
  /** Secondary context line below the delta */
  subtext?: string;
  className?: string;
  /** Callback when card is clicked */
  onClick?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function KPIStatCard({
  label,
  value,
  unit,
  unitPosition = 'prefix',
  delta,
  deltaLabel,
  signal = 'neutral',
  size = 'md',
  accent = 'none',
  loading = false,
  action,
  sparkline,
  subtext,
  className,
  onClick,
}: KPIStatCardProps) {
  const sz = SIZE_CONFIG[size];
  const deltaConf = DELTA_CONFIG[signal];
  const isInteractive = !!onClick;

  return (
    <div
      className={cn(
        'relative flex flex-col bg-[var(--surface-secondary)]',
        'border border-[var(--border-base)] rounded-[var(--radius-lg)]',
        'overflow-hidden transition-colors duration-100',
        sz.card,
        ACCENT_BORDER[accent],
        isInteractive && 'cursor-pointer hover:bg-[var(--surface-overlay)] hover:border-[var(--border-strong)]',
        className
      )}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => e.key === 'Enter' && onClick?.() : undefined}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn('flex flex-col gap-3', sz.padding)}
          >
            <div className="skeleton h-2.5 w-1/3 rounded-sm" />
            <div className="skeleton h-8 w-2/3 rounded-sm" />
            <div className="skeleton h-2.5 w-1/2 rounded-sm" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn('flex flex-col h-full', sz.padding)}
          >
            {/* ── Header row: label + action ─────────────────────── */}
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <span
                className={cn(
                  'font-semibold uppercase tracking-widest text-[var(--text-muted)] leading-none',
                  sz.label
                )}
              >
                {label}
              </span>
              {action && (
                <div className="shrink-0 -mt-0.5">{action}</div>
              )}
            </div>

            {/* ── Value row ──────────────────────────────────────── */}
            <div className="flex items-baseline gap-1 mb-2">
              {unit && unitPosition === 'prefix' && (
                <span
                  className={cn(
                    'font-mono font-semibold text-[var(--text-secondary)] leading-none',
                    sz.unit
                  )}
                >
                  {unit}
                </span>
              )}
              <span
                className={cn(
                  'font-mono font-bold text-[var(--text-primary)] nums-tabular tracking-tight leading-none',
                  sz.value
                )}
              >
                {value}
              </span>
              {unit && unitPosition === 'suffix' && (
                <span
                  className={cn(
                    'font-mono font-semibold text-[var(--text-secondary)] leading-none',
                    sz.unit
                  )}
                >
                  {unit}
                </span>
              )}
            </div>

            {/* ── Delta + period row ─────────────────────────────── */}
            {(delta || deltaLabel || subtext) && (
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-auto">
                {delta && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 font-mono font-semibold nums-tabular leading-none',
                      sz.delta,
                      deltaConf.color
                    )}
                  >
                    <deltaConf.Icon
                      className="w-3 h-3 shrink-0"
                      strokeWidth={2.5}
                    />
                    {delta}
                  </span>
                )}
                {deltaLabel && (
                  <span
                    className={cn(
                      'text-[var(--text-muted)] leading-none',
                      sz.period
                    )}
                  >
                    {deltaLabel}
                  </span>
                )}
                {subtext && !delta && !deltaLabel && (
                  <span
                    className={cn(
                      'text-[var(--text-muted)] leading-none',
                      sz.period
                    )}
                  >
                    {subtext}
                  </span>
                )}
              </div>
            )}

            {/* ── Sparkline slot ─────────────────────────────────── */}
            {sparkline && (
              <div className="mt-3 -mx-1">{sparkline}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Yellow focus ring on keyboard navigation ────────────── */}
      {isInteractive && (
        <span className="absolute inset-0 rounded-[var(--radius-lg)] pointer-events-none focus-visible:ring-accent" />
      )}
    </div>
  );
}
