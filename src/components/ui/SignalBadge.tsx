import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Info, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Variant definitions ───────────────────────────────────────────────────────

const signalBadgeVariants = cva(
  [
    'inline-flex items-center justify-center gap-1',
    'font-semibold leading-none whitespace-nowrap',
    'border transition-colors duration-100',
  ],
  {
    variants: {
      variant: {
        positive: [
          'bg-[var(--status-positive-dim)] text-[var(--status-positive)]',
          'border-[rgba(34,197,94,0.2)]',
        ],
        negative: [
          'bg-[var(--status-negative-dim)] text-[var(--status-negative)]',
          'border-[rgba(239,68,68,0.2)]',
        ],
        warning: [
          'bg-[var(--status-warning-dim)] text-[var(--status-warning)]',
          'border-[rgba(245,158,11,0.2)]',
        ],
        neutral: [
          'bg-[var(--status-neutral-dim)] text-[var(--status-neutral)]',
          'border-[rgba(59,130,246,0.2)]',
        ],
        accent: [
          'bg-[var(--accent-dim)] text-[var(--accent-primary)]',
          'border-[rgba(255,230,0,0.2)]',
        ],
        muted: [
          'bg-[var(--surface-elevated)] text-[var(--text-muted)]',
          'border-[var(--border-base)]',
        ],
      },
      size: {
        xs: 'text-[9px] tracking-[0.1em] px-[5px] py-[2px] rounded-[2px]',
        sm: 'text-[10px] tracking-[0.1em] px-[6px] py-[3px] rounded-[3px]',
        md: 'text-[11px] tracking-[0.08em] px-2 py-1 rounded-[3px]',
      },
    },
    defaultVariants: {
      variant: 'muted',
      size:    'sm',
    },
  }
);

// ── Types ─────────────────────────────────────────────────────────────────────

export type SignalVariant = 'positive' | 'negative' | 'warning' | 'neutral' | 'accent' | 'muted';
export type BadgeSize = 'xs' | 'sm' | 'md';
export type TrendArrow = 'up' | 'down' | 'none';

// ── Arrow icon map ────────────────────────────────────────────────────────────

const ARROW_ICON: Record<TrendArrow, React.ElementType | null> = {
  up:   TrendingUp,
  down: TrendingDown,
  none: null,
};

// ── Default icon per variant ──────────────────────────────────────────────────

const DEFAULT_ICON: Record<SignalVariant, React.ElementType | null> = {
  positive: null,
  negative: null,
  warning:  AlertTriangle,
  neutral:  null,
  accent:   Zap,
  muted:    null,
};

// ── Props ─────────────────────────────────────────────────────────────────────

export interface SignalBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof signalBadgeVariants> {
  /** Badge label text */
  label?: string;
  /** Trend arrow direction */
  arrow?: TrendArrow;
  /**
   * Show only a colored dot (no text).
   * Use for compact table cells or legend markers.
   */
  dot?: boolean;
  /**
   * Animate a pulsing ring — for live / streaming signals.
   */
  pulse?: boolean;
  /** Override the automatic icon */
  icon?: React.ReactNode;
  /** Hide any icon (overrides arrow and variant default) */
  noIcon?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SignalBadge({
  label,
  variant = 'muted',
  size = 'sm',
  arrow = 'none',
  dot = false,
  pulse = false,
  icon,
  noIcon = false,
  children,
  className,
  ...rest
}: SignalBadgeProps) {

  // Dot-only mode
  if (dot) {
    return (
      <SignalDot
        variant={variant as SignalVariant}
        pulse={pulse}
        size={size as BadgeSize}
        className={className}
        {...rest}
      />
    );
  }

  const ArrowIcon = arrow !== 'none' ? ARROW_ICON[arrow] : null;
  const DefaultIcon = DEFAULT_ICON[variant as SignalVariant];
  const ResolvedIcon = icon ? null : ArrowIcon ?? DefaultIcon;
  const iconStrokeWidth = size === 'md' ? 2.5 : 2;
  const iconSize = size === 'xs' ? 'w-2.5 h-2.5' : size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';
  const content = label ?? children;

  return (
    <span
      className={cn(
        signalBadgeVariants({ variant, size }),
        'uppercase',
        className
      )}
      {...rest}
    >
      {/* Pulse indicator */}
      {pulse && (
        <span className={cn('relative flex shrink-0', size === 'xs' ? 'w-1.5 h-1.5' : 'w-2 h-2')}>
          <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-60', PING_COLOR[variant as SignalVariant])} />
          <span className={cn('relative inline-flex rounded-full h-full w-full', DOT_COLOR[variant as SignalVariant])} />
        </span>
      )}

      {/* Icon — arrow or default variant icon */}
      {!noIcon && !icon && ResolvedIcon && (
        <ResolvedIcon
          className={cn('shrink-0', iconSize)}
          strokeWidth={iconStrokeWidth}
          aria-hidden="true"
        />
      )}

      {/* Custom icon slot */}
      {!noIcon && icon && (
        <span className={cn('shrink-0', iconSize)} aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Label */}
      {content && <span>{content}</span>}
    </span>
  );
}

// ── SignalDot ─────────────────────────────────────────────────────────────────
// Standalone colored dot — used in table cells, legend markers, status rows.

const DOT_COLOR: Record<SignalVariant, string> = {
  positive: 'bg-[var(--status-positive)]',
  negative: 'bg-[var(--status-negative)]',
  warning:  'bg-[var(--status-warning)]',
  neutral:  'bg-[var(--status-neutral)]',
  accent:   'bg-[var(--accent-primary)]',
  muted:    'bg-[var(--text-muted)]',
};

const PING_COLOR: Record<SignalVariant, string> = {
  positive: 'bg-[var(--status-positive)]',
  negative: 'bg-[var(--status-negative)]',
  warning:  'bg-[var(--status-warning)]',
  neutral:  'bg-[var(--status-neutral)]',
  accent:   'bg-[var(--accent-primary)]',
  muted:    'bg-[var(--text-muted)]',
};

const DOT_SIZE: Record<BadgeSize, string> = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
};

interface SignalDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: SignalVariant;
  pulse?: boolean;
  size?: BadgeSize;
}

export function SignalDot({
  variant = 'muted',
  pulse = false,
  size = 'sm',
  className,
  ...rest
}: SignalDotProps) {
  return (
    <span
      className={cn('relative inline-flex shrink-0', DOT_SIZE[size], className)}
      aria-hidden="true"
      {...rest}
    >
      {pulse && (
        <span
          className={cn(
            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-60',
            PING_COLOR[variant]
          )}
        />
      )}
      <span
        className={cn(
          'relative inline-flex rounded-full h-full w-full',
          DOT_COLOR[variant]
        )}
      />
    </span>
  );
}

// ── LiveBadge ─────────────────────────────────────────────────────────────────
// Pre-composed "LIVE" badge with pulsing dot — for feed status indicators.

export interface LiveBadgeProps
  extends Omit<SignalBadgeProps, 'label' | 'pulse' | 'dot' | 'arrow'> {
  label?: string;
  isLive?: boolean;
}

export function LiveBadge({
  label = 'Live',
  isLive = true,
  variant,
  size = 'sm',
  className,
  ...rest
}: LiveBadgeProps) {
  return (
    <SignalBadge
      variant={isLive ? 'positive' : 'muted'}
      size={size}
      pulse={isLive}
      noIcon
      label={label}
      className={className}
      {...rest}
    />
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
// Maps domain status strings to the correct visual variant.

type DomainStatus =
  | 'active' | 'live'
  | 'hedged' | 'covered'
  | 'at risk' | 'breach' | 'failed'
  | 'warning' | 'near breach'
  | 'pending' | 'draft' | 'inactive'
  | 'archived';

const STATUS_VARIANT: Record<DomainStatus, SignalVariant> = {
  'active':       'positive',
  'live':         'positive',
  'hedged':       'positive',
  'covered':      'positive',
  'at risk':      'negative',
  'breach':       'negative',
  'failed':       'negative',
  'warning':      'warning',
  'near breach':  'warning',
  'pending':      'neutral',
  'draft':        'muted',
  'inactive':     'muted',
  'archived':     'muted',
};

export interface StatusBadgeProps
  extends Omit<SignalBadgeProps, 'variant' | 'label'> {
  status: DomainStatus | string;
}

export function StatusBadge({ status, size = 'sm', className, ...rest }: StatusBadgeProps) {
  const variant = STATUS_VARIANT[status.toLowerCase() as DomainStatus] ?? 'muted';
  return (
    <SignalBadge
      variant={variant}
      size={size}
      label={status.toUpperCase()}
      noIcon
      className={className}
      {...rest}
    />
  );
}
