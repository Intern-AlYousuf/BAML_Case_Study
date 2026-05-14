import * as React from 'react';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

export type GridCols = 1 | 2 | 3 | 4 | 6;
export type GridGap  = 'none' | 'hairline' | 'sm' | 'md' | 'lg';

// ── Column class map ──────────────────────────────────────────────────────────
// Explicit strings required — Tailwind's JIT purges dynamic class construction.

const COL_CLASS: Record<GridCols, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
};

const RESPONSIVE_COL: Record<GridCols, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
};

const GAP_CLASS: Record<GridGap, string> = {
  none:     'gap-0',
  hairline: 'gap-px',      // 1px — institutional panel separator
  sm:       'gap-3',       // 12px
  md:       'gap-4',       // 16px
  lg:       'gap-6',       // 24px
};

// ── DashboardGrid ─────────────────────────────────────────────────────────────

export interface DashboardGridProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of equal-width columns */
  cols?: GridCols;
  /** Gap between cells */
  gap?: GridGap;
  /**
   * Whether columns respond to viewport width.
   * When true, stacks to 1-column on mobile and restores on larger screens.
   */
  responsive?: boolean;
  /** Minimum cell height applied via CSS */
  minCellHeight?: string;
}

export function DashboardGrid({
  children,
  cols = 3,
  gap = 'md',
  responsive = true,
  minCellHeight,
  className,
  style,
  ...rest
}: DashboardGridProps) {
  const colClass = responsive ? RESPONSIVE_COL[cols] : COL_CLASS[cols];

  // For hairline gaps the background-color of the grid container becomes
  // the visible 1px divider — children must set their own background.
  const isHairline = gap === 'hairline';

  return (
    <div
      className={cn(
        'grid',
        colClass,
        GAP_CLASS[gap],
        isHairline && 'bg-[var(--border-base)]',
        className
      )}
      style={{
        ...(minCellHeight ? { '--min-cell-height': minCellHeight } as React.CSSProperties : {}),
        ...style,
      }}
      {...rest}
    >
      {minCellHeight
        ? React.Children.map(children, (child) =>
            child ? (
              <div style={{ minHeight: minCellHeight }}>{child}</div>
            ) : null
          )
        : children}
    </div>
  );
}

// ── GridItem ──────────────────────────────────────────────────────────────────
// Optional wrapper for cells that need explicit column/row span.

export type ColSpan = 1 | 2 | 3 | 4 | 6 | 'full';
export type RowSpan = 1 | 2 | 3;

const COL_SPAN_CLASS: Record<ColSpan, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  6: 'col-span-6',
  full: 'col-span-full',
};

const ROW_SPAN_CLASS: Record<RowSpan, string> = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
};

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: ColSpan;
  rowSpan?: RowSpan;
}

export function GridItem({
  children,
  colSpan = 1,
  rowSpan = 1,
  className,
  ...rest
}: GridItemProps) {
  return (
    <div
      className={cn(
        COL_SPAN_CLASS[colSpan],
        rowSpan > 1 && ROW_SPAN_CLASS[rowSpan],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

// ── KPIRow ────────────────────────────────────────────────────────────────────
// Pre-configured grid specifically for KPI stat card rows.
// Uses hairline gaps and enforces equal-height cells.

export interface KPIRowProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: GridCols;
}

export function KPIRow({
  children,
  cols = 4,
  className,
  ...rest
}: KPIRowProps) {
  return (
    <DashboardGrid
      cols={cols}
      gap="hairline"
      responsive
      className={cn(
        'rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border-base)]',
        className
      )}
      {...rest}
    >
      {children}
    </DashboardGrid>
  );
}
