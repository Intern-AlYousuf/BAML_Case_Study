import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ── Variants ──────────────────────────────────────────────────────────────────

const sectionHeaderVariants = cva('flex items-start justify-between gap-4', {
  variants: {
    size: {
      sm: '',
      md: '',
      lg: '',
    },
    layout: {
      /** Title and subtitle stacked; action floats right */
      stacked:  'flex-row',
      /** Single-line title and action on the same row */
      inline:   'flex-row items-center',
      /** Full-width with divider line below */
      divided:  'flex-row pb-3 border-b border-[var(--border-base)]',
    },
  },
  defaultVariants: {
    size:   'md',
    layout: 'stacked',
  },
});

// ── Size maps ─────────────────────────────────────────────────────────────────

const TITLE_SIZE: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'text-[13px] font-semibold tracking-tight',
  md: 'text-[15px] font-semibold tracking-tight',
  lg: 'text-[18px] font-semibold tracking-tight',
};

const SUBTITLE_SIZE: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'text-[11px]',
  md: 'text-[12px]',
  lg: 'text-[13px]',
};

// ── Props ─────────────────────────────────────────────────────────────────────

export interface SectionHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sectionHeaderVariants> {
  title: string;
  /** Supporting description line */
  subtitle?: string;
  /** Pill count badge — e.g. "12 scenarios" */
  count?: number | string;
  /** Right-side slot: filter controls, action buttons */
  action?: React.ReactNode;
  /**
   * Yellow left-accent decoration style.
   * - 'line'  — 2px yellow left border (panel-style)
   * - 'dot'   — yellow bullet dot before the title
   * - 'none'  — no accent (default)
   */
  accent?: 'line' | 'dot' | 'none';
  /** Whether the section is collapsible (renders indicator only — wiring is external) */
  collapsible?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SectionHeader({
  title,
  subtitle,
  count,
  action,
  accent = 'none',
  size = 'md',
  layout = 'stacked',
  collapsible = false,
  className,
  ...rest
}: SectionHeaderProps) {
  return (
    <div
      className={cn(sectionHeaderVariants({ size, layout }), className)}
      {...rest}
    >
      {/* ── Title block ───────────────────────────────────────────── */}
      <div
        className={cn(
          'flex flex-col min-w-0',
          accent === 'line' && 'pl-3 border-l-2 border-l-[var(--accent-primary)]'
        )}
      >
        <div className="flex items-center gap-2">
          {/* Dot accent */}
          {accent === 'dot' && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shrink-0"
              aria-hidden="true"
            />
          )}

          {/* Title */}
          <span
            className={cn(
              'text-[var(--text-primary)] leading-tight truncate',
              TITLE_SIZE[size ?? 'md']
            )}
          >
            {title}
          </span>

          {/* Count badge */}
          {count !== undefined && (
            <CountBadge count={count} />
          )}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <span
            className={cn(
              'text-[var(--text-muted)] leading-snug mt-0.5',
              SUBTITLE_SIZE[size ?? 'md'],
              accent === 'dot' && 'ml-3.5'
            )}
          >
            {subtitle}
          </span>
        )}
      </div>

      {/* ── Right action slot ──────────────────────────────────────── */}
      {action && (
        <div className="shrink-0 flex items-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
}

// ── CountBadge ────────────────────────────────────────────────────────────────

interface CountBadgeProps {
  count: number | string;
}

function CountBadge({ count }: CountBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        'min-w-[20px] h-5 px-1.5',
        'rounded-[var(--radius-sm)]',
        'bg-[var(--surface-elevated)] border border-[var(--border-base)]',
        'text-[10px] font-semibold font-mono tracking-wider text-[var(--text-muted)]',
        'leading-none shrink-0'
      )}
    >
      {count}
    </span>
  );
}

// ── PageSectionDivider ────────────────────────────────────────────────────────
// Full-width section separator used between major page blocks.

export interface PageSectionDividerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  /** Extra vertical spacing variant */
  spacing?: 'sm' | 'md' | 'lg';
}

const DIVIDER_SPACING: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'my-4',
  md: 'my-6',
  lg: 'my-8',
};

export function PageSectionDivider({
  label,
  spacing = 'md',
  className,
  ...rest
}: PageSectionDividerProps) {
  if (!label) {
    return (
      <div
        className={cn(
          'w-full h-px bg-[var(--border-base)]',
          DIVIDER_SPACING[spacing],
          className
        )}
        aria-hidden="true"
        {...rest}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3',
        DIVIDER_SPACING[spacing],
        className
      )}
      {...rest}
    >
      <div className="h-px flex-1 bg-[var(--border-base)]" aria-hidden="true" />
      <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--text-muted)] shrink-0">
        {label}
      </span>
      <div className="h-px flex-1 bg-[var(--border-base)]" aria-hidden="true" />
    </div>
  );
}
