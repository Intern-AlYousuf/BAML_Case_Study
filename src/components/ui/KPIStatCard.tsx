'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────────────── */

export type SignalDirection = 'positive' | 'negative' | 'neutral' | 'warning';
export type KPISize        = 'sm' | 'md' | 'lg';
export type KPIAccent      = 'none' | 'yellow' | 'positive' | 'negative' | 'warning' | 'neutral';

/* ─────────────────────────────────────────────────────────────────────────────
   Design maps
───────────────────────────────────────────────────────────────────────────── */

const ACCENT_BAR: Record<KPIAccent, string> = {
  none:     '',
  yellow:   'bg-[var(--accent-primary)]',
  positive: 'bg-[var(--status-positive)]',
  negative: 'bg-[var(--status-negative)]',
  warning:  'bg-[var(--status-warning)]',
  neutral:  'bg-[var(--border-strong)]',
};

const SIGNAL_DELTA: Record<SignalDirection, {
  text:   string;
  bg:     string;
  border: string;
  Icon:   React.ElementType;
}> = {
  positive: {
    text:   'text-[var(--status-positive)]',
    bg:     'bg-[var(--status-positive-dim)]',
    border: 'border-[rgba(34,197,94,0.2)]',
    Icon:   TrendingUp,
  },
  negative: {
    text:   'text-[var(--status-negative)]',
    bg:     'bg-[var(--status-negative-dim)]',
    border: 'border-[rgba(239,68,68,0.2)]',
    Icon:   TrendingDown,
  },
  warning: {
    text:   'text-[var(--status-warning)]',
    bg:     'bg-[var(--status-warning-dim)]',
    border: 'border-[rgba(245,158,11,0.2)]',
    Icon:   TrendingUp,
  },
  neutral: {
    text:   'text-[var(--text-muted)]',
    bg:     'bg-[var(--surface-overlay)]',
    border: 'border-[var(--border-base)]',
    Icon:   Minus,
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Size scale — executive-grade, premium SaaS proportions
   KPI values: 48px (md) / 52px (lg) per spec
───────────────────────────────────────────────────────────────────────────── */

const SIZE_CONFIG: Record<KPISize, {
  card:   string;
  pad:    string;
  label:  string;
  value:  string;
  unit:   string;
  delta:  string;
  period: string;
}> = {
  sm: {
    card:   'min-h-[120px]',
    pad:    'px-5 pt-6 pb-5',
    label:  'text-[11px] tracking-[0.12em]',
    value:  'text-[2rem]',        /* 32px */
    unit:   'text-[1.125rem]',
    delta:  'text-[11.5px]',
    period: 'text-[11px]',
  },
  md: {
    card:   'min-h-[158px]',
    pad:    'px-6 pt-6 pb-5',
    label:  'text-[12px] tracking-[0.12em]',
    value:  'text-[3rem]',        /* 48px */
    unit:   'text-[1.375rem]',
    delta:  'text-[12.5px]',
    period: 'text-[11.5px]',
  },
  lg: {
    card:   'min-h-[172px]',
    pad:    'px-7 pt-7 pb-6',
    label:  'text-[12px] tracking-[0.12em]',
    value:  'text-[3.25rem]',     /* 52px */
    unit:   'text-[1.5625rem]',
    delta:  'text-[13px]',
    period: 'text-[12px]',
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Props
───────────────────────────────────────────────────────────────────────────── */

export interface KPIStatCardProps {
  label: string;
  value: string;
  unit?: string;
  unitPosition?: 'prefix' | 'suffix';
  delta?: string;
  deltaLabel?: string;
  signal?: SignalDirection;
  size?: KPISize;
  accent?: KPIAccent;
  /** Featured / hero card — yellow surface + yellow value text */
  featured?: boolean;
  loading?: boolean;
  action?: React.ReactNode;
  sparkline?: React.ReactNode;
  subtext?: string;
  className?: string;
  onClick?: () => void;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────────────────── */

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
  featured = false,
  loading = false,
  action,
  sparkline,
  subtext,
  className,
  onClick,
}: KPIStatCardProps) {
  const sz    = SIZE_CONFIG[size];
  const dConf = SIGNAL_DELTA[signal];
  const isInteractive = !!onClick;

  return (
    <motion.div
      whileHover={isInteractive ? { y: -2, scale: 1.005 } : undefined}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={cn(
        'group relative flex flex-col overflow-hidden',
        'rounded-[var(--radius-card)] border transition-all duration-150',
        sz.card,
        featured
          ? 'bg-[rgba(245,217,10,0.06)] border-[rgba(245,217,10,0.20)] hover:border-[rgba(245,217,10,0.32)]'
          : 'bg-[var(--surface-elevated)] border-[var(--border-base)] hover:bg-[var(--surface-overlay)] hover:border-[var(--border-strong)]',
        isInteractive && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => e.key === 'Enter' && onClick?.() : undefined}
    >
      {/* Top accent bar */}
      {accent !== 'none' && (
        <div className={cn('absolute inset-x-0 top-0 h-[2px]', ACCENT_BAR[accent])} />
      )}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn('flex flex-col gap-3', sz.pad)}
          >
            <div className="skeleton h-3 w-1/3 rounded" />
            <div className="skeleton h-12 w-2/3 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn('flex h-full flex-col', sz.pad)}
          >

            {/* Label row */}
            <div className="flex items-start justify-between gap-2">
              <span className={cn(
                'font-semibold uppercase leading-none',
                sz.label,
                featured ? 'text-[var(--accent-muted)]' : 'text-[var(--text-muted)]',
              )}>
                {label}
              </span>
              {action && (
                <div className="shrink-0 -mt-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  {action}
                </div>
              )}
            </div>

            {/* Value row */}
            <div className="mt-auto flex items-baseline gap-1.5 pt-4">
              {unit && unitPosition === 'prefix' && (
                <span className={cn(
                  'font-mono font-medium leading-none nums-tabular',
                  sz.unit,
                  featured ? 'text-[var(--accent-secondary)]' : 'text-[var(--text-secondary)]',
                )}>
                  {unit}
                </span>
              )}

              <AnimatePresence mode="wait">
                <motion.span
                  key={value}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
                  className={cn(
                    'font-mono font-bold leading-none nums-tabular tracking-tight',
                    sz.value,
                    featured ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]',
                  )}
                >
                  {value}
                </motion.span>
              </AnimatePresence>

              {unit && unitPosition === 'suffix' && (
                <span className={cn(
                  'font-mono font-medium leading-none nums-tabular',
                  sz.unit,
                  featured ? 'text-[var(--accent-secondary)]' : 'text-[var(--text-secondary)]',
                )}>
                  {unit}
                </span>
              )}
            </div>

            {/* Delta row */}
            <div className="mt-3.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              {delta && (
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5',
                  'font-mono font-semibold nums-tabular leading-none',
                  sz.delta,
                  dConf.text, dConf.bg, dConf.border,
                )}>
                  <dConf.Icon className="h-[11px] w-[11px] shrink-0" strokeWidth={2.5} />
                  {delta}
                </span>
              )}
              {deltaLabel && (
                <span className={cn('leading-none', sz.period, 'text-[var(--text-muted)]')}>
                  {deltaLabel}
                </span>
              )}
              {subtext && !delta && !deltaLabel && (
                <span className={cn('leading-none', sz.period, 'text-[var(--text-muted)]')}>
                  {subtext}
                </span>
              )}
            </div>

            {/* Sparkline slot */}
            {sparkline && <div className="mt-4 -mx-1">{sparkline}</div>}
          </motion.div>
        )}
      </AnimatePresence>

      {isInteractive && (
        <span
          className="pointer-events-none absolute inset-0 rounded-[var(--radius-card)] opacity-0 ring-2 ring-[var(--accent-primary)] transition-opacity duration-150 focus-visible:opacity-100"
          aria-hidden
        />
      )}
    </motion.div>
  );
}
